import { fetchWithOAuth } from './oauth';
import {
  applySecurePayloadHeaders,
  logSecurePayloadRequest,
  prepareSecureJsonPayload,
} from './securePayload';

const CALENDAR_DATABASE_ENDPOINT =
  import.meta.env.VITE_CALENDAR_DATABASE_ENDPOINT ??
  (import.meta.env.DEV
    ? '/intranet/call-database'
    : 'https://api-dev.groupe-glenat.com/Api/v1.0/Intranet/callDatabase');

const CALENDAR_EVENT_COLORS_QUERY = 'SELECT * FROM [calendarEventColor];';
const CALENDAR_EVENTS_QUERY = `SELECT *, 'Ancien (2 ans)' AS Categorie
FROM [calendarEvent]
WHERE YEAR([DATE_DEBUT]) = YEAR(GETDATE()) - 2

UNION ALL

SELECT *, 'Actuel ou futur' AS Categorie
FROM [calendarEvent]
WHERE YEAR([DATE_DEBUT]) >= YEAR(GETDATE());`;

export interface CalendarEventColorRecord {
  reason: string;
  name: string;
  color: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CalendarEventRecord {
  id: string;
  reason?: string;
  title: string;
  subtitle?: string;
  description?: string;
  startDate: string;
  endDate?: string;
  registrationDeadline?: string;
  publicationDate?: string;
  category: string;
  location?: string;
  link?: string;
  metadata?: Record<string, unknown>;
}

interface RawDatabaseResponse {
  success?: boolean;
  message?: string;
  result?: unknown;
  data?: unknown;
  rows?: unknown;
  recordset?: unknown;
  Recordset?: unknown;
  recordsets?: unknown;
  records?: unknown;
  [key: string]: unknown;
}

type RawRecord = Record<string, unknown>;

function extractArray(payload: unknown): RawRecord[] {
  const tryParse = (value: unknown): unknown => {
    if (Array.isArray(value)) {
      return value;
    }
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value) as unknown;
        return tryParse(parsed);
      } catch {
        return [];
      }
    }
    if (value && typeof value === 'object') {
      const record = value as Record<string, unknown>;
      if (Array.isArray(record.rows)) {
        return record.rows;
      }
      if (Array.isArray(record.data)) {
        return record.data;
      }
      if (Array.isArray(record.result)) {
        return record.result;
      }
      if (Array.isArray(record.recordset)) {
        return record.recordset;
      }
      if (Array.isArray(record.Recordset)) {
        return record.Recordset;
      }
      if (Array.isArray(record.recordsets)) {
        const [first] = record.recordsets as unknown[];
        if (Array.isArray(first)) {
          return first;
        }
      }
      if (Array.isArray(record.records)) {
        return record.records;
      }
    }
    return [];
  };

  const arrayCandidate = tryParse(payload);
  return Array.isArray(arrayCandidate)
    ? (arrayCandidate.filter((item) => item && typeof item === 'object') as RawRecord[])
    : [];
}

function toNonEmptyString(value: unknown): string | undefined {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length ? trimmed : undefined;
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value.toString();
  }
  return undefined;
}

function toOptionalIsoDate(value: unknown): string | undefined {
  if (!value && value !== 0) {
    return undefined;
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return new Date(value).toISOString();
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) {
      return undefined;
    }
    const timestamp = Date.parse(trimmed);
    if (!Number.isNaN(timestamp)) {
      return new Date(timestamp).toISOString();
    }
  }
  return undefined;
}

function normalizeIdentifier(record: RawRecord): string | undefined {
  const candidates = [
    record['id'],
    record['ID'],
    record['Id'],
    record['id_event'],
    record['ID_EVENT'],
    record['event_id'],
    record['EVENT_ID'],
    record['calendarEventId'],
    record['CalendarEventId'],
    record['CalendarEventID'],
    record['eventId'],
  ];

  for (const candidate of candidates) {
    const asString = toNonEmptyString(candidate);
    if (asString) {
      return asString;
    }
  }
  return undefined;
}

function normalizeReason(record: RawRecord): string | undefined {
  const candidates = [record['reason'], record['Reason'], record['raison'], record['code']];
  for (const candidate of candidates) {
    const asString = toNonEmptyString(candidate);
    if (asString) {
      return asString;
    }
  }
  return undefined;
}

