import type { BookCardProps } from '@/components/BookCard';
import { fetchWithOAuth } from './oauth';
import { applySecurePayloadHeaders, logSecurePayloadRequest, prepareSecureJsonPayload } from './securePayload';
import UniversBD from '@/assets/logos/univers/univers-bd.svg';
import UniversJeune from '@/assets/logos/univers/univers-jeunesse.svg';
import UniversLivre from '@/assets/logos/univers/univers-livres.svg';
import UniversManga from '@/assets/logos/univers/univers-manga.svg';

export interface CatalogueBookDetailEntry {
  label: string;
  value: string;
}

export interface CatalogueBookStat {
  label: string;
  value: string;
  helper?: string;
}

export interface CatalogueAuthor {
  idAuthor: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  photo?: string;
  bio?: string;
  sortOrder?: number;
  fonction?: string;
}

export interface CatalogueText {
  idTypeTexte: string;
  texte: string;
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
  authors?: CatalogueAuthor[];
  universLogo?: string;
  texts?: CatalogueText[];
}

export interface CatalogueBookContributor {
  name: string;
  role: string;
}

export interface CatalogueBook extends BookCardProps {
  creationDate?: string;
  details?: CatalogueBookDetail;
}

export interface CatalogueReleaseDefinition {
  date: string;
  bookEans: string[];
}

export interface CatalogueOfficeDefinition {
  office: string;
  date: string;
  shipping: string;
  bookEans: string[];
}

export interface CatalogueKiosqueDefinition {
  office: string;
  date: string;
  shipping: string;
  bookEans: string[];
}

export interface CatalogueEdition {
  title: string;
  color: string;
  logo: string;
}

export interface CatalogueDb {
  books: CatalogueBook[];
  releases: CatalogueReleaseDefinition[];
  offices: CatalogueOfficeDefinition[];
  kiosques: CatalogueKiosqueDefinition[];
  editions: CatalogueEdition[];
}


const logRequest = (_endpoint: string) => {
  // Debug logging disabled in production
};

const logResponse = (_endpoint: string, _payload: unknown) => {
  // Debug logging disabled in production
};

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

export interface CatalogueBooksPage {
  books: CatalogueBook[];
  totalBooks: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export interface FetchCatalogueBooksOptions {
  seed?: string;
  signal?: AbortSignal;
  onProgress?: (page: CatalogueBooksPage) => void;
}

export interface CatalogueSearchSuggestion {
  ean: string;
  title: string;
  authors: string;
  cover: string;
  publisher: string;
  serie?: string;
}

export async function fetchCatalogueBooks(): Promise<CatalogueBook[]> {
  const endpoint = 'fetchCatalogueBooks';
  logRequest(endpoint);
  const data: CatalogueBook[] = [];
  logResponse(endpoint, data);
  return Promise.resolve(data);
}

export async function fetchCatalogueReleases(): Promise<CatalogueReleaseGroup[]> {
  const endpoint = 'fetchCatalogueReleases';
  logRequest(endpoint);
  const data: CatalogueReleaseGroup[] = [];
  logResponse(endpoint, data);
  return Promise.resolve(data);
}

export async function fetchCatalogueBooksWithPagination(
  page: number = 1,
  pageSize: number = 50,
  options: FetchCatalogueBooksOptions = {},
): Promise<CatalogueBooksPage> {
  const { seed, signal, onProgress } = options;
  const endpoint = `fetchCatalogueBooksWithPagination:page=${page}`;
  logRequest(endpoint);

  try {
    // Calculer l'offset pour la pagination
    const offset = (page - 1) * pageSize;

    // Requête pour compter le nombre total de livres
    const countQuery = `
      SELECT COUNT(*) as totalCount
      FROM catalogBooks
      WHERE dateMev >= '1950-01-01'
        AND dateMev <= DATEADD(YEAR, 10, GETDATE())
        AND idItem IS NOT NULL
        AND idItem <> ''
        AND LEN(LTRIM(RTRIM(idItem))) > 0;
    `;

    // Requête pour récupérer les livres paginés (ordre aléatoire avec seed)
    // Utilise plusieurs colonnes pour mieux disperser les séries
    const orderByClause = seed
      ? `ABS(CHECKSUM(CONCAT('${seed}', idItem, ISNULL(titre, ''), ISNULL(serie, ''))))`
      : 'NEWID()';

    const booksQuery = `
      SELECT *
      FROM catalogBooks
      WHERE dateMev >= '1950-01-01'
        AND dateMev <= DATEADD(YEAR, 10, GETDATE())
        AND idItem IS NOT NULL
        AND idItem <> ''
        AND LEN(LTRIM(RTRIM(idItem))) > 0
      ORDER BY ${orderByClause}
      OFFSET ${offset} ROWS
      FETCH NEXT ${pageSize} ROWS ONLY;
    `;

    // Exécuter les deux requêtes en parallèle
    const [countResult, booksResult] = await Promise.all([
      (async () => {
        const countPayload = { query: countQuery };
        const countSecurePayload = await prepareSecureJsonPayload(countPayload);
        const countHeaders = new Headers({
          'Content-Type': 'application/json',
          Accept: 'application/json',
        });
        applySecurePayloadHeaders(countHeaders, countSecurePayload.encrypted);
        logSecurePayloadRequest(
          CATALOGUE_OFFICES_ENDPOINT,
          countPayload,
          countSecurePayload.body,
          countSecurePayload.encrypted,
        );
        const countResponse = await fetchWithOAuth(CATALOGUE_OFFICES_ENDPOINT, {
          method: 'POST',
          headers: countHeaders,
          body: countSecurePayload.body,
        });
        if (!countResponse.ok) {
          throw new Error(`HTTP ${countResponse.status} ${countResponse.statusText}`);
        }
        return countResponse.json() as Promise<DatabaseApiResponse>;
      })(),
      (async () => {
        const booksPayload = { query: booksQuery };
        const booksSecurePayload = await prepareSecureJsonPayload(booksPayload);
        const booksHeaders = new Headers({
          'Content-Type': 'application/json',
          Accept: 'application/json',
        });
        applySecurePayloadHeaders(booksHeaders, booksSecurePayload.encrypted);
        logSecurePayloadRequest(
          CATALOGUE_OFFICES_ENDPOINT,
          booksPayload,
          booksSecurePayload.body,
          booksSecurePayload.encrypted,
        );
        const booksResponse = await fetchWithOAuth(CATALOGUE_OFFICES_ENDPOINT, {
          method: 'POST',
          headers: booksHeaders,
          body: booksSecurePayload.body,
        });
        if (!booksResponse.ok) {
          throw new Error(`HTTP ${booksResponse.status} ${booksResponse.statusText}`);
        }
        return booksResponse.json() as Promise<DatabaseApiResponse>;
      })(),
    ]);

    // Extraire le nombre total de livres
    const countRecords = extractDatabaseRows(countResult);
    const totalBooks = countRecords.length > 0
      ? (ensureNumber(getField(countRecords[0], 'totalCount', 'totalcount')) ?? 0)
      : 0;

    // Extraire les livres
    const bookRecords = extractDatabaseRows(booksResult);

    // Calculer le nombre total de pages
    const totalPages = Math.ceil(totalBooks / pageSize);

    // D'abord charger les livres sans les couvertures pour affichage immédiat
    const booksWithoutCovers = (
      await Promise.all(bookRecords.map(record => normalizeBookFromDatabaseRecord(record, false)))
    ).filter((book): book is CatalogueBook => book !== null);

    const initialResult: CatalogueBooksPage = {
      books: booksWithoutCovers,
      totalBooks,
      totalPages,
      currentPage: page,
      pageSize,
    };

    // Si pas de callback de progression, charger toutes les couvertures avant de retourner
    if (!onProgress) {
      const booksWithCovers = (
        await Promise.all(bookRecords.map(record => normalizeBookFromDatabaseRecord(record, true)))
      ).filter((book): book is CatalogueBook => book !== null);

      const result: CatalogueBooksPage = {
        books: booksWithCovers,
        totalBooks,
        totalPages,
        currentPage: page,
        pageSize,
      };

      logResponse(endpoint, result);
      return result;
    }

    // Charger les couvertures progressivement en arrière-plan
    void (async () => {
      const resultBooks = [...booksWithoutCovers];
      let loadedCount = 0;

      // Lancer tous les chargements en parallèle
      const loadPromises = resultBooks.map(async (book, index) => {
        if (book.ean) {
          // Vérifier si annulé avant de charger
          if (signal?.aborted) {
            return;
          }

          try {
            const coverUrl = await fetchCover(book.ean, signal);
            if (coverUrl && coverUrl !== book.cover) {
              resultBooks[index] = { ...book, cover: coverUrl };
            }
          } catch (error) {
            // Ignorer les erreurs d'annulation
            if (error instanceof Error && error.name === 'AbortError') {
              return;
            }
          }

          loadedCount++;

          // Ne pas émettre de progression si annulé
          if (!signal?.aborted && onProgress) {
            onProgress({
              books: [...resultBooks],
              totalBooks,
              totalPages,
              currentPage: page,
              pageSize,
            });
          }
        }
      });

      await Promise.all(loadPromises);

    })().catch(() => {
      // Silently ignore cover loading errors
    });
    logResponse(endpoint, initialResult);
    return initialResult;
  } catch (error) {
    throw error;
  }
}

const CATALOGUE_OFFICES_ENDPOINT = import.meta.env.DEV
  ? '/intranet/callDatabase'
  : 'https://api-dev.groupe-glenat.com/Api/v2.0/Dev/callDatabase';

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
  const overrides = parseEndpointList(import.meta.env.VITE_CATALOGUE_COVER_ENDPOINT);
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
      // Essayer d'abord api-dev, puis en fallback api-recette
      endpoints.add('https://api-dev.groupe-glenat.com/Api/v1.0/Extranet/couverture');
      endpoints.add('https://api-recette.groupe-glenat.com/Api/v1.0/Extranet/couverture');
    }
  }

  // Utiliser uniquement api-dev au lieu de api-recette
  endpoints.add('https://api-dev.groupe-glenat.com/Api/v1.0/Extranet/couverture');

  return Array.from(endpoints);
};

