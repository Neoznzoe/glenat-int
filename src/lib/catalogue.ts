import UniversBD from '@/assets/logos/univers/univers-bd.svg';
import UniversJeune from '@/assets/logos/univers/univers-jeunesse.svg';
import UniversLivre from '@/assets/logos/univers/univers-livres.svg';
import UniversManga from '@/assets/logos/univers/univers-manga.svg';
import type { BookCardProps } from '@/components/BookCard';

export interface CatalogueBookDetailEntry {
  label: string;
  value: string;
}

export interface CatalogueBookStat {
  label: string;
  value: string;
  helper?: string;
}

export interface CatalogueBookDetail {
  subtitle?: string;
  badges?: string[];
  contributors?: CatalogueBookContributor[];
  metadata: CatalogueBookDetailEntry[];
  specifications: CatalogueBookDetailEntry[];
  stats: CatalogueBookStat[];
  recommendedAge?: string;
  officeCode?: string;
  categories?: string[];
  priceTTC?: string;
  availabilityStatus?: string;
  availabilityNote?: string;
  availabilityDate?: string;
  relatedEans?: string[];
  summary?: string;
  authorBio?: string;
}

export interface CatalogueBookContributor {
  name: string;
  role: string;
}

export interface CatalogueBook extends BookCardProps {
  creationDate?: string;
  details?: CatalogueBookDetail;
}

export interface CatalogueEdition {
  title: string;
  color: string;
  logo: string;
}

export interface CatalogueReleaseGroup {
  date: string;
  books: CatalogueBook[];
}

export interface CatalogueOfficeGroup {
  office: string;
  date: string;
  shipping: string;
  books: CatalogueBook[];
}

export interface HydrateCatalogueOfficeGroupsOptions {
  onCoverProgress?: (groups: CatalogueOfficeGroup[]) => void;
}

export interface FetchCatalogueOfficesOptions extends HydrateCatalogueOfficeGroupsOptions {
  hydrateCovers?: boolean;
}

export interface CatalogueKiosqueGroup {
  office: string;
  date: string;
  shipping: string;
  books: CatalogueBook[];
}

const CATALOGUE_DATABASE_ENDPOINT = import.meta.env.DEV
  ? '/intranet/callDatabase'
  : 'https://api-dev.groupe-glenat.com/Api/v1.0/Intranet/callDatabase';

const env = import.meta.env as Record<string, string | undefined>;

const DEFAULT_RECENT_BOOKS_SQL_QUERY = `
WITH ranked AS (
    SELECT *,
           ROW_NUMBER() OVER (
               PARTITION BY COALESCE(NULLIF(LTRIM(RTRIM(codeEAN)), ''), NULLIF(LTRIM(RTRIM(idArticle)), ''))
               ORDER BY COALESCE(dateMev, dateParution, CAST('1900-01-01' AS date)) DESC
           ) AS rn
    FROM dbo.cataLivres
    WHERE (NULLIF(LTRIM(RTRIM(codeEAN)), '') IS NOT NULL)
       OR (NULLIF(LTRIM(RTRIM(idArticle)), '') IS NOT NULL)
)
SELECT TOP (200) *
FROM ranked
WHERE rn = 1
ORDER BY COALESCE(dateMev, dateParution, CAST('1900-01-01' AS date)) DESC,
         COALESCE(titre, libelle, libelleShort, codeEAN, idArticle) ASC;`;

const DEFAULT_UPCOMING_RELEASES_SQL_QUERY = `
WITH upcoming AS (
    SELECT *,
           ROW_NUMBER() OVER (
               PARTITION BY COALESCE(NULLIF(LTRIM(RTRIM(codeEAN)), ''), NULLIF(LTRIM(RTRIM(idArticle)), ''))
               ORDER BY COALESCE(dateMev, dateParution, CAST('1900-01-01' AS date)) DESC
           ) AS rn
    FROM dbo.cataLivres
    WHERE COALESCE(dateMev, dateParution) >= DATEADD(day, -30, CONVERT(date, GETDATE()))
      AND COALESCE(dateMev, dateParution) < DATEADD(year, 1, CONVERT(date, GETDATE()))
)
SELECT *
FROM upcoming
WHERE rn = 1
ORDER BY COALESCE(dateMev, dateParution, CAST('1900-01-01' AS date)) DESC,
         COALESCE(titre, libelle, libelleShort, codeEAN, idArticle) ASC;`;

const DEFAULT_KIOSQUES_SQL_QUERY = `
WITH kiosque AS (
    SELECT *,
           ROW_NUMBER() OVER (
               PARTITION BY COALESCE(NULLIF(LTRIM(RTRIM(codeEAN)), ''), NULLIF(LTRIM(RTRIM(idArticle)), ''))
               ORDER BY COALESCE(dateMev, dateParution, CAST('1900-01-01' AS date)) DESC
           ) AS rn
    FROM dbo.cataLivres
    WHERE (
        UPPER(ISNULL(canal, '')) LIKE '%KIOSQUE%'
        OR UPPER(ISNULL(typeDiffusion, '')) LIKE '%KIOSQUE%'
        OR UPPER(ISNULL(typePointVente, '')) LIKE '%KIOSQUE%'
    )
      AND COALESCE(dateMev, dateParution) >= DATEADD(day, -90, CONVERT(date, GETDATE()))
)
SELECT *
FROM kiosque
WHERE rn = 1
ORDER BY COALESCE(dateMev, dateParution, CAST('1900-01-01' AS date)) DESC,
         COALESCE(titre, libelle, libelleShort, codeEAN, idArticle) ASC;`;

