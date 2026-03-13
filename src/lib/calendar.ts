import { fetchWithOAuth } from './oauth';

const CALENDAR_API_BASE = import.meta.env.DEV
  ? '/Api/v2.0/calendar'
  : 'https://api-dev.groupe-glenat.com/Api/v2.0/calendar';

export interface CalendarEventColorRecord {
  reason: string;
  name: string;
  lastName: string;
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

type RawRecord = Record<string, unknown>;

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

  // Gérer les objets date PHP/SQL Server avec structure {date: string, timezone_type: number, timezone: string}
  if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
    const dateObj = value as Record<string, unknown>;
    if (typeof dateObj.date === 'string') {
      // Extraire la chaîne de date de l'objet
      value = dateObj.date;
    }
  }

  const formatLocalDateTime = (date: Date) => {
    const pad = (component: number) => component.toString().padStart(2, '0');
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());
    const hasTime =
      date.getHours() !== 0 ||
      date.getMinutes() !== 0 ||
      date.getSeconds() !== 0 ||
      date.getMilliseconds() !== 0;

    return hasTime ? `${year}-${month}-${day}T${hours}:${minutes}:${seconds}` : `${year}-${month}-${day}`;
  };

  const normalizeDateLikeString = (input: string): string | undefined => {
    if (!input) {
      return undefined;
    }

    const trimmed = input.trim();
    if (!trimmed) {
      return undefined;
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return trimmed;
    }

    const dateTimeMatch = trimmed.match(
      /^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2})(?::(\d{2}))?(?:\.\d+)?$/,
    );
    if (dateTimeMatch) {
      const [, datePart, timePart, secondsPart] = dateTimeMatch;
      const normalisedSeconds = secondsPart ?? '00';
      return `${datePart}T${timePart}:${normalisedSeconds}`;
    }

    const hasTimezone = /[zZ]|[+-]\d{2}:?\d{2}$/.test(trimmed);
    const timestamp = Date.parse(trimmed);
    if (Number.isNaN(timestamp)) {
      return undefined;
    }

    const parsedDate = new Date(timestamp);
    return hasTimezone ? parsedDate.toISOString() : formatLocalDateTime(parsedDate);
  };

  if (value instanceof Date) {
    return formatLocalDateTime(value);
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return formatLocalDateTime(new Date(value));
  }

  if (typeof value === 'string') {
    return normalizeDateLikeString(value);
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
    record['lastName'],
    record['LastName'],
    record['lastname'],
    record['LASTNAME'],
    record['last_name'],
    record['LAST_NAME'],
    record['nom'],
    record['Nom'],
    record['NOM'],
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

  const startDate = toOptionalIsoDate(
    record['DATE_DEBUT'] ??
      record['DateDebut'] ??
      record['dateDebut'] ??
      record['date_debut'] ??
      record['DATEDEBUT'] ??
      record['startDate'] ??
      record['StartDate'],
  );

  if (!startDate) {
    return null;
  }

  const endDate = toOptionalIsoDate(
    record['DATE_FIN'] ??
      record['DateFin'] ??
      record['dateFin'] ??
      record['date_fin'] ??
      record['DATEFIN'] ??
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
  const lastNameCandidate =
    toNonEmptyString(record['lastName']) ??
    toNonEmptyString(record['LastName']) ??
    toNonEmptyString(record['LASTNAME']) ??
    toNonEmptyString(record['last_name']) ??
    toNonEmptyString(record['LAST_NAME']) ??
    toNonEmptyString(record['nom']) ??
    toNonEmptyString(record['Nom']) ??
    toNonEmptyString(record['NOM']);
  const colorCandidate =
    toNonEmptyString(record['COULEUR']) ??
    toNonEmptyString(record['couleur']) ??
    toNonEmptyString(record['Couleur']) ??
    toNonEmptyString(record['color']) ??
    toNonEmptyString(record['Color']) ??
    toNonEmptyString(record['hex']) ??
    toNonEmptyString(record['Hex']);

  if (!reason || !colorCandidate) {
    return null;
  }

  const name = nameCandidate ?? reason;
  const lastName = lastNameCandidate ?? name;

  return {
    reason,
    name,
    lastName,
    color: colorCandidate,
    createdAt: toOptionalIsoDate(record['createdAt'] ?? record['CreatedAt']),
    updatedAt: toOptionalIsoDate(record['updatedAt'] ?? record['UpdatedAt']),
  };
}

/**
 * Convertit un objet avec des clés numériques en tableau.
 * PHP peut sérialiser les tableaux séquentiels comme des objets : {"0": {...}, "1": {...}, ...}
 */
function toArrayIfArrayLike(value: unknown): unknown[] | null {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== 'object') return null;
  const keys = Object.keys(value as Record<string, unknown>);
  if (keys.length === 0) return null;
  const allNumeric = keys.every((k) => /^\d+$/.test(k));
  if (!allNumeric) return null;
  const sorted = keys.map(Number).sort((a, b) => a - b);
  if (sorted[0] !== 0 || sorted[sorted.length - 1] !== sorted.length - 1) return null;
  return sorted.map((i) => (value as Record<string, unknown>)[String(i)]);
}

