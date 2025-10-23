import { prepareJsonBody } from './transportEncryption';

const JOB_OFFERS_ENDPOINT = import.meta.env.DEV
  ? '/intranet/call-database'
  : 'https://api-dev.groupe-glenat.com/Api/v1.0/Intranet/callDatabase';

const JOB_OFFERS_QUERY = 'SELECT * FROM offres_emploi WHERE publiee = 1;';
const JOB_OFFER_COUNT_QUERY =
  'SELECT COUNT(*) AS nombre_offres FROM [jobOffers] WHERE publiee = 1;';

export interface DatabaseJobOffersResponse {
  success?: boolean;
  message?: string;
  result?: unknown;
  data?: unknown;
  [key: string]: unknown;
}

export interface JobOfferRecord {
  id: string;
  title: string;
  subtitle?: string;
  contractType?: string;
  contactEmail?: string;
  contactName?: string;
  location?: string;
  descriptionHtml?: string;
  resumeHtml?: string;
  missionHtml?: string;
  profilHtml?: string;
  advantagesHtml?: string;
  remunerationHtml?: string;
  publishedAt?: string;
  metadata?: Record<string, unknown>;
}

interface RawJobOfferRecord {
  [key: string]: unknown;
}

function ensureString(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
}

function normalizeId(value: unknown): string | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value.toString();
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) {
      return undefined;
    }
    const numericValue = Number.parseInt(trimmed, 10);
    if (Number.isFinite(numericValue)) {
      return numericValue.toString();
    }
    return trimmed;
  }
  return undefined;
}

function extractArray(payload: unknown): RawJobOfferRecord[] {
  const tryParse = (input: unknown): unknown => {
    if (Array.isArray(input)) {
      return input;
    }
    if (typeof input === 'string') {
      try {
        const parsed = JSON.parse(input) as unknown;
        return tryParse(parsed);
      } catch {
        return [];
      }
    }
    if (input && typeof input === 'object') {
      const objectPayload = input as Record<string, unknown>;
      if (Array.isArray(objectPayload.rows)) {
        return objectPayload.rows;
      }
      if (Array.isArray(objectPayload.data)) {
        return objectPayload.data;
      }
      if (Array.isArray(objectPayload.result)) {
        return objectPayload.result;
      }
      if (Array.isArray(objectPayload.recordset)) {
        return objectPayload.recordset;
      }
      if (Array.isArray(objectPayload.Recordset)) {
        return objectPayload.Recordset;
      }
      if (Array.isArray(objectPayload.recordsets)) {
        const [first] = objectPayload.recordsets as unknown[];
        if (Array.isArray(first)) {
          return first;
        }
      }
      if ('records' in objectPayload && Array.isArray(objectPayload.records)) {
        return objectPayload.records;
      }
    }
    return [];
  };

  const arrayCandidate = tryParse(payload);
  return Array.isArray(arrayCandidate)
    ? (arrayCandidate.filter((item) => item && typeof item === 'object') as RawJobOfferRecord[])
    : [];
}

function normalizeJobOffer(raw: RawJobOfferRecord): JobOfferRecord | null {
  const id = normalizeId(raw.id ?? raw.ID ?? raw.Id ?? raw.offre_id);
  if (!id) {
    return null;
  }

  const titre = ensureString(raw.titre);
  const poste = ensureString(raw.poste);
  const title = titre ?? poste ?? `Offre n°${id}`;
  const subtitle = poste ?? titre;

  const contractType = ensureString(raw.type ?? raw.contrat);
  const contactEmail = ensureString(raw.email ?? raw.contact_email);
  const contactName = ensureString(raw.nom ?? raw.contact_nom);
  const location =
    ensureString(raw.lieux ?? raw.lieu ?? raw.ville ?? raw.adresse) ?? undefined;
  const descriptionHtml = ensureString(raw.text ?? raw.description ?? raw.contenu);
  const resumeHtml = ensureString(raw.resume ?? raw.resume_html ?? raw.presentation);
  const missionHtml = ensureString(raw.mission ?? raw.mission_html ?? raw.missions);
  const profilHtml = ensureString(raw.profil ?? raw.profil_html ?? raw.profil_recherche);
  const advantagesHtml = ensureString(raw.avantages ?? raw.avantages_html);
  const remunerationHtml = ensureString(raw.remuneration ?? raw.remuneration_html);
  const publishedAt = ensureString(
    raw.date_publication ??
      raw.datePublication ??
      raw.publiee_le ??
      raw.date_publication_at ??
      raw.published_at,
  );

  const knownKeys = new Set([
    'id',
    'ID',
    'Id',
    'offre_id',
    'titre',
    'poste',
    'type',
    'contrat',
    'email',
    'contact_email',
    'nom',
    'contact_nom',
    'lieux',
    'lieu',
    'ville',
    'adresse',
    'text',
    'description',
    'contenu',
    'resume',
    'resume_html',
    'presentation',
    'mission',
    'mission_html',
    'missions',
    'profil',
    'profil_html',
    'profil_recherche',
    'avantages',
    'avantages_html',
    'remuneration',
    'remuneration_html',
    'date_publication',
    'datePublication',
    'publiee_le',
    'date_publication_at',
    'published_at',
    'publiee',
  ]);

  const metadataEntries = Object.entries(raw).filter(
    ([key]) => !knownKeys.has(key),
  );
  const metadata = metadataEntries.length
    ? Object.fromEntries(metadataEntries)
    : undefined;

  return {
    id,
    title,
    subtitle,
    contractType,
    contactEmail,
    contactName,
    location,
    descriptionHtml,
    resumeHtml,
    missionHtml,
    profilHtml,
    advantagesHtml,
    remunerationHtml,
    publishedAt,
    metadata,
  };
}