const DEFAULT_EDITION_LABELS_SQL_QUERY = `
SELECT DISTINCT
       COALESCE(NULLIF(LTRIM(RTRIM(marque)), ''), NULLIF(LTRIM(RTRIM(editeur)), ''), NULLIF(LTRIM(RTRIM(publisher)), '')) AS editionLabel
FROM dbo.cataLivres
WHERE COALESCE(NULLIF(LTRIM(RTRIM(marque)), ''), NULLIF(LTRIM(RTRIM(editeur)), ''), NULLIF(LTRIM(RTRIM(publisher)), '')) IS NOT NULL
ORDER BY editionLabel ASC;`;

const NEXT_OFFICES_SQL_QUERY = `;WITH next_offices AS (
    SELECT TOP (4)
           office,
           MIN(dateMev) AS nextDate
    FROM dbo.cataLivres
    WHERE dateMev >= CONVERT(date, GETDATE())
      AND dateMev >= '20000101'
      AND dateMev < DATEADD(year, 5, CONVERT(date, GETDATE()))
      AND office <> '0000'
    GROUP BY office
    ORDER BY MIN(dateMev) ASC, office ASC
)
SELECT c.*
FROM dbo.cataLivres AS c
JOIN next_offices AS n
  ON n.office = c.office
ORDER BY n.nextDate ASC, n.office ASC, c.dateMev ASC;`;

const FALLBACK_COVER_DATA_URL =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 300" preserveAspectRatio="xMidYMid meet"><rect width="200" height="300" fill="#f4f4f5"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="16" fill="#a1a1aa">Couverture indisponible</text></svg>',
  );

type RawCatalogueRecord = Record<string, unknown>;

interface DatabaseApiResponse {
  success?: boolean;
  message?: string;
  result?: unknown;
  data?: unknown;
  recordset?: unknown;
  recordsets?: unknown;
  rows?: unknown;
  [key: string]: unknown;
}

const logRequest = (endpoint: string) => {
  console.info(`[catalogueApi] ${endpoint} appelé`);
};

const logResponse = (endpoint: string, payload: unknown) => {
  console.info(`[catalogueApi] ${endpoint} réponse`, payload);
};

const parseEndpointList = (value: unknown): string[] => {
  if (typeof value !== 'string') {
    return [];
  }

  return value
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);
};

const resolveCoverageEndpoints = (): string[] => {
  const overrides = parseEndpointList(env.VITE_CATALOGUE_COVER_ENDPOINT);
  if (overrides.length > 0) {
    return overrides;
  }

  if (import.meta.env.DEV) {
    return ['/extranet/couverture'];
  }

  const endpoints = new Set<string>();

  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname.toLowerCase();

    if (hostname.includes('intranet')) {
      endpoints.add('https://api-dev.groupe-glenat.com/Api/v1.0/Extranet/couverture');
    }
  }

  endpoints.add('https://api-recette.groupe-glenat.com/Api/v1.0/Extranet/couverture');

  return Array.from(endpoints);
};

const CATALOGUE_COVERAGE_ENDPOINTS = resolveCoverageEndpoints();

const wait = (ms: number) =>
  new Promise<void>(resolve => {
    setTimeout(resolve, ms);
  });

const COVER_FETCH_RETRY_ATTEMPTS = 3;
const COVER_FETCH_RETRY_DELAY_MS = 150;

const coverCache = new Map<string, string>();
const pendingCoverRequests = new Map<string, Promise<string | null>>();

let lastCoverFetch: Promise<unknown> = Promise.resolve();

const shouldIncludeCredentials = (endpoint: string): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    const base = window.location.origin ?? 'https://groupe-glenat.com';
    const url = new URL(endpoint, base);

    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return false;
    }

    const hostname = url.hostname.toLowerCase();
    const currentHost = window.location.hostname.toLowerCase();

    if (hostname === currentHost) {
      return true;
    }

    if (hostname.includes('api-dev.groupe-glenat.com')) {
      return true;
    }

    return false;
  } catch (error) {
    console.warn('[catalogueApi] Impossible de déterminer le domaine pour la couverture', endpoint, error);
    return false;
  }
};

const buildCoverRequestInit = (endpoint: string): RequestInit => {
  const init: RequestInit = {
    method: 'GET',
    headers: { Accept: 'application/json' },
  };

  if (shouldIncludeCredentials(endpoint)) {
    init.credentials = 'include';
  }

  return init;
};

const normaliseCoverDataUrl = (value: string | undefined): string | null => {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  if (trimmed.startsWith('data:')) {
    return trimmed;
  }

  return `data:image/jpeg;base64,${trimmed}`;
};