function normalizeTitle(record: RawRecord): string {
  const candidates = [
    record['titre'],
    record['Titre'],
    record['title'],
    record['Title'],
    record['intitule'],
    record['INTITULE'],
    record['label'],
  ];

  for (const candidate of candidates) {
    const asString = toNonEmptyString(candidate);
    if (asString) {
      return asString;
    }
  }

  const fallbackId = normalizeIdentifier(record) ?? 'evenement';
  return `Évènement ${fallbackId}`;
}

function normalizeSubtitle(record: RawRecord): string | undefined {
  const candidates = [
    record['sous_titre'],
    record['SOUS_TITRE'],
    record['sousTitre'],
    record['SousTitre'],
    record['subtitle'],
    record['Subtitle'],
  ];

  for (const candidate of candidates) {
    const asString = toNonEmptyString(candidate);
    if (asString) {
      return asString;
    }
  }
  return undefined;
}

function normalizeDescription(record: RawRecord): string | undefined {
  const candidates = [
    record['descriptif'],
    record['DESCRIPTIF'],
    record['description'],
    record['Description'],
    record['contenu'],
    record['content'],
    record['resume'],
  ];

  for (const candidate of candidates) {
    const asString = toNonEmptyString(candidate);
    if (asString) {
      return asString;
    }
  }
  return undefined;
}

function normalizeLocation(record: RawRecord): string | undefined {
  const candidates = [
    record['lieu'],
    record['LIEU'],
    record['location'],
    record['Localisation'],
    record['LocalisationEvenement'],
    record['adresse'],
  ];

  for (const candidate of candidates) {
    const asString = toNonEmptyString(candidate);
    if (asString) {
      return asString;
    }
  }
  return undefined;
}

function normalizeLink(record: RawRecord): string | undefined {
  const candidates = [
    record['lien'],
    record['LIEN'],
    record['url'],
    record['URL'],
    record['link'],
  ];

  for (const candidate of candidates) {
    const asString = toNonEmptyString(candidate);
    if (asString) {
      return asString;
    }
  }
  return undefined;
}

function normalizeCategory(record: RawRecord): string {
  const candidates = [
    record['categorie'],
    record['Categorie'],
    record['category'],
    record['Category'],
  ];

  for (const candidate of candidates) {
    const asString = toNonEmptyString(candidate);
    if (asString) {
      return asString;
    }
  }

  return 'Actuel ou futur';
}

function collectMetadata(record: RawRecord): Record<string, unknown> | undefined {
  const knownKeys = new Set([
    'id',
    'ID',
    'Id',
    'id_event',
    'ID_EVENT',
    'event_id',
    'EVENT_ID',
    'calendarEventId',
    'CalendarEventId',
    'CalendarEventID',
    'eventId',
    'reason',
    'Reason',
    'raison',
    'code',
    'titre',
    'Titre',
    'title',
    'Title',
    'intitule',
    'INTITULE',
    'label',
    'sous_titre',
    'SOUS_TITRE',
    'sousTitre',
    'SousTitre',
    'subtitle',
    'Subtitle',
    'descriptif',
    'DESCRIPTIF',
    'description',
    'Description',
    'contenu',
    'content',
    'resume',
    'lieu',
    'LIEU',
    'location',
    'Localisation',
    'LocalisationEvenement',
    'adresse',
    'lien',
    'LIEN',
    'url',
    'URL',
    'link',
    'categorie',
    'Categorie',
    'category',
    'Category',
    'DATE_DEBUT',
    'DateDebut',
    'dateDebut',
    'date_debut',
    'DATE_FIN',
    'DateFin',
    'date_fin',
    'dateFin',
    'DATE_FIN_INSCR',
    'DateFinInscr',
    'date_fin_inscr',
    'DATE_PUBLICATION',
    'DatePublication',
    'date_publication',
  ]);

  const metadataEntries = Object.entries(record).filter(
    ([key]) => !knownKeys.has(key),
  );

  return metadataEntries.length ? Object.fromEntries(metadataEntries) : undefined;
}