const CATALOGUE_COVERAGE_ENDPOINTS = resolveCoverageEndpoints();

const resolveAuthorPhotoEndpoints = (): string[] => {
  const overrides = parseEndpointList(import.meta.env.VITE_CATALOGUE_AUTHOR_PHOTO_ENDPOINT);
  if (overrides.length > 0) {
    return overrides;
  }

  if (import.meta.env.DEV) {
    return ['/extranet/photoAuteur'];
  }

  const endpoints = new Set<string>();

  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname.toLowerCase();

    if (hostname.includes('intranet')) {
      endpoints.add('https://api-dev.groupe-glenat.com/Api/v1.0/Extranet/photoAuteur');
    }
  }

  endpoints.add('https://api-recette.groupe-glenat.com/Api/v1.0/Extranet/photoAuteur');

  return Array.from(endpoints);
};

const CATALOGUE_AUTHOR_PHOTO_ENDPOINTS = resolveAuthorPhotoEndpoints();

const NEXT_OFFICES_SQL_QUERY = `;WITH office_min_dates AS (
    SELECT
           office,
           MIN(dateMev) AS nextDate
    FROM dbo.catalogBooks
    WHERE dateMev >= CONVERT(date, GETDATE())
      AND dateMev >= '20000101'
      AND dateMev < DATEADD(year, 5, CONVERT(date, GETDATE()))
      AND office <> '0000'
    GROUP BY office
),
next_offices AS (
    SELECT TOP (4)
           office,
           nextDate
    FROM office_min_dates
    ORDER BY nextDate ASC, office ASC
)
SELECT c.*
FROM dbo.catalogBooks AS c
JOIN next_offices AS n
  ON n.office = c.office
ORDER BY n.nextDate ASC, n.office ASC, c.dateMev ASC;`;

const NEXT_OFFICE_SQL_QUERY = `;WITH office_min_dates AS (
    SELECT
           office,
           MIN(dateMev) AS nextDate
    FROM dbo.catalogBooks
    WHERE dateMev >= CONVERT(date, GETDATE())
      AND dateMev >= '20000101'
      AND dateMev < DATEADD(year, 5, CONVERT(date, GETDATE()))
      AND office <> '0000'
    GROUP BY office
),
next_office AS (
    SELECT TOP (1)
           office,
           nextDate
    FROM office_min_dates
    ORDER BY nextDate ASC, office ASC
)
SELECT c.*
FROM dbo.catalogBooks AS c
JOIN next_office AS n
  ON n.office = c.office
ORDER BY n.nextDate ASC, n.office ASC, c.dateMev ASC;`;

const FALLBACK_COVER_DATA_URL =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 300" preserveAspectRatio="xMidYMid meet"><rect width="200" height="300" fill="#f4f4f5"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="16" fill="#a1a1aa">Couverture indisponible</text></svg>',
  );

type CoverApiResponse = {
  success?: boolean;
  message?: string;
  result?: {
    ean?: string;
    imageBase64?: string;
  };
};

const wait = (ms: number) =>
  new Promise<void>(resolve => {
    setTimeout(resolve, ms);
  });

const COVER_FETCH_RETRY_ATTEMPTS = 3;
const COVER_FETCH_RETRY_DELAY_MS = 150;

const coverCache = new Map<string, string>();
const pendingCoverRequests = new Map<string, Promise<string | null>>();
const authorPhotoCache = new Map<string, string>();
const pendingAuthorPhotoRequests = new Map<string, Promise<string | null>>();