const fetchCover = async (ean: string): Promise<string | null> => {
  if (!ean) {
    return null;
  }

  const cachedCover = coverCache.get(ean);
  if (cachedCover) {
    return cachedCover;
  }

  const pendingRequest = pendingCoverRequests.get(ean);
  if (pendingRequest) {
    return pendingRequest;
  }

  const previousFetch = lastCoverFetch;
  const request = (async () => {
    await previousFetch.catch(() => {});
    await wait(3);

    for (let attempt = 0; attempt < COVER_FETCH_RETRY_ATTEMPTS; attempt += 1) {
      for (const endpoint of CATALOGUE_COVERAGE_ENDPOINTS) {
        const url = `${endpoint}${endpoint.includes('?') ? '&' : '?'}ean=${encodeURIComponent(ean)}`;

        try {
          const response = await fetch(url, buildCoverRequestInit(endpoint));

          if (!response.ok) {
            throw new Error(`HTTP ${response.status} ${response.statusText}`);
          }

          const data = (await response.json()) as { success?: boolean; message?: string; result?: { ean?: string; imageBase64?: string } };
          const imageBase64 = normaliseCoverDataUrl(data?.result?.imageBase64);

          if (data?.success && imageBase64) {
            console.log('[catalogueApi] Couverture reçue', ean, {
              endpoint,
              message: data?.message,
              attempt,
            });
            coverCache.set(ean, imageBase64);
            return imageBase64;
          }

          const errorMessage = data?.message ?? "Réponse inattendue de l'API couverture";
          throw new Error(errorMessage);
        } catch (error) {
          console.error(
            `[catalogueApi] Impossible de récupérer la couverture ${ean} via ${endpoint} (tentative ${attempt + 1})`,
            error,
          );
        }
      }

      if (attempt < COVER_FETCH_RETRY_ATTEMPTS - 1) {
        await wait(COVER_FETCH_RETRY_DELAY_MS);
      }
    }

    return null;
  })();

  pendingCoverRequests.set(ean, request);

  lastCoverFetch = request.then(
    () => undefined,
    () => undefined,
  );

  request.finally(() => {
    pendingCoverRequests.delete(ean);
  });

  return request;
};

const editionAssetMap: Record<string, CatalogueEdition> = {
  adonis: { title: 'Adonis', color: '--glenat-bd', logo: UniversBD },
  blanche: { title: 'Blanche', color: '--glenat-livre', logo: UniversLivre },
  'comix buro': { title: 'Comix Buro', color: '--glenat-jeunesse', logo: UniversJeune },
  disney: { title: 'Disney', color: '--glenat-bd', logo: UniversLivre },
  'éditions licences': { title: 'Éditions licences', color: '--glenat-livre', logo: UniversLivre },
  'editions licences': { title: 'Éditions licences', color: '--glenat-livre', logo: UniversLivre },
  'cheval magazine': { title: 'Cheval Magazine', color: '--glenat-livre', logo: UniversLivre },
  'glénat bd': { title: 'Glénat BD', color: '--glenat-bd', logo: UniversBD },
  'glenat bd': { title: 'Glénat BD', color: '--glenat-bd', logo: UniversBD },
  'glénat jeunesse': { title: 'Glénat Jeunesse', color: '--glenat-jeunesse', logo: UniversJeune },
  'glenat jeunesse': { title: 'Glénat Jeunesse', color: '--glenat-jeunesse', logo: UniversJeune },
  'glénat manga': { title: 'Glénat Manga', color: '--glenat-manga', logo: UniversManga },
  'glenat manga': { title: 'Glénat Manga', color: '--glenat-manga', logo: UniversManga },
  hugo: { title: 'Hugo', color: '--glenat-livre', logo: UniversLivre },
  'livres diffusés': { title: 'Livres diffusés', color: '--glenat-jeunesse', logo: UniversJeune },
  'livres diffuses': { title: 'Livres diffusés', color: '--glenat-jeunesse', logo: UniversJeune },
  'rando éditions': { title: 'Rando éditions', color: '--glenat-livre', logo: UniversLivre },
  'rando editions': { title: 'Rando éditions', color: '--glenat-livre', logo: UniversLivre },
  'glénat livres': { title: 'Glénat Livres', color: '--glenat-livre', logo: UniversLivre },
  'glenat livres': { title: 'Glénat Livres', color: '--glenat-livre', logo: UniversLivre },
  "vent d'ouest": { title: "Vent d'Ouest", color: '--glenat-bd', logo: UniversBD },
  "vents d'ouest": { title: "Vents d'Ouest", color: '--glenat-bd', logo: UniversBD },
};

const sanitizeSqlInput = (value: string): string => value.replace(/'/g, "''");

const resolveCatalogueQuery = (envKey: string, fallback?: string): string | null => {
  const candidate = env[envKey]?.trim();
  if (candidate) {
    return candidate;
  }

  if (fallback && fallback.trim()) {
    return fallback;
  }

  return null;
};

const ensureString = (value: unknown): string | undefined => {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length ? trimmed : undefined;
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return value.toString();
  }

  return undefined;
};

const ensureNumber = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = value.replace(',', '.').trim();
    if (!normalized) {
      return undefined;
    }
    const parsed = Number.parseFloat(normalized);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
};

