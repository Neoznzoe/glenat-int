import { fetchWithOAuth } from './oauth';

const JOB_OFFERS_BASE_URL = import.meta.env.DEV
  ? '/Api/v2.0/jobOffers'
  : `${import.meta.env.VITE_API_BASE_URL ?? 'https://api-dev.groupe-glenat.com'}/Api/v2.0/jobOffers`;

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

function extractResultArray(payload: Record<string, unknown>): RawJobOfferRecord[] {
  const resultAsArray = Array.isArray(payload.result)
    ? payload.result
    : toArrayIfArrayLike(payload.result);
  if (resultAsArray) {
    return resultAsArray as RawJobOfferRecord[];
  }
  // Format imbriqué: { success, code, message, result: { message, result: [...] } }
  if (payload.result && typeof payload.result === 'object') {
    const nested = (payload.result as Record<string, unknown>).result;
    const nestedAsArray = Array.isArray(nested) ? nested : toArrayIfArrayLike(nested);
    if (nestedAsArray) {
      return nestedAsArray as RawJobOfferRecord[];
    }
  }
  return [];
}

export async function fetchJobOffers(): Promise<JobOfferRecord[]> {
  const response = await fetchWithOAuth(JOB_OFFERS_BASE_URL);

  if (!response.ok) {
    throw new Error(
      `La récupération des offres d'emploi a échoué (${response.status}) ${response.statusText}`,
    );
  }

  const data = (await response.json()) as DatabaseJobOffersResponse;
  if (data.success === false) {
    throw new Error(data.message || "La récupération des offres d'emploi a échoué.");
  }

  const rawRecords = extractResultArray(data as Record<string, unknown>);

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
  // L'endpoint /count a un bug serveur (retourne 0).
  // On utilise la liste et on compte les résultats.
  const offers = await fetchJobOffers();
  return offers.length;
}

export const JOB_OFFER_COUNT_QUERY_KEY = ['job-offers', 'count'] as const;