function extractResultArray(payload: Record<string, unknown>): RawRecord[] {
  // Format direct: { success, code, message, result: [...] } ou objet à clés numériques
  const resultAsArray = Array.isArray(payload.result)
    ? payload.result
    : toArrayIfArrayLike(payload.result);
  if (resultAsArray) {
    return resultAsArray as RawRecord[];
  }
  // Format imbriqué: { success, code, message, result: { message, result: [...] } }
  if (payload.result && typeof payload.result === 'object') {
    const nested = (payload.result as Record<string, unknown>).result;
    const nestedAsArray = Array.isArray(nested) ? nested : toArrayIfArrayLike(nested);
    if (nestedAsArray) {
      return nestedAsArray as RawRecord[];
    }
  }
  // Fallback: chercher dans data
  const dataAsArray = Array.isArray(payload.data) ? payload.data : toArrayIfArrayLike(payload.data);
  if (dataAsArray) {
    return dataAsArray as RawRecord[];
  }
  return [];
}

export async function fetchCalendarEventColors(): Promise<CalendarEventColorRecord[]> {
  const response = await fetchWithOAuth(`${CALENDAR_API_BASE}/event-colors`);

  if (!response.ok) {
    throw new Error(
      `La récupération des couleurs du calendrier a échoué (${response.status}) ${response.statusText}`,
    );
  }

  const payload = (await response.json()) as Record<string, unknown>;
  if (payload.success === false) {
    throw new Error((payload.message as string) || 'La récupération des couleurs du calendrier a échoué.');
  }

  const records = extractResultArray(payload);
  const colors: CalendarEventColorRecord[] = [];
  for (const record of records) {
    const normalized = normalizeCalendarEventColor(record);
    if (normalized) {
      colors.push(normalized);
    }
  }

  return colors;
}

export async function fetchCalendarEvents(): Promise<CalendarEventRecord[]> {
  const response = await fetchWithOAuth(`${CALENDAR_API_BASE}/events`);

  if (!response.ok) {
    throw new Error(
      `La récupération des événements du calendrier a échoué (${response.status}) ${response.statusText}`,
    );
  }

  const payload = (await response.json()) as Record<string, unknown>;
  if (payload.success === false) {
    throw new Error((payload.message as string) || 'La récupération des événements du calendrier a échoué.');
  }

  const records = extractResultArray(payload);

  const events: CalendarEventRecord[] = [];
  for (const record of records) {
    const normalized = normalizeCalendarEvent(record);
    if (normalized) {
      events.push(normalized);
    }
  }

  return events;
}

export const CALENDAR_EVENT_COLORS_QUERY_KEY = ['calendar', 'event-colors'] as const;
export const CALENDAR_EVENTS_QUERY_KEY = ['calendar', 'events'] as const;