const parseDateInput = (value: unknown): Date | null => {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return new Date(value.getTime());
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }

    const frenchFormat = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (frenchFormat) {
      const [, day, month, year] = frenchFormat;
      return new Date(Number(year), Number(month) - 1, Number(day));
    }

    const isoCompactFormat = trimmed.match(/^(\d{4})(\d{2})(\d{2})$/);
    if (isoCompactFormat) {
      const [, year, month, day] = isoCompactFormat;
      return new Date(Number(year), Number(month) - 1, Number(day));
    }

    const serializedDate = trimmed.match(/\/Date\((\d+)\)\//);
    if (serializedDate) {
      const [, timestamp] = serializedDate;
      const parsed = Number.parseInt(timestamp, 10);
      if (Number.isFinite(parsed)) {
        return new Date(parsed);
      }
    }

    const normalized = /^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}(:\d{2}(\.\d+)?)?)/.test(trimmed)
      ? trimmed.replace(' ', 'T')
      : trimmed;

    const timestamp = Date.parse(normalized);
    if (!Number.isNaN(timestamp)) {
      return new Date(timestamp);
    }
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    if (value > 10_000) {
      return new Date(value);
    }

    const excelEpoch = Date.UTC(1899, 11, 30);
    const milliseconds = Math.round(value * 24 * 60 * 60 * 1000);
    return new Date(excelEpoch + milliseconds);
  }

  return null;
};

const formatDisplayDate = (value: unknown): string | undefined => {
  const date = parseDateInput(value);
  if (date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear());
    return `${day}/${month}/${year}`;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (isoMatch) {
      const [, year, month, day] = isoMatch;
      return `${day}/${month}/${year}`;
    }
  }

  return undefined;
};

const formatPrice = (value: unknown): string => {
  const numeric = ensureNumber(value);
  if (numeric === undefined) {
    return '0.00';
  }

  return numeric.toFixed(2);
};

const getField = (source: RawCatalogueRecord, ...keys: string[]): unknown => {
  const lowered = Object.keys(source).reduce<Record<string, string>>((acc, key) => {
    acc[key.toLowerCase()] = key;
    return acc;
  }, {});

  for (const key of keys) {
    const candidate = lowered[key.toLowerCase()];
    if (candidate !== undefined) {
      return source[candidate];
    }
  }

  return undefined;
};

const extractDatabaseRows = (payload: unknown): RawCatalogueRecord[] => {
  const visit = (input: unknown): unknown => {
    if (Array.isArray(input)) {
      return input;
    }

    if (typeof input === 'string') {
      try {
        const parsed = JSON.parse(input) as unknown;
        return visit(parsed);
      } catch {
        return [];
      }
    }

    if (input && typeof input === 'object') {
      const objectPayload = input as Record<string, unknown>;
      const possibleKeys = ['rows', 'data', 'result', 'recordset', 'Recordset', 'records'];

      for (const key of possibleKeys) {
        const candidate = objectPayload[key];
        if (Array.isArray(candidate)) {
          return candidate;
        }
      }

      if (Array.isArray(objectPayload.recordsets)) {
        const [first] = objectPayload.recordsets as unknown[];
        if (Array.isArray(first)) {
          return first;
        }
      }
    }

    return [];
  };

  const result = visit(payload);
  if (!Array.isArray(result)) {
    return [];
  }

  return result.filter((item): item is RawCatalogueRecord => Boolean(item) && typeof item === 'object');
};