let lastCoverFetch: Promise<unknown> = Promise.resolve();
let lastAuthorPhotoFetch: Promise<unknown> = Promise.resolve();

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
  } catch {
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

const fetchCover = async (ean: string, signal?: AbortSignal): Promise<string | null> => {
  // Validation stricte de l'EAN
  if (!ean || typeof ean !== 'string' || ean.trim().length === 0) {
    return null;
  }

  const trimmedEan = ean.trim();

  const cachedCover = coverCache.get(trimmedEan);
  if (cachedCover) {
    return cachedCover;
  }

  // Vérifier si la requête a été annulée
  if (signal?.aborted) {
    return null;
  }

  const pendingRequest = pendingCoverRequests.get(trimmedEan);
  if (pendingRequest) {
    return pendingRequest;
  }

  const previousFetch = lastCoverFetch;
  const request = (async () => {
    await previousFetch.catch(() => {});
    await wait(3);

    // Vérifier si annulé avant de commencer
    if (signal?.aborted) {
      return null;
    }

    for (let attempt = 0; attempt < COVER_FETCH_RETRY_ATTEMPTS; attempt += 1) {
      for (const endpoint of CATALOGUE_COVERAGE_ENDPOINTS) {
        // Vérifier si annulé avant chaque tentative
        if (signal?.aborted) {
          return null;
        }

        const url = `${endpoint}${endpoint.includes('?') ? '&' : '?'}ean=${encodeURIComponent(trimmedEan)}`;

        try {
          const response = await fetch(url, {
            ...buildCoverRequestInit(endpoint),
            signal
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status} ${response.statusText}`);
          }

          const data = (await response.json()) as CoverApiResponse;
          const imageBase64 = normaliseCoverDataUrl(data?.result?.imageBase64);

          if (data?.success && imageBase64) {
            coverCache.set(trimmedEan, imageBase64);
            return imageBase64;
          }

          // Si l'image n'est pas trouvée, ne pas retry
          const errorMessage = data?.message ?? "Réponse inattendue de l'API couverture";
          if (errorMessage.includes('Image non trouvée') || errorMessage.includes('image non trouvée')) {
            coverCache.set(trimmedEan, FALLBACK_COVER_DATA_URL);
            return FALLBACK_COVER_DATA_URL;
          }

          throw new Error(errorMessage);
        } catch (error) {
          // Ignorer silencieusement les erreurs d'annulation
          if (error instanceof Error && error.name === 'AbortError') {
            return null;
          }

          const errorMsg = error instanceof Error ? error.message : String(error);
          // Si l'image n'est pas trouvée, ne pas retry
          if (errorMsg.includes('Image non trouvée') || errorMsg.includes('image non trouvée')) {
            coverCache.set(trimmedEan, FALLBACK_COVER_DATA_URL);
            return FALLBACK_COVER_DATA_URL;
          }
        }
      }

      if (attempt < COVER_FETCH_RETRY_ATTEMPTS - 1) {
        await wait(COVER_FETCH_RETRY_DELAY_MS);
      }
    }

    return null;
  })();

  pendingCoverRequests.set(trimmedEan, request);

  lastCoverFetch = request.then(
    () => undefined,
    () => undefined,
  );

  request.finally(() => {
    pendingCoverRequests.delete(trimmedEan);
  });

  return request;
};

const fetchAuthorPhoto = async (photoFilename: string): Promise<string | null> => {
  if (!photoFilename) {
    return null;
  }

  const cachedPhoto = authorPhotoCache.get(photoFilename);
  if (cachedPhoto) {
    return cachedPhoto;
  }

  const pendingRequest = pendingAuthorPhotoRequests.get(photoFilename);
  if (pendingRequest) {
    return pendingRequest;
  }

  const previousFetch = lastAuthorPhotoFetch;
  const request = (async () => {
    await previousFetch.catch(() => {});
    await wait(3);

    for (let attempt = 0; attempt < COVER_FETCH_RETRY_ATTEMPTS; attempt += 1) {
      for (const endpoint of CATALOGUE_AUTHOR_PHOTO_ENDPOINTS) {
        const url = `${endpoint}${endpoint.includes('?') ? '&' : '?'}filename=${encodeURIComponent(photoFilename)}`;

        try {
          const response = await fetch(url, buildCoverRequestInit(endpoint));

          if (!response.ok) {
            throw new Error(`HTTP ${response.status} ${response.statusText}`);
          }

          const data = (await response.json()) as CoverApiResponse;
          const imageBase64 = normaliseCoverDataUrl(data?.result?.imageBase64);

          if (data?.success && imageBase64) {
            authorPhotoCache.set(photoFilename, imageBase64);
            return imageBase64;
          }

          const errorMessage = data?.message ?? "Réponse inattendue de l'API photo auteur";
          throw new Error(errorMessage);
        } catch {
          // Silently ignore errors during retry
        }
      }

      if (attempt < COVER_FETCH_RETRY_ATTEMPTS - 1) {
        await wait(COVER_FETCH_RETRY_DELAY_MS);
      }
    }

    return null;
  })();

  pendingAuthorPhotoRequests.set(photoFilename, request);

  lastAuthorPhotoFetch = request.then(
    () => undefined,
    () => undefined,
  );

  request.finally(() => {
    pendingAuthorPhotoRequests.delete(photoFilename);
  });

  return request;
};

type RawCatalogueOfficeRecord = Record<string, unknown>;

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

  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const dateContainer = value as { date?: unknown; value?: unknown; timestamp?: unknown };

    if (dateContainer.date !== undefined) {
      const nested = parseDateInput(dateContainer.date);
      if (nested) {
        return nested;
      }
    }

    if (dateContainer.value !== undefined) {
      const nested = parseDateInput(dateContainer.value);
      if (nested) {
        return nested;
      }
    }

    if (dateContainer.timestamp !== undefined) {
      const nested = parseDateInput(dateContainer.timestamp);
      if (nested) {
        return nested;
      }
    }
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

const getField = (source: RawCatalogueOfficeRecord, ...keys: string[]): unknown => {
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

const extractDatabaseRows = (payload: unknown): RawCatalogueOfficeRecord[] => {
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

  return result.filter((item): item is RawCatalogueOfficeRecord => Boolean(item) && typeof item === 'object');
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

const getLogoFromPublisher = (publisher?: string): string => {
  if (!publisher) {
    return UniversBD;
  }

  const normalized = publisher.toLowerCase();

  if (normalized.includes('manga')) {
    return UniversManga;
  }

  if (normalized.includes('jeunesse')) {
    return UniversJeune;
  }

  if (normalized.includes('livre') || normalized.includes('hugo')) {
    return UniversLivre;
  }

  return UniversBD;
};

const extractShippingMessage = (record: RawCatalogueOfficeRecord): string | undefined => {
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
    getField(
      record,
      'dateexpedition',
      'datechronolivre',
      'dateenvoi',
      'datepreparation',
      'dateexp',
      'datelimitechrono',
      'dateenvoicvimprimeur',
    ),
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

const normalizeBookFromDatabaseRecord = async (
  record: RawCatalogueOfficeRecord,
  loadCover = true,
): Promise<CatalogueBook | null> => {
  const rawEan = ensureString(getField(record, 'iditem', 'ean', 'idarticle'));
  const sanitizedEan = rawEan?.replace(/[^0-9xX]/g, '')?.toUpperCase();
  const ean = sanitizedEan && sanitizedEan.length ? sanitizedEan : rawEan;

  // Validation stricte de l'EAN
  if (!ean || typeof ean !== 'string' || ean.trim().length === 0) {
    return null;
  }

  // Champs de base
  const title = ensureString(getField(record, 'titre', 'title')) ?? `Article ${ean}`;
  const authors = ensureString(getField(record, 'auteurs', 'auteurssimple', 'createur')) ?? '';
  const publisher = ensureString(getField(record, 'publisher', 'codepublisher', 'editeur')) ?? '';
  const publicationDate = formatDisplayDate(getField(record, 'datemev', 'dateparution')) ?? '';
  const priceHT = formatPrice(getField(record, 'priceht', 'priceh', 'prixht', 'prix'));
  const stock = ensureNumber(getField(record, 'stocks', 'stock')) ?? 0;

  // Détails avancés
  const subtitle = ensureString(getField(record, 'soustitre', 'subtitle'));
  const isbn = ensureString(getField(record, 'isbn'));
  const idHachette = ensureString(getField(record, 'idhachette'));
  const typeBook = ensureString(getField(record, 'typebook'));
  const countPage = ensureNumber(getField(record, 'countpage', 'pagination'));
  const faconnage = ensureString(getField(record, 'faconnage'));
  const isNumerique = ensureNumber(getField(record, 'isnumerique')) === 1;
  const age = ensureString(getField(record, 'age'));
  const auteursSimple = ensureString(getField(record, 'auteurssimple'));
  const codePublisher = ensureString(getField(record, 'codepublisher'));
  const officeCode = ensureString(getField(record, 'office', 'codeoffice'));
  const priceTTC = formatPrice(getField(record, 'price', 'pricettc'));
  const hauteur = ensureNumber(getField(record, 'hauteur'));
  const largeur = ensureNumber(getField(record, 'largeur'));
  const serie = ensureString(getField(record, 'serie'));
  const collection = ensureString(getField(record, 'collection'));
  const sousTitre = ensureString(getField(record, 'soustitre'));

  // Construction des métadonnées
  const metadata: CatalogueBookDetailEntry[] = [];
  const specifications: CatalogueBookDetailEntry[] = [];
  const badges: string[] = [];

  if (publisher) {
    metadata.push({ label: 'Marque éditoriale', value: publisher });
    badges.push(publisher);
  }
  if (collection) {
    metadata.push({ label: 'Collection', value: collection });
    badges.push(collection);
  }
  if (serie) {
    metadata.push({ label: 'Série', value: serie });
    badges.push(serie);
  }
  if (typeBook) {
    metadata.push({ label: 'Type', value: typeBook });
  }
  if (countPage) {
    specifications.push({ label: 'Nombre de pages', value: `${countPage} pages` });
  }
  if (faconnage) {
    specifications.push({ label: 'Façonnage', value: faconnage });
  }
  if (isbn) {
    specifications.push({ label: 'ISBN', value: isbn });
  }
  if (idHachette) {
    specifications.push({ label: 'Hachette', value: idHachette });
  }
  if (hauteur && largeur) {
    specifications.push({ label: 'Dimensions', value: `${largeur} x ${hauteur} mm` });
  }
  if (publicationDate) {
    specifications.push({ label: 'Date de parution', value: publicationDate });
  }

  const details: CatalogueBookDetail = {
    subtitle: sousTitre || subtitle,
    badges: badges.length > 0 ? badges : undefined,
    metadata,
    specifications,
    stats: [],
    officeCode,
    priceTTC,
    availabilityStatus: 'Disponible',
    universLogo: getLogoFromPublisher(publisher),
  };

  if (age) {
    details.recommendedAge = age;
  }

  // Récupérer la couverture de manière asynchrone si demandé
  let cover = FALLBACK_COVER_DATA_URL;
  if (loadCover && ean) {
    const coverUrl = await fetchCover(ean);
    if (coverUrl) {
      cover = coverUrl;
    }
  } else if (ean) {
    // Charger la couverture en arrière-plan sans bloquer
    void fetchCover(ean).then(coverUrl => {
      if (coverUrl) {
        // La couverture sera mise en cache pour une utilisation future
      }
    }).catch(() => {
      // Ignorer les erreurs silencieusement
    });
  }

  return {
    cover,
    title,
    ean,
    authors: auteursSimple || authors,
    publisher: publisher || codePublisher || '',
    publicationDate: publicationDate || 'À confirmer',
    priceHT,
    stock,
    color: getColorFromPublisher(publisher),
    ribbonText: isNumerique ? 'Numérique' : undefined,
    details,
  };
};

const normalizeBookFromRecord = async (
  record: RawCatalogueOfficeRecord,
): Promise<CatalogueBook | null> => {
  const rawEan = ensureString(
    getField(
      record,
      'ean',
      'idarticle',
      'id_article',
      'codeean',
      'iditem',
      'isbn13',
      'isbn',
    ),
  );
  const sanitizedEan = rawEan?.replace(/[^0-9xX]/g, '')?.toUpperCase();
  const ean = sanitizedEan && sanitizedEan.length ? sanitizedEan : rawEan;

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
  const priceHT = formatPrice(
    getField(record, 'prixht', 'prix_public_ht', 'prixpublicht', 'prix', 'priceht', 'price'),
  );
  const stock = ensureNumber(
    getField(record, 'stock', 'stockdispo', 'qtestock', 'quantitestock', 'stocklibrairie', 'stocks'),
  ) ?? 0;
  return {
    cover: FALLBACK_COVER_DATA_URL,
    title,
    ean,
    authors,
    publisher,
    publicationDate,
    priceHT,
    stock,
    color: getColorFromPublisher(publisher),
    ribbonText: 'À paraître',
  };
};

const buildCatalogueOfficeGroups = async (
  records: RawCatalogueOfficeRecord[],
): Promise<CatalogueOfficeGroup[]> => {
  const groupsMap = new Map<
    string,
    {
      office: string;
      records: RawCatalogueOfficeRecord[];
      date?: string;
      rawDate?: unknown;
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

    const rawDate = getField(
      record,
      'datemev',
      'date',
      'dateparution',
      'nextdate',
      'dateoffre',
    );

    if (group.rawDate === undefined && rawDate !== undefined) {
      group.rawDate = rawDate;
    }

    if (!group.date) {
      group.date = formatDisplayDate(rawDate) ?? undefined;
    }

    if (!group.shipping) {
      group.shipping = extractShippingMessage(record);
    }
  });

  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const startOfTodayTime = startOfToday.getTime();

  const groups = await Promise.all(
    Array.from(groupsMap.values())
      .sort((a, b) => {
        const dateA = parseDateInput(a.rawDate ?? a.date);
        const dateB = parseDateInput(b.rawDate ?? b.date);

        const hasDateA = dateA !== null;
        const hasDateB = dateB !== null;

        if (hasDateA !== hasDateB) {
          return hasDateA ? -1 : 1;
        }

        if (!dateA || !dateB) {
          return a.order - b.order;
        }

        const timeA = dateA.getTime();
        const timeB = dateB.getTime();
        const isFutureA = timeA >= startOfTodayTime;
        const isFutureB = timeB >= startOfTodayTime;

        if (isFutureA !== isFutureB) {
          return isFutureA ? -1 : 1;
        }

        if (isFutureA && isFutureB) {
          if (timeA !== timeB) {
            return timeA - timeB;
          }
          return a.order - b.order;
        }

        if (timeA !== timeB) {
          return timeB - timeA;
        }

        return a.order - b.order;
      })
      .map(async group => {
        const books = (
          await Promise.all(group.records.map(record => normalizeBookFromRecord(record)))
        ).filter((book): book is CatalogueBook => book !== null);

        if (!books.length) {
          return null;
        }

        return {
          office: group.office,
          date: group.date ?? 'À confirmer',
          shipping: group.shipping ?? 'Expédition à confirmer',
          books,
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
  const coverCache = new Map<string, Promise<string | null>>();
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

        let coverPromise = coverCache.get(ean);

        if (!coverPromise) {
          coverPromise = fetchCover(ean).catch(() => null);
          coverCache.set(ean, coverPromise);
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
    const requestPayload = {
      query: NEXT_OFFICES_SQL_QUERY,
    };
    const securePayload = await prepareSecureJsonPayload(requestPayload);
    const headers = new Headers({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    });

    applySecurePayloadHeaders(headers, securePayload.encrypted);
    logSecurePayloadRequest(
      CATALOGUE_OFFICES_ENDPOINT,
      requestPayload,
      securePayload.body,
      securePayload.encrypted,
    );
    const response = await fetchWithOAuth(CATALOGUE_OFFICES_ENDPOINT, {
      method: 'POST',
      headers,
      body: securePayload.body,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }

    const payload = (await response.json()) as DatabaseApiResponse;
    const records = extractDatabaseRows(payload);

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
        void hydrateCatalogueOfficeGroupsWithCovers(groups, { onCoverProgress }).catch(() => {
          // Silently ignore cover hydration errors
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
    throw error;
  }
}

export const FALLBACK_CATALOGUE_COVER = FALLBACK_COVER_DATA_URL;

export async function fetchCatalogueCover(ean: string): Promise<string | null> {
  return fetchCover(ean);
}

export async function fetchCatalogueKiosques(): Promise<CatalogueKiosqueGroup[]> {
  const endpoint = 'fetchCatalogueKiosques';
  logRequest(endpoint);
  const data: CatalogueKiosqueGroup[] = [];
  logResponse(endpoint, data);
  return Promise.resolve(data);
}

export async function fetchCatalogueEditions(): Promise<CatalogueEdition[]> {
  const endpoint = 'fetchCatalogueEditions';
  logRequest(endpoint);
  const data: CatalogueEdition[] = [];
  logResponse(endpoint, data);
  return Promise.resolve(data);
}

const decodeHtmlEntities = (text: string): string => {
  if (typeof document !== 'undefined') {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
  }

  // Fallback pour le cas où document n'est pas disponible
  const entities: Record<string, string> = {
    '&nbsp;': ' ',
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&eacute;': 'é',
    '&egrave;': 'è',
    '&ecirc;': 'ê',
    '&agrave;': 'à',
    '&acirc;': 'â',
    '&icirc;': 'î',
    '&ocirc;': 'ô',
    '&ucirc;': 'û',
    '&ccedil;': 'ç',
    '&rsquo;': '\u2019',
    '&lsquo;': '\u2018',
    '&rdquo;': '\u201D',
    '&ldquo;': '\u201C',
    '&ndash;': '\u2013',
    '&mdash;': '\u2014',
    '&hellip;': '\u2026',
  };

  let decoded = text;
  for (const [entity, char] of Object.entries(entities)) {
    decoded = decoded.replace(new RegExp(entity, 'g'), char);
  }

  // Décoder les entités numériques comme &#233;
  decoded = decoded.replace(/&#(\d+);/g, (_, code) => {
    return String.fromCharCode(parseInt(code, 10));
  });

  // Décoder les entités hexadécimales comme &#x00E9;
  decoded = decoded.replace(/&#x([0-9A-Fa-f]+);/g, (_, code) => {
    return String.fromCharCode(parseInt(code, 16));
  });

  return decoded;
};

const stripHtmlTags = (html: string): string => {
  // Remplacer les balises <p>, <br>, <div> par des sauts de ligne
  let text = html.replace(/<\/p>/gi, '\n\n');
  text = text.replace(/<br\s*\/?>/gi, '\n');
  text = text.replace(/<\/div>/gi, '\n');

  // Supprimer toutes les autres balises HTML
  text = text.replace(/<[^>]*>/g, '');

  // Nettoyer les sauts de ligne multiples
  text = text.replace(/\n{3,}/g, '\n\n');

  // Trim les espaces en début et fin
  text = text.trim();

  return text;
};

const cleanHtmlText = (html: string): string => {
  // D'abord supprimer les balises HTML
  const withoutTags = stripHtmlTags(html);

  // Puis décoder les entités HTML
  const decoded = decodeHtmlEntities(withoutTags);

  return decoded;
};

async function fetchCatalogueBookTexts(ean: string): Promise<CatalogueText[]> {
  try {
    const requestPayload = {
      query: `SELECT * FROM [catalogTexts] WHERE idItem = '${ean}' ORDER BY idTypeTexte;`,
    };
    const securePayload = await prepareSecureJsonPayload(requestPayload);
    const headers = new Headers({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    });

    applySecurePayloadHeaders(headers, securePayload.encrypted);
    logSecurePayloadRequest(
      CATALOGUE_OFFICES_ENDPOINT,
      requestPayload,
      securePayload.body,
      securePayload.encrypted,
    );

    const response = await fetchWithOAuth(CATALOGUE_OFFICES_ENDPOINT, {
      method: 'POST',
      headers,
      body: securePayload.body,
    });

    if (response.ok) {
      const payload = (await response.json()) as DatabaseApiResponse;
      const records = extractDatabaseRows(payload);

      const texts: CatalogueText[] = records
        .map(record => {
          const idTypeTexte = ensureString(getField(record, 'idTypeTexte', 'idtypetexte'));
          const rawText = ensureString(getField(record, 'texte', 'text', 'description', 'resume'));

          if (idTypeTexte && rawText) {
            const cleanedText = cleanHtmlText(rawText);
            return {
              idTypeTexte,
              texte: cleanedText,
            };
          }
          return null;
        })
        .filter((text): text is CatalogueText => text !== null);

      return texts;
    }

    return [];
  } catch {
    return [];
  }
}

async function fetchCatalogueBookAuthors(ean: string): Promise<CatalogueAuthor[]> {
  try {
    // Requête optimisée avec LEFT JOIN pour récupérer auteurs et biographies en une seule fois
    const requestPayload = {
      query: `
        SELECT
          a.*,
          t.texte as bioTexte
        FROM [catalogAutors] a
        LEFT JOIN [catalogAutorsTexts] t ON a.idAuthor = t.idAuthor
        WHERE a.idItem = '${ean}'
        ORDER BY a.sortOrder ASC;
      `,
    };
    const securePayload = await prepareSecureJsonPayload(requestPayload);
    const headers = new Headers({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    });

    applySecurePayloadHeaders(headers, securePayload.encrypted);
    logSecurePayloadRequest(
      CATALOGUE_OFFICES_ENDPOINT,
      requestPayload,
      securePayload.body,
      securePayload.encrypted,
    );

    const response = await fetchWithOAuth(CATALOGUE_OFFICES_ENDPOINT, {
      method: 'POST',
      headers,
      body: securePayload.body,
    });

    if (response.ok) {
      const payload = (await response.json()) as DatabaseApiResponse;
      const records = extractDatabaseRows(payload);

      if (records.length > 0) {
        const authors = await Promise.all(
          records.map(async (record) => {
            const idAuthor = ensureString(getField(record, 'idAuthor', 'idauthor', 'authorid'));
            if (!idAuthor) {
              return null;
            }

            const firstName = ensureString(getField(record, 'firstName', 'firstname', 'prenom'));
            const lastName = ensureString(getField(record, 'lastName', 'lastname', 'nom'));
            const fullName = lastName && firstName
              ? `${firstName} ${lastName}`
              : ensureString(getField(record, 'fullName', 'fullname', 'name', 'nom'));
            const photoFilename = ensureString(getField(record, 'photo', 'isPhoto', 'image'));
            const sortOrder = ensureNumber(getField(record, 'sortOrder', 'order', 'ordre'));

            // Récupérer et nettoyer la biographie depuis la jointure
            const rawBio = ensureString(getField(record, 'bioTexte', 'texte', 'text', 'bio', 'biographie'));
            const bio = rawBio ? cleanHtmlText(rawBio) : undefined;

            // Récupérer la photo de l'auteur si disponible
            let photo: string | undefined = undefined;
            if (photoFilename && photoFilename !== '0' && photoFilename !== 'NULL') {
              const photoUrl = await fetchAuthorPhoto(photoFilename);
              if (photoUrl) {
                photo = photoUrl;
              }
            }

            return {
              idAuthor,
              firstName,
              lastName,
              fullName,
              photo,
              bio,
              sortOrder,
            } as CatalogueAuthor;
          })
        );

        const validAuthors = authors.filter((author): author is CatalogueAuthor => author !== null);

        // Trier par sortOrder si disponible (déjà trié par la requête SQL mais on garde le fallback)
        validAuthors.sort((a, b) => {
          if (a.sortOrder !== undefined && b.sortOrder !== undefined) {
            return a.sortOrder - b.sortOrder;
          }
          return 0;
        });

        return validAuthors;
      }
    }

    return [];
  } catch {
    return [];
  }
}

export async function fetchCatalogueBook(
  ean: string,
): Promise<CatalogueBook | null> {
  const endpoint = `fetchCatalogueBook:${ean}`;
  logRequest(endpoint);

  try {
    // Essayer d'abord de récupérer depuis la base de données
    const requestPayload = {
      query: `SELECT * FROM [catalogBooks] WHERE idItem = '${ean}';`,
    };
    const securePayload = await prepareSecureJsonPayload(requestPayload);
    const headers = new Headers({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    });

    applySecurePayloadHeaders(headers, securePayload.encrypted);
    logSecurePayloadRequest(
      CATALOGUE_OFFICES_ENDPOINT,
      requestPayload,
      securePayload.body,
      securePayload.encrypted,
    );

    const response = await fetchWithOAuth(CATALOGUE_OFFICES_ENDPOINT, {
      method: 'POST',
      headers,
      body: securePayload.body,
    });

    if (response.ok) {
      const payload = (await response.json()) as DatabaseApiResponse;
      const records = extractDatabaseRows(payload);

      if (records.length > 0) {
        const record = records[0];
        const book = await normalizeBookFromDatabaseRecord(record);
        if (book) {
          // Récupérer les textes depuis catalogTexts
          const texts = await fetchCatalogueBookTexts(ean);
          if (texts.length > 0 && book.details) {
            book.details.texts = texts;
            // Garder le summary pour la compatibilité (utiliser le premier texte)
            book.details.summary = texts[0]?.texte;
          }

          // Récupérer les auteurs depuis catalogAutors
          const authors = await fetchCatalogueBookAuthors(ean);
          if (authors.length > 0 && book.details) {
            book.details.authors = authors;

            // Si on a plusieurs auteurs, combiner leurs biographies pour authorBio
            const combinedBio = authors
              .filter(author => author.bio)
              .map(author => {
                const name = author.fullName || `${author.firstName || ''} ${author.lastName || ''}`.trim();
                return name ? `${name}\n\n${author.bio}` : author.bio;
              })
              .join('\n\n---\n\n');

            if (combinedBio) {
              book.details.authorBio = combinedBio;
            }
          }

          logResponse(endpoint, book);
          return book;
        }
      }
    }

    // Aucune donnée disponible dans l'API
    logResponse(endpoint, null);
    return Promise.resolve(null);
  } catch {
    logResponse(endpoint, null);
    return Promise.resolve(null);
  }
}

export async function fetchCatalogueRelatedBooks(
  ean: string,
): Promise<CatalogueBook[]> {
  const endpoint = `fetchCatalogueRelatedBooks:${ean}`;
  logRequest(endpoint);
  const data: CatalogueBook[] = [];
  logResponse(endpoint, data);
  return Promise.resolve(data);
}

export async function fetchCataloguePastBooksFromSeries(
  ean: string,
): Promise<CatalogueBook[]> {
  const endpoint = `fetchCataloguePastBooksFromSeries:${ean}`;
  logRequest(endpoint);

  try {
    // D'abord récupérer le livre actuel pour obtenir la série
    const requestPayload = {
      query: `SELECT * FROM [catalogBooks] WHERE idItem = '${ean}';`,
    };
    const securePayload = await prepareSecureJsonPayload(requestPayload);
    const headers = new Headers({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    });

    applySecurePayloadHeaders(headers, securePayload.encrypted);
    logSecurePayloadRequest(
      CATALOGUE_OFFICES_ENDPOINT,
      requestPayload,
      securePayload.body,
      securePayload.encrypted,
    );

    const response = await fetchWithOAuth(CATALOGUE_OFFICES_ENDPOINT, {
      method: 'POST',
      headers,
      body: securePayload.body,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }

    const payload = (await response.json()) as DatabaseApiResponse;
    const records = extractDatabaseRows(payload);

    if (records.length === 0) {
      return [];
    }

    const record = records[0];
    const serie = ensureString(getField(record, 'serie'));

    if (!serie) {
      return [];
    }

    // Maintenant récupérer les 10 derniers livres parus de la même série
    const pastRequestPayload = {
      query: `SELECT TOP 10 * FROM [catalogBooks] WHERE [serie] = '${serie}' AND [dateMev] < GETDATE() AND [idItem] <> '${ean}' ORDER BY [dateMev] DESC;`,
    };
    const pastSecurePayload = await prepareSecureJsonPayload(pastRequestPayload);
    const pastHeaders = new Headers({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    });

    applySecurePayloadHeaders(pastHeaders, pastSecurePayload.encrypted);
    logSecurePayloadRequest(
      CATALOGUE_OFFICES_ENDPOINT,
      pastRequestPayload,
      pastSecurePayload.body,
      pastSecurePayload.encrypted,
    );

    const pastResponse = await fetchWithOAuth(CATALOGUE_OFFICES_ENDPOINT, {
      method: 'POST',
      headers: pastHeaders,
      body: pastSecurePayload.body,
    });

    if (!pastResponse.ok) {
      throw new Error(`HTTP ${pastResponse.status} ${pastResponse.statusText}`);
    }

    const pastPayload = (await pastResponse.json()) as DatabaseApiResponse;
    const pastRecords = extractDatabaseRows(pastPayload);

    if (pastRecords.length === 0) {
      return [];
    }

    // Normaliser les livres récupérés - charger les couvertures car c'est l'onglet par défaut
    const books = (
      await Promise.all(pastRecords.map(record => normalizeBookFromDatabaseRecord(record, true)))
    ).filter((book): book is CatalogueBook => book !== null);

    logResponse(endpoint, books);
    return books;
  } catch {
    logResponse(endpoint, []);
    return [];
  }
}

export async function fetchCatalogueSameCollectionBooks(
  ean: string,
): Promise<CatalogueBook[]> {
  const endpoint = `fetchCatalogueSameCollectionBooks:${ean}`;
  logRequest(endpoint);

  try {
    // Récupérer le livre actuel pour obtenir la collection, la série et la date
    const requestPayload = {
      query: `
        DECLARE @currentBookDate DATE;
        DECLARE @currentCollection NVARCHAR(255);
        DECLARE @currentSerie NVARCHAR(255);

        SELECT @currentBookDate = dateMev, @currentCollection = collection, @currentSerie = serie
        FROM [catalogBooks]
        WHERE idItem = '${ean}';

        WITH CTE AS (
            SELECT  *,
                    ROW_NUMBER() OVER (
                        PARTITION BY serie
                        ORDER BY ABS(DATEDIFF(DAY, dateMev, @currentBookDate))
                    ) AS rn
            FROM [catalogBooks]
            WHERE [collection] = @currentCollection
              AND LOWER([serie]) <> LOWER(@currentSerie)
              AND dateMev BETWEEN DATEADD(YEAR, -1, @currentBookDate) AND DATEADD(YEAR, 1, @currentBookDate)
        )
        SELECT TOP 10 *
        FROM CTE
        WHERE rn = 1
        ORDER BY serie;
      `,
    };
    const securePayload = await prepareSecureJsonPayload(requestPayload);
    const headers = new Headers({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    });

    applySecurePayloadHeaders(headers, securePayload.encrypted);
    logSecurePayloadRequest(
      CATALOGUE_OFFICES_ENDPOINT,
      requestPayload,
      securePayload.body,
      securePayload.encrypted,
    );

    const response = await fetchWithOAuth(CATALOGUE_OFFICES_ENDPOINT, {
      method: 'POST',
      headers,
      body: securePayload.body,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }

    const payload = (await response.json()) as DatabaseApiResponse;
    const records = extractDatabaseRows(payload);

    if (records.length === 0) {
      return [];
    }

    // Normaliser les livres récupérés avec chargement des couvertures
    const books = (
      await Promise.all(records.map(record => normalizeBookFromDatabaseRecord(record, true)))
    ).filter((book): book is CatalogueBook => book !== null);

    logResponse(endpoint, books);
    return books;
  } catch {
    logResponse(endpoint, []);
    return [];
  }
}

export async function fetchCatalogueUpcomingBooksFromSeries(
  ean: string,
): Promise<CatalogueBook[]> {
  const endpoint = `fetchCatalogueUpcomingBooksFromSeries:${ean}`;
  logRequest(endpoint);

  try {
    // D'abord récupérer le livre actuel pour obtenir la série
    const requestPayload = {
      query: `SELECT * FROM [catalogBooks] WHERE idItem = '${ean}';`,
    };
    const securePayload = await prepareSecureJsonPayload(requestPayload);
    const headers = new Headers({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    });

    applySecurePayloadHeaders(headers, securePayload.encrypted);
    logSecurePayloadRequest(
      CATALOGUE_OFFICES_ENDPOINT,
      requestPayload,
      securePayload.body,
      securePayload.encrypted,
    );

    const response = await fetchWithOAuth(CATALOGUE_OFFICES_ENDPOINT, {
      method: 'POST',
      headers,
      body: securePayload.body,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }

    const payload = (await response.json()) as DatabaseApiResponse;
    const records = extractDatabaseRows(payload);

    if (records.length === 0) {
      return [];
    }

    const record = records[0];
    const serie = ensureString(getField(record, 'serie'));

    if (!serie) {
      return [];
    }

    // Maintenant récupérer les livres à paraître de la même série (limité à 10)
    const upcomingRequestPayload = {
      query: `SELECT TOP 10 * FROM [catalogBooks] WHERE [serie] = '${serie}' AND [dateMev] > GETDATE() AND [idItem] <> '${ean}' ORDER BY [dateMev] ASC;`,
    };
    const upcomingSecurePayload = await prepareSecureJsonPayload(upcomingRequestPayload);
    const upcomingHeaders = new Headers({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    });

    applySecurePayloadHeaders(upcomingHeaders, upcomingSecurePayload.encrypted);
    logSecurePayloadRequest(
      CATALOGUE_OFFICES_ENDPOINT,
      upcomingRequestPayload,
      upcomingSecurePayload.body,
      upcomingSecurePayload.encrypted,
    );

    const upcomingResponse = await fetchWithOAuth(CATALOGUE_OFFICES_ENDPOINT, {
      method: 'POST',
      headers: upcomingHeaders,
      body: upcomingSecurePayload.body,
    });

    if (!upcomingResponse.ok) {
      throw new Error(`HTTP ${upcomingResponse.status} ${upcomingResponse.statusText}`);
    }

    const upcomingPayload = (await upcomingResponse.json()) as DatabaseApiResponse;
    const upcomingRecords = extractDatabaseRows(upcomingPayload);

    if (upcomingRecords.length === 0) {
      return [];
    }

    // Normaliser les livres récupérés avec chargement des couvertures
    const books = (
      await Promise.all(upcomingRecords.map(record => normalizeBookFromDatabaseRecord(record, true)))
    ).filter((book): book is CatalogueBook => book !== null);

    logResponse(endpoint, books);
    return books;
  } catch {
    logResponse(endpoint, []);
    return [];
  }
}

export async function fetchCatalogueAuthors(
  ean: string,
): Promise<CatalogueAuthor[]> {
  const endpoint = `fetchCatalogueAuthors:${ean}`;
  logRequest(endpoint);

  try {
    const requestPayload = {
      query: `SELECT * FROM [catalogAutors] WHERE idItem = '${ean}' ORDER BY sortOrder ASC;`,
    };

    const securePayload = await prepareSecureJsonPayload(requestPayload);
    const headers = new Headers({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    });

    applySecurePayloadHeaders(headers, securePayload.encrypted);
    logSecurePayloadRequest(
      CATALOGUE_OFFICES_ENDPOINT,
      requestPayload,
      securePayload.body,
      securePayload.encrypted,
    );

    const response = await fetchWithOAuth(CATALOGUE_OFFICES_ENDPOINT, {
      method: 'POST',
      headers,
      body: securePayload.body,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }

    const payload = (await response.json()) as DatabaseApiResponse;
    const records = extractDatabaseRows(payload);

    if (records.length === 0) {
      return [];
    }

    // Normaliser les auteurs
    const authors: CatalogueAuthor[] = records.map(record => ({
      idAuthor: ensureString(getField(record, 'idauthor', 'id')) ?? '',
      firstName: ensureString(getField(record, 'firstname', 'prenom')),
      lastName: ensureString(getField(record, 'lastname', 'nom')),
      fullName: ensureString(getField(record, 'fullname', 'nomcomplet')),
      photo: ensureString(getField(record, 'photo', 'isphoto')),
      bio: ensureString(getField(record, 'bio', 'biographie')),
      sortOrder: ensureNumber(getField(record, 'sortorder', 'ordre')),
      fonction: ensureString(getField(record, 'fonction', 'idfonction', 'function')),
    }));

    logResponse(endpoint, authors);
    return authors;
  } catch {
    logResponse(endpoint, []);
    return [];
  }
}

export async function fetchCatalogueBooksByAuthors(
  currentEan: string,
  authors: CatalogueAuthor[],
): Promise<CatalogueBook[]> {
  const endpoint = 'fetchCatalogueBooksByAuthors';
  logRequest(endpoint);

  if (authors.length === 0) {
    logResponse(endpoint, []);
    return [];
  }

  try {
    // Calculate books per author to get ~10 books total
    const booksPerAuthor = Math.max(1, Math.ceil(10 / authors.length));

    // Fetch books for each author
    const bookPromises = authors.map(async (author) => {
      const requestPayload = {
        query: `
          SELECT TOP ${booksPerAuthor} cb.*
          FROM [catalogBooks] cb
          INNER JOIN [catalogAutors] ca ON cb.idItem = ca.idItem
          WHERE ca.idAuthor = '${author.idAuthor}'
            AND cb.idItem <> '${currentEan}'
            AND cb.dateMev IS NOT NULL
          ORDER BY cb.dateMev DESC;
        `,
      };

      const securePayload = await prepareSecureJsonPayload(requestPayload);
      const headers = new Headers({
        'Content-Type': 'application/json',
        Accept: 'application/json',
      });

      applySecurePayloadHeaders(headers, securePayload.encrypted);
      logSecurePayloadRequest(
        CATALOGUE_OFFICES_ENDPOINT,
        requestPayload,
        securePayload.body,
        securePayload.encrypted,
      );

      const response = await fetchWithOAuth(CATALOGUE_OFFICES_ENDPOINT, {
        method: 'POST',
        headers,
        body: securePayload.body,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }

      const payload = (await response.json()) as DatabaseApiResponse;
      const records = extractDatabaseRows(payload);

      return (
        await Promise.all(records.map(record => normalizeBookFromDatabaseRecord(record, false)))
      ).filter((book): book is CatalogueBook => book !== null);
    });

    const allBooksArrays = await Promise.all(bookPromises);
    const allBooks = allBooksArrays.flat();

    // Remove duplicates (same book can be by multiple authors)
    const uniqueBooks = allBooks.filter((book, index, self) =>
      index === self.findIndex((b) => b.ean === book.ean)
    );

    // Limit to 10 books maximum
    const finalBooks = uniqueBooks.slice(0, 10);

    logResponse(endpoint, finalBooks);
    return finalBooks;
  } catch {
    logResponse(endpoint, []);
    return [];
  }
}

export async function fetchNextCatalogueOffice(
  options: FetchCatalogueOfficesOptions = {},
): Promise<CatalogueOfficeGroup | null> {
  const { hydrateCovers = true, onCoverProgress } = options;
  const endpoint = 'fetchNextCatalogueOffice';
  logRequest(endpoint);

  try {
    const requestPayload = {
      query: NEXT_OFFICE_SQL_QUERY,
    };
    const securePayload = await prepareSecureJsonPayload(requestPayload);
    const headers = new Headers({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    });

    applySecurePayloadHeaders(headers, securePayload.encrypted);
    logSecurePayloadRequest(
      CATALOGUE_OFFICES_ENDPOINT,
      requestPayload,
      securePayload.body,
      securePayload.encrypted,
    );
    const response = await fetchWithOAuth(CATALOGUE_OFFICES_ENDPOINT, {
      method: 'POST',
      headers,
      body: securePayload.body,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }

    const payload = (await response.json()) as DatabaseApiResponse;
    const records = extractDatabaseRows(payload);

    if (!records.length) {
      throw new Error("La base de donnees n'a retourne aucun resultat");
    }

    const groups = await buildCatalogueOfficeGroups(records);

    if (!groups.length) {
      throw new Error('Impossible de construire l\'office a partir des donnees recues');
    }

    const nextOffice = groups[0] ?? null;

    if (!nextOffice) {
      return null;
    }

    if (!hydrateCovers) {
      logResponse(endpoint, nextOffice);

      if (onCoverProgress) {
        void hydrateCatalogueOfficeGroupsWithCovers([nextOffice], { onCoverProgress }).catch(() => {
          // Silently ignore hydration errors
        });
      }

      return nextOffice;
    }

    const hydratedGroups = await hydrateCatalogueOfficeGroupsWithCovers([nextOffice], {
      onCoverProgress,
    });

    const hydratedOffice = hydratedGroups[0] ?? null;
    logResponse(endpoint, hydratedOffice);
    return hydratedOffice;
  } catch (error) {
    throw error;
  }
}

export async function fetchCatalogueSearchSuggestions(
  query: string,
): Promise<CatalogueSearchSuggestion[]> {
  const endpoint = `fetchCatalogueSearchSuggestions:${query}`;
  logRequest(endpoint);

  if (!query || query.trim().length < 2) {
    return [];
  }

  const searchTerm = query.trim();

  try {
    const searchQuery = `
      SELECT TOP 15
        idItem,
        titre,
        auteurssimple,
        publisher,
        serie
      FROM catalogBooks
      WHERE (
        idItem LIKE '%${searchTerm}%'
        OR titre LIKE '%${searchTerm}%'
        OR auteurssimple LIKE '%${searchTerm}%'
        OR serie LIKE '%${searchTerm}%'
      )
      AND idItem IS NOT NULL
      AND idItem <> ''
      AND LEN(LTRIM(RTRIM(idItem))) > 0
      ORDER BY
        CASE
          WHEN idItem = '${searchTerm}' THEN 0
          WHEN idItem LIKE '${searchTerm}%' THEN 1
          WHEN titre LIKE '${searchTerm}%' THEN 2
          WHEN titre LIKE '%${searchTerm}%' THEN 3
          WHEN serie LIKE '${searchTerm}%' THEN 4
          ELSE 5
        END,
        titre ASC;
    `;

    const requestPayload = { query: searchQuery };
    const securePayload = await prepareSecureJsonPayload(requestPayload);
    const headers = new Headers({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    });

    applySecurePayloadHeaders(headers, securePayload.encrypted);
    logSecurePayloadRequest(
      CATALOGUE_OFFICES_ENDPOINT,
      requestPayload,
      securePayload.body,
      securePayload.encrypted,
    );

    const response = await fetchWithOAuth(CATALOGUE_OFFICES_ENDPOINT, {
      method: 'POST',
      headers,
      body: securePayload.body,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }

    const payload = (await response.json()) as DatabaseApiResponse;
    const records = extractDatabaseRows(payload);

    const suggestions: CatalogueSearchSuggestion[] = records.map(record => ({
      ean: ensureString(getField(record, 'idItem', 'iditem')) ?? '',
      title: ensureString(getField(record, 'titre', 'title')) ?? '',
      authors: ensureString(getField(record, 'auteurssimple', 'auteurs')) ?? '',
      publisher: ensureString(getField(record, 'publisher', 'editeur')) ?? '',
      serie: ensureString(getField(record, 'serie')),
      cover: FALLBACK_COVER_DATA_URL,
    }));

    logResponse(endpoint, suggestions);
    return suggestions;
  } catch {
    return [];
  }
}