export async function fetchJobOffers(): Promise<JobOfferRecord[]> {
  const preparedBody = await prepareJsonBody({ query: JOB_OFFERS_QUERY });
  const response = await fetch(JOB_OFFERS_ENDPOINT, {
    method: 'POST',
    headers: preparedBody.headers,
    body: preparedBody.body,
  });

  if (!response.ok) {
    throw new Error(
      `La récupération des offres d'emploi a échoué (${response.status}) ${response.statusText}`,
    );
  }

  const data = (await response.json()) as DatabaseJobOffersResponse;
  if (data.success === false) {
    throw new Error(data.message || "La récupération des offres d'emploi a échoué.");
  }

  let rawRecords = extractArray(data.result);
  if (!rawRecords.length) {
    rawRecords = extractArray(data.data);
  }
  if (!rawRecords.length) {
    rawRecords = extractArray(data as unknown);
  }

  const offers: JobOfferRecord[] = [];
  for (const record of rawRecords) {
    const normalized = normalizeJobOffer(record);
    if (normalized) {
      offers.push(normalized);
    }
  }

  return offers;
}

export const JOB_OFFERS_QUERY_KEY = ['job-offers'] as const;

export async function fetchPublishedJobOfferCount(): Promise<number> {
  const preparedBody = await prepareJsonBody({ query: JOB_OFFER_COUNT_QUERY });
  const response = await fetch(JOB_OFFERS_ENDPOINT, {
    method: 'POST',
    headers: preparedBody.headers,
    body: preparedBody.body,
  });

  if (!response.ok) {
    throw new Error(
      `La récupération du nombre d'offres d'emploi a échoué (${response.status}) ${response.statusText}`,
    );
  }

  const data = (await response.json()) as DatabaseJobOffersResponse;
  if (data.success === false) {
    throw new Error(data.message || "La récupération du nombre d'offres d'emploi a échoué.");
  }

  let rawRecords = extractArray(data.result);
  if (!rawRecords.length) {
    rawRecords = extractArray(data.data);
  }
  if (!rawRecords.length) {
    rawRecords = extractArray(data as unknown);
  }

  const [firstRecord] = rawRecords;
  if (!firstRecord) {
    return 0;
  }

  const countCandidates = [
    firstRecord['nombre_offres'],
    firstRecord['nombreOffres'],
    firstRecord['NombreOffres'],
    firstRecord['count'],
    firstRecord['Count'],
    firstRecord['total'],
    firstRecord['Total'],
  ];

  const parseCandidate = (input: unknown): number | null => {
    if (typeof input === 'number' && Number.isFinite(input) && input >= 0) {
      return Math.trunc(input);
    }
    if (typeof input === 'string') {
      const trimmed = input.trim();
      if (!trimmed) {
        return null;
      }
      const parsed = Number.parseInt(trimmed, 10);
      if (!Number.isNaN(parsed) && parsed >= 0) {
        return parsed;
      }
    }
    return null;
  };

  for (const candidate of countCandidates) {
    const parsed = parseCandidate(candidate);
    if (parsed !== null) {
      return parsed;
    }
  }

  for (const value of Object.values(firstRecord)) {
    const parsed = parseCandidate(value);
    if (parsed !== null) {
      return parsed;
    }
  }

  return 0;
}

export const JOB_OFFER_COUNT_QUERY_KEY = ['job-offers', 'count'] as const;

export { JOB_OFFERS_ENDPOINT, JOB_OFFERS_QUERY, JOB_OFFER_COUNT_QUERY };