const executeCatalogueQuery = async (query: string): Promise<RawCatalogueRecord[]> => {
  const trimmed = query.trim();
  if (!trimmed) {
    return [];
  }

  const response = await fetch(CATALOGUE_DATABASE_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ query: trimmed }),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`);
  }

  const payload = (await response.json()) as DatabaseApiResponse;
  return extractDatabaseRows(payload);
};

const getColorFromPublisher = (publisher?: string): string => {
  if (!publisher) {
    return '--glenat-bd';
  }

  const normalized = publisher.toLowerCase();

  if (normalized.includes('manga')) {
    return '--glenat-manga';
  }

  if (normalized.includes('jeunesse')) {
    return '--glenat-jeunesse';
  }

  if (normalized.includes('livre') || normalized.includes('hugo')) {
    return '--glenat-livre';
  }

  return '--glenat-bd';
};

const extractShippingMessage = (record: RawCatalogueRecord): string | undefined => {
  const message = ensureString(
    getField(
      record,
      'shipping',
      'chronolivre',
      'messagechronolivre',
      'infochronolivre',
      'commentaireexpedition',
      'commentaire',
      'texteexpedition',
    ),
  );

  const date = formatDisplayDate(
    getField(record, 'dateexpedition', 'datechronolivre', 'dateenvoi', 'datepreparation', 'dateexp'),
  );

  if (message && date) {
    return `${message} ${date}`;
  }

  if (message) {
    return message;
  }

  if (date) {
    return `Expédition le ${date}`;
  }

  return undefined;
};

const ensureArrayFromValue = (value: unknown): string[] => {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value
      .map(item => ensureString(item))
      .filter((item): item is string => Boolean(item));
  }

  if (typeof value === 'string') {
    return value
      .split(/[,;\n]/)
      .map(item => item.trim())
      .filter(Boolean);
  }

  return [];
};

const buildBookDetail = (record: RawCatalogueRecord): CatalogueBookDetail | undefined => {
  const metadata: CatalogueBookDetailEntry[] = [];
  const specifications: CatalogueBookDetailEntry[] = [];
  const stats: CatalogueBookStat[] = [];

  const pushMetadata = (label: string, value: string | undefined) => {
    if (value) {
      metadata.push({ label, value });
    }
  };

  const pushSpecification = (label: string, value: string | undefined) => {
    if (value) {
      specifications.push({ label, value });
    }
  };

  const pushStat = (label: string, value: string | undefined, helper?: string) => {
    if (value) {
      stats.push({ label, value, helper });
    }
  };

  const brand = ensureString(getField(record, 'marque', 'label', 'publisher', 'editeur'));
  const categories = ensureArrayFromValue(getField(record, 'categories', 'categorie', 'themes', 'tags'));
  const summary = ensureString(getField(record, 'resume', 'description', 'summary', 'presentation'));
  const authorBio = ensureString(getField(record, 'biographieauteur', 'auteurbio', 'authorbio'));
  const contributorsRaw = ensureArrayFromValue(getField(record, 'contributors', 'contributeurs'));

  const contributors: CatalogueBookContributor[] = contributorsRaw.map(entry => ({
    name: entry,
    role: 'Contributeur',
  }));

  const contributorsFromFields = ensureString(getField(record, 'createur', 'auteur', 'auteurs', 'createurs'));
  if (contributorsFromFields && contributors.length === 0) {
    contributors.push({ name: contributorsFromFields, role: 'Auteur' });
  }

  pushMetadata('Marque éditoriale', brand);
  pushMetadata('Catégorie(s)', categories.join(', '));
  pushMetadata('Série', ensureString(getField(record, 'serie', 'serieLibelle', 'collectionserie')));
  pushMetadata('Collection', ensureString(getField(record, 'collection', 'collectionLibelle')));
  pushMetadata('Mot(s) clé', ensureString(getField(record, 'motscles', 'keywords', 'tags')));
  pushMetadata('Libellé de tomaison', ensureString(getField(record, 'libelletomaison', 'tomeLibelle')));
  pushMetadata('Nombre de pages', ensureString(getField(record, 'pagination', 'nombrepages', 'pages')));
  pushMetadata("Éditeur d'origine", ensureString(getField(record, 'editeuro', 'editeurdorigine', 'origineediteur')));

  pushSpecification('EAN', ensureString(getField(record, 'ean', 'codeean', 'codeEAN', 'idarticle', 'id_article')));
  pushSpecification('ISBN', ensureString(getField(record, 'isbn', 'codeisbn')));
  pushSpecification('Format', ensureString(getField(record, 'format', 'formatlibelle')));
  pushSpecification('Pagination', ensureString(getField(record, 'pagination', 'nombrepages', 'pages')));
  pushSpecification('Dimensions', ensureString(getField(record, 'dimensions', 'dimension', 'taille')));
  pushSpecification('Poids', ensureString(getField(record, 'poids', 'weight')));
  pushSpecification('Date de parution', formatDisplayDate(getField(record, 'dateparution', 'datemev', 'datepublication')));
  pushSpecification('Date de disponibilité', formatDisplayDate(getField(record, 'datedisponibilite', 'dateDisponibilite')));
  pushSpecification('Distributeur', ensureString(getField(record, 'distributeur', 'diffuseur')));
  pushSpecification('Hachette', ensureString(getField(record, 'hachette', 'codehachette')));
  pushSpecification('Façonnage', ensureString(getField(record, 'faconnage', 'facon', 'binding')));
  pushSpecification('Stock', ensureString(getField(record, 'stock', 'stockdispo', 'qtestock', 'quantitestock', 'stocklibrairie')));

  pushStat('Commandes totales', ensureString(getField(record, 'commandestotales', 'nbcommandes')), 'Depuis le lancement');
  pushStat('Stock disponible', ensureString(getField(record, 'stock', 'stockdispo', 'qtestock', 'quantitestock', 'stocklibrairie')));
  pushStat('Précommandes', ensureString(getField(record, 'precommandes', 'nbprecommandes')));
  pushStat('Dernière commande', formatDisplayDate(getField(record, 'datedernierecommande', 'lastorderdate')));

  const recommendedAge = ensureString(getField(record, 'agedestinataire', 'recommandedage', 'ageconseille'));
  const officeCode = ensureString(getField(record, 'office', 'codeoffice'));
  const priceTTC = formatPrice(getField(record, 'prixpublicttc', 'prixTTC', 'priuxttc'));
  const availabilityStatus = ensureString(getField(record, 'statutdisponibilite', 'disponibilite', 'availabilitystatus'));
  const availabilityNote = ensureString(getField(record, 'notedisponibilite', 'availabilitynote'));
  const availabilityDate = formatDisplayDate(
    getField(record, 'datedisponibilite', 'datemiseenvente', 'datemiseenrayon', 'datedispo'),
  );
  const relatedEans = ensureArrayFromValue(getField(record, 'relatedeans', 'eanlies', 'eanassocies'));

  if (
    metadata.length === 0 &&
    specifications.length === 0 &&
    stats.length === 0 &&
    !recommendedAge &&
    !officeCode &&
    categories.length === 0 &&
    !priceTTC &&
    !availabilityStatus &&
    !availabilityNote &&
    !availabilityDate &&
    relatedEans.length === 0 &&
    !summary &&
    !authorBio &&
    contributors.length === 0
  ) {
    return undefined;
  }

  return {
    subtitle: ensureString(getField(record, 'soustitre', 'subtitle')),
    badges: ensureArrayFromValue(getField(record, 'badges', 'etiquettes', 'flags')),
    contributors,
    metadata,
    specifications,
    stats,
    recommendedAge,
    officeCode,
    categories: categories.length ? categories : undefined,
    priceTTC,
    availabilityStatus,
    availabilityNote,
    availabilityDate,
    relatedEans: relatedEans.length ? relatedEans : undefined,
    summary,
    authorBio,
  } satisfies CatalogueBookDetail;
};

const normalizeBookFromRecord = (record: RawCatalogueRecord): CatalogueBook | null => {
  const ean = ensureString(getField(record, 'ean', 'codeean', 'codeEAN', 'idarticle', 'id_article'));
  if (!ean) {
    return null;
  }

  const title =
    ensureString(getField(record, 'titre', 'title', 'libelle', 'libelleshort')) ?? `Article ${ean}`;
  const authors = ensureString(getField(record, 'createur', 'auteur', 'auteurs', 'createurs')) ?? 'Auteur à confirmer';
  const publisher =
    ensureString(getField(record, 'editeur', 'marque', 'label', 'publisher')) ?? 'Éditeur à confirmer';
  const publicationDate =
    formatDisplayDate(
      getField(
        record,
        'dateparution',
        'date_parution',
        'datepublication',
        'datepublicationprevue',
        'datedisponibilite',
        'datemev',
      ),
    ) ?? 'À confirmer';
  const priceHT = formatPrice(getField(record, 'prixht', 'prix_public_ht', 'prixpublicht', 'prix'));
  const stock = ensureNumber(
    getField(record, 'stock', 'stockdispo', 'qtestock', 'quantitestock', 'stocklibrairie'),
  ) ?? 0;
  const views = ensureNumber(getField(record, 'vues', 'views', 'nombrevues'));
  const ribbonSource = ensureString(getField(record, 'statut', 'status', 'mention', 'flag'));
  const creationDate =
    formatDisplayDate(
      getField(record, 'datecreation', 'dateCreation', 'dateinsert', 'dateinsertion', 'datesaisie'),
    ) ?? undefined;
  const infoLabel = ensureString(getField(record, 'infolabel', 'info_label'));
  const infoValue =
    ensureString(getField(record, 'infovalue', 'info_value')) ??
    ensureNumber(getField(record, 'infovalue', 'info_value'));

  return {
    cover: FALLBACK_COVER_DATA_URL,
    title,
    ean,
    authors,
    publisher,
    publicationDate,
    priceHT,
    stock,
    views,
    color: getColorFromPublisher(publisher),
    ribbonText: ribbonSource?.toUpperCase(),
    infoLabel,
    infoValue,
    creationDate,
    details: buildBookDetail(record),
  } satisfies CatalogueBook;
};

const dedupeBooks = (books: CatalogueBook[]): CatalogueBook[] => {
  const map = new Map<string, CatalogueBook>();

  books.forEach(book => {
    if (!map.has(book.ean)) {
      map.set(book.ean, book);
    }
  });

  return Array.from(map.values());
};

export async function fetchCatalogueBooks(): Promise<CatalogueBook[]> {
  const endpoint = 'fetchCatalogueBooks';
  logRequest(endpoint);

  try {
    const query = resolveCatalogueQuery('VITE_CATALOGUE_BOOKS_QUERY', DEFAULT_RECENT_BOOKS_SQL_QUERY);
    if (!query) {
      logResponse(endpoint, []);
      return [];
    }

    const records = await executeCatalogueQuery(query);
    const books = dedupeBooks(
      records
        .map(record => normalizeBookFromRecord(record))
        .filter((book): book is CatalogueBook => book !== null),
    );

    logResponse(endpoint, books);
    return books;
  } catch (error) {
    console.error('[catalogueApi] Impossible de récupérer le catalogue', error);
    return [];
  }
}

const buildReleaseGroups = (records: RawCatalogueRecord[]): CatalogueReleaseGroup[] => {
  const groups = new Map<string, CatalogueBook[]>();

  records.forEach(record => {
    const date =
      formatDisplayDate(getField(record, 'datemev', 'dateparution', 'date', 'datedisponibilite')) ??
      'À confirmer';
    const book = normalizeBookFromRecord(record);
    if (!book) {
      return;
    }

    const group = groups.get(date);
    if (group) {
      group.push(book);
    } else {
      groups.set(date, [book]);
    }
  });

  return Array.from(groups.entries())
    .map(([date, books]) => ({
      date,
      books: dedupeBooks(books),
    }))
    .sort((a, b) => {
      const parse = (value: string) => parseDateInput(value)?.getTime() ?? 0;
      return parse(b.date) - parse(a.date);
    });
};

export async function fetchCatalogueReleases(): Promise<CatalogueReleaseGroup[]> {
  const endpoint = 'fetchCatalogueReleases';
  logRequest(endpoint);

  try {
    const query = resolveCatalogueQuery('VITE_CATALOGUE_RELEASES_QUERY', DEFAULT_UPCOMING_RELEASES_SQL_QUERY);
    if (!query) {
      logResponse(endpoint, []);
      return [];
    }

    const records = await executeCatalogueQuery(query);
    const groups = buildReleaseGroups(records);
    logResponse(endpoint, groups);
    return groups;
  } catch (error) {
    console.error('[catalogueApi] Impossible de récupérer les nouveautés', error);
    return [];
  }
}

const buildCatalogueOfficeGroups = async (
  records: RawCatalogueRecord[],
): Promise<CatalogueOfficeGroup[]> => {
  const groupsMap = new Map<
    string,
    {
      office: string;
      records: RawCatalogueRecord[];
      date?: string;
      shipping?: string;
      order: number;
    }
  >();

  let order = 0;

  records.forEach(record => {
    const office = ensureString(getField(record, 'office', 'codeoffice'));
    if (!office) {
      return;
    }

    let group = groupsMap.get(office);
    if (!group) {
      group = {
        office,
        records: [],
        order: order++,
      };
      groupsMap.set(office, group);
    }

    group.records.push(record);

    if (!group.date) {
      group.date =
        formatDisplayDate(
          getField(record, 'datemev', 'date', 'dateparution', 'nextdate', 'dateoffre'),
        ) ?? undefined;
    }

    if (!group.shipping) {
      group.shipping = extractShippingMessage(record);
    }
  });

  const groups = await Promise.all(
    Array.from(groupsMap.values())
      .sort((a, b) => a.order - b.order)
      .map(async group => {
        const books = (
          await Promise.all(group.records.map(async record => normalizeBookFromRecord(record)))
        ).filter((book): book is CatalogueBook => book !== null);

        if (!books.length) {
          return null;
        }

        return {
          office: group.office,
          date: group.date ?? 'À confirmer',
          shipping: group.shipping ?? 'Expédition à confirmer',
          books: dedupeBooks(books),
        } satisfies CatalogueOfficeGroup;
      }),
  );

  return groups.filter((group): group is CatalogueOfficeGroup => group !== null);
};

export async function hydrateCatalogueOfficeGroupsWithCovers(
  groups: CatalogueOfficeGroup[],
  options: HydrateCatalogueOfficeGroupsOptions = {},
): Promise<CatalogueOfficeGroup[]> {
  const { onCoverProgress } = options;
  const coverCacheLocal = new Map<string, Promise<string | null>>();
  const resultGroups = groups.map(group => ({
    ...group,
    books: group.books.map(book => ({ ...book })),
  }));

  let hasProgress = false;

  const emitProgress = () => {
    if (!onCoverProgress) {
      return;
    }

    hasProgress = true;
    const snapshot = resultGroups.map(group => ({
      ...group,
      books: group.books.map(book => ({ ...book })),
    }));
    onCoverProgress(snapshot);
  };

  for (const group of resultGroups) {
    await Promise.all(
      group.books.map(async (book, bookIndex) => {
        const ean = book.ean;

        if (!ean) {
          return;
        }

        let coverPromise = coverCacheLocal.get(ean);

        if (!coverPromise) {
          coverPromise = fetchCover(ean).catch(error => {
            console.warn(
              `[catalogueApi] Impossible de recuperer la couverture pour ${ean}`,
              error,
            );
            return null;
          });
          coverCacheLocal.set(ean, coverPromise);
        }

        const cover = await coverPromise;

        if (cover && cover !== book.cover) {
          group.books[bookIndex] = { ...book, cover };
          emitProgress();
        }
      }),
    );
  }

  if (onCoverProgress && !hasProgress) {
    emitProgress();
  }

  return resultGroups;
}

export async function fetchCatalogueOffices(
  options: FetchCatalogueOfficesOptions = {},
): Promise<CatalogueOfficeGroup[]> {
  const { hydrateCovers = true, onCoverProgress } = options;
  const endpoint = 'fetchCatalogueOffices';
  logRequest(endpoint);

  try {
    const query = resolveCatalogueQuery('VITE_CATALOGUE_OFFICES_QUERY', NEXT_OFFICES_SQL_QUERY);
    if (!query) {
      logResponse(endpoint, []);
      return [];
    }

    const records = await executeCatalogueQuery(query);

    if (!records.length) {
      throw new Error("La base de donnees n'a retourne aucun resultat");
    }

    const groups = await buildCatalogueOfficeGroups(records);

    if (!groups.length) {
      throw new Error('Impossible de construire les offices a partir des donnees recues');
    }

    if (!hydrateCovers) {
      logResponse(endpoint, groups);

      if (onCoverProgress) {
        void hydrateCatalogueOfficeGroupsWithCovers(groups, { onCoverProgress }).catch(error => {
          console.warn('[catalogueApi] Hydratation des couvertures interrompue', error);
        });
      }

      return groups;
    }

    const hydratedGroups = await hydrateCatalogueOfficeGroupsWithCovers(groups, {
      onCoverProgress,
    });

    logResponse(endpoint, hydratedGroups);
    return hydratedGroups;
  } catch (error) {
    console.error('[catalogueApi] Impossible de recuperer les prochaines offices', error);
    throw error;
  }
}

const buildKiosqueGroups = (records: RawCatalogueRecord[]): CatalogueKiosqueGroup[] => {
  const groups = new Map<string, CatalogueKiosqueGroup>();

  records.forEach(record => {
    const office = ensureString(getField(record, 'office', 'codeoffice', 'kiosque')) ?? 'Kiosque';
    const existing = groups.get(office);
    const date =
      formatDisplayDate(getField(record, 'datemev', 'date', 'dateparution')) ?? 'À confirmer';
    const shipping =
      extractShippingMessage(record) ??
      ensureString(getField(record, 'message', 'commentaire')) ??
      'Expédition à confirmer';
    const book = normalizeBookFromRecord(record);
    if (!book) {
      return;
    }

    if (existing) {
      existing.books.push(book);
      if (existing.date === 'À confirmer' && date) {
        existing.date = date;
      }
    } else {
      groups.set(office, {
        office,
        date,
        shipping,
        books: [book],
      });
    }
  });

  return Array.from(groups.values()).map(group => ({
    ...group,
    books: dedupeBooks(group.books),
  }));
};

export async function fetchCatalogueKiosques(): Promise<CatalogueKiosqueGroup[]> {
  const endpoint = 'fetchCatalogueKiosques';
  logRequest(endpoint);

  try {
    const query = resolveCatalogueQuery('VITE_CATALOGUE_KIOSQUES_QUERY', DEFAULT_KIOSQUES_SQL_QUERY);
    if (!query) {
      logResponse(endpoint, []);
      return [];
    }

    const records = await executeCatalogueQuery(query);
    const groups = buildKiosqueGroups(records);
    logResponse(endpoint, groups);
    return groups;
  } catch (error) {
    console.error('[catalogueApi] Impossible de récupérer les kiosques', error);
    return [];
  }
}

export async function fetchCatalogueEditions(): Promise<CatalogueEdition[]> {
  const endpoint = 'fetchCatalogueEditions';
  logRequest(endpoint);

  try {
    const query = resolveCatalogueQuery('VITE_CATALOGUE_EDITIONS_QUERY', DEFAULT_EDITION_LABELS_SQL_QUERY);
    let labels: string[] = [];

    if (query) {
      const records = await executeCatalogueQuery(query);
      labels = records
        .map(record => ensureString(getField(record, 'editionlabel', 'label', 'edition', 'marque', 'editeur')))
        .filter((label): label is string => Boolean(label));
    }

    if (!labels.length) {
      const books = await fetchCatalogueBooks();
      labels = Array.from(new Set(books.map(book => book.publisher).filter(Boolean)));
    }

    const editions = labels
      .map(label => {
        const normalized = label
          .normalize('NFD')
          .replace(/\p{Diacritic}/gu, '')
          .toLowerCase();
        const asset = editionAssetMap[normalized];
        if (asset) {
          return asset;
        }
        return {
          title: label,
          color: getColorFromPublisher(label),
          logo: UniversLivre,
        } satisfies CatalogueEdition;
      })
      .filter((edition, index, array) =>
        array.findIndex(candidate => candidate.title.toLowerCase() === edition.title.toLowerCase()) === index,
      );

    logResponse(endpoint, editions);
    return editions;
  } catch (error) {
    console.error('[catalogueApi] Impossible de récupérer les éditions', error);
    return [];
  }
}

const DEFAULT_BOOK_DETAILS_SQL_QUERY = (ean: string) => `
SELECT TOP (1) *
FROM dbo.cataLivres
WHERE codeEAN = '${sanitizeSqlInput(ean)}'
   OR idArticle = '${sanitizeSqlInput(ean)}'
   OR id_article = '${sanitizeSqlInput(ean)}';`;

export async function fetchCatalogueBook(ean: string): Promise<CatalogueBook | null> {
  const endpoint = `fetchCatalogueBook:${ean}`;
  logRequest(endpoint);

  try {
    const query = resolveCatalogueQuery('VITE_CATALOGUE_BOOK_QUERY', DEFAULT_BOOK_DETAILS_SQL_QUERY(ean));
    if (!query) {
      logResponse(endpoint, null);
      return null;
    }

    const records = await executeCatalogueQuery(query);
    const [first] = records;
    const book = first ? normalizeBookFromRecord(first) : null;
    logResponse(endpoint, book);
    return book;
  } catch (error) {
    console.warn(`[catalogueApi] Livre introuvable pour l'EAN ${ean}`, error);
    return null;
  }
}