function normalizeCalendarEvent(record: RawRecord): CalendarEventRecord | null {
  const title = normalizeTitle(record);
  const id = normalizeIdentifier(record) ?? `${normalizeReason(record) ?? 'event'}-${title}`;
  const startDate =
    toOptionalIsoDate(
      record['DATE_DEBUT'] ??
        record['DateDebut'] ??
        record['dateDebut'] ??
        record['date_debut'] ??
        record['startDate'] ??
        record['StartDate'],
    ) ?? new Date().toISOString();

  const endDate = toOptionalIsoDate(
    record['DATE_FIN'] ??
      record['DateFin'] ??
      record['dateFin'] ??
      record['date_fin'] ??
      record['endDate'] ??
      record['EndDate'],
  );

  const registrationDeadline = toOptionalIsoDate(
    record['DATE_FIN_INSCR'] ??
      record['DateFinInscr'] ??
      record['date_fin_inscr'] ??
      record['registrationDeadline'] ??
      record['RegistrationDeadline'],
  );

  const publicationDate = toOptionalIsoDate(
    record['DATE_PUBLICATION'] ??
      record['DatePublication'] ??
      record['date_publication'] ??
      record['publicationDate'] ??
      record['PublicationDate'],
  );

  return {
    id,
    reason: normalizeReason(record),
    title,
    subtitle: normalizeSubtitle(record),
    description: normalizeDescription(record),
    startDate,
    endDate,
    registrationDeadline,
    publicationDate,
    category: normalizeCategory(record),
    location: normalizeLocation(record),
    link: normalizeLink(record),
    metadata: collectMetadata(record),
  };
}

function normalizeCalendarEventColor(record: RawRecord): CalendarEventColorRecord | null {
  const reason = normalizeReason(record);
  const nameCandidate =
    toNonEmptyString(record['name']) ??
    toNonEmptyString(record['Name']) ??
    toNonEmptyString(record['label']) ??
    toNonEmptyString(record['Label']);
  const colorCandidate =
    toNonEmptyString(record['color']) ??
    toNonEmptyString(record['Color']) ??
    toNonEmptyString(record['hex']) ??
    toNonEmptyString(record['Hex']);

  if (!reason || !colorCandidate) {
    return null;
  }

  const name = nameCandidate ?? reason;

  return {
    reason,
    name,
    color: colorCandidate,
    createdAt: toOptionalIsoDate(record['createdAt'] ?? record['CreatedAt']),
    updatedAt: toOptionalIsoDate(record['updatedAt'] ?? record['UpdatedAt']),
  };
}

async function executeCalendarQuery(query: string): Promise<RawDatabaseResponse> {
  const requestPayload = { query };
  const securePayload = await prepareSecureJsonPayload(requestPayload);
  const headers = new Headers({ 'Content-Type': 'application/json' });
  applySecurePayloadHeaders(headers, securePayload.encrypted);
  logSecurePayloadRequest(
    CALENDAR_DATABASE_ENDPOINT,
    requestPayload,
    securePayload.body,
    securePayload.encrypted,
  );

  const response = await fetchWithOAuth(CALENDAR_DATABASE_ENDPOINT, {
    method: 'POST',
    headers,
    body: securePayload.body,
  });

  if (!response.ok) {
    throw new Error(
      `La récupération des données du calendrier a échoué (${response.status}) ${response.statusText}`,
    );
  }

  const payload = (await response.json()) as RawDatabaseResponse;
  if (payload.success === false) {
    throw new Error(payload.message || 'La récupération des données du calendrier a échoué.');
  }

  return payload;
}

export async function fetchCalendarEventColors(): Promise<CalendarEventColorRecord[]> {
  const response = await executeCalendarQuery(CALENDAR_EVENT_COLORS_QUERY);

  let rawRecords = extractArray(response.result);
  if (!rawRecords.length) {
    rawRecords = extractArray(response.data);
  }
  if (!rawRecords.length) {
    rawRecords = extractArray(response.rows);
  }
  if (!rawRecords.length) {
    rawRecords = extractArray(response);
  }

  const colors: CalendarEventColorRecord[] = [];
  for (const record of rawRecords) {
    const normalized = normalizeCalendarEventColor(record);
    if (normalized) {
      colors.push(normalized);
    }
  }

  return colors;
}

export async function fetchCalendarEvents(): Promise<CalendarEventRecord[]> {
  const response = await executeCalendarQuery(CALENDAR_EVENTS_QUERY);

  let rawRecords = extractArray(response.result);
  if (!rawRecords.length) {
    rawRecords = extractArray(response.data);
  }
  if (!rawRecords.length) {
    rawRecords = extractArray(response.rows);
  }
  if (!rawRecords.length) {
    rawRecords = extractArray(response);
  }

  const events: CalendarEventRecord[] = [];
  for (const record of rawRecords) {
    const normalized = normalizeCalendarEvent(record);
    if (normalized) {
      events.push(normalized);
    }
  }

  return events;
}

export const CALENDAR_EVENT_COLORS_QUERY_KEY = ['calendar', 'event-colors'] as const;
export const CALENDAR_EVENTS_QUERY_KEY = ['calendar', 'events'] as const;