const DEFAULT_RELATED_BOOKS_SQL_QUERY = (ean: string) => `
SELECT TOP (24) *
FROM dbo.cataLivres
WHERE (NULLIF(LTRIM(RTRIM(codeEAN)), '') IS NOT NULL OR NULLIF(LTRIM(RTRIM(idArticle)), '') IS NOT NULL)
  AND codeEAN <> '${sanitizeSqlInput(ean)}'
  AND ISNULL(idArticle, '') <> '${sanitizeSqlInput(ean)}'
ORDER BY COALESCE(dateMev, dateParution, CAST('1900-01-01' AS date)) DESC;`;

export async function fetchCatalogueRelatedBooks(ean: string): Promise<CatalogueBook[]> {
  const endpoint = `fetchCatalogueRelatedBooks:${ean}`;
  logRequest(endpoint);

  try {
    const query = resolveCatalogueQuery('VITE_CATALOGUE_RELATED_BOOKS_QUERY', DEFAULT_RELATED_BOOKS_SQL_QUERY(ean));
    if (!query) {
      logResponse(endpoint, []);
      return [];
    }

    const records = await executeCatalogueQuery(query);
    const books = dedupeBooks(
      records
        .map(record => normalizeBookFromRecord(record))
        .filter((book): book is CatalogueBook => book !== null),
    );

    logResponse(endpoint, books);
    return books;
  } catch (error) {
    console.warn(
      `[catalogueApi] Impossible de récupérer les recommandations pour ${ean}`,
      error,
    );
    return [];
  }
}

export const FALLBACK_CATALOGUE_COVER = FALLBACK_COVER_DATA_URL;

export async function fetchCatalogueCover(ean: string): Promise<string | null> {
  return fetchCover(ean);
}
