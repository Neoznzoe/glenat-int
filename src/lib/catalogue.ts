import type { BookCardProps } from '@/components/BookCard';
import { fetchWithOAuth } from './oauth';
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

export interface CatalogueFilters {
  publisher?: string[];
  category?: string;
  authors?: string[];
}

export interface FetchCatalogueBooksOptions {
  seed?: string;
  signal?: AbortSignal;
  onProgress?: (page: CatalogueBooksPage) => void;
  filters?: CatalogueFilters;
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

let cachedPublishers: string[] | null = null;

export async function fetchCataloguePublishers(): Promise<string[]> {
  if (cachedPublishers) return cachedPublishers;

  const endpoint = 'fetchCataloguePublishers';
  logRequest(endpoint);

  try {
    const url = `${CATALOGUE_API_BASE}/publishers`;
    const response = await fetchWithOAuth(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }

    const payload = (await response.json()) as CatalogueApiResponse;
    const result = payload.result;

    let publishers: string[] = [];
    if (Array.isArray(result)) {
      publishers = result.filter((v): v is string => typeof v === 'string' && v.length > 0);
    }

    cachedPublishers = publishers;
    logResponse(endpoint, publishers);
    return publishers;
  } catch {
    return [];
  }
}

export interface FetchCatalogueReleasesOptions {
  hydrateCovers?: boolean;
  onCoverProgress?: (groups: CatalogueReleaseGroup[]) => void;
}

export async function fetchCatalogueReleases(
  options: FetchCatalogueReleasesOptions = {},
): Promise<CatalogueReleaseGroup[]> {
  const { hydrateCovers = true, onCoverProgress } = options;
  const endpoint = 'fetchCatalogueReleases';
  logRequest(endpoint);

  try {
    const url = `${CATALOGUE_API_BASE}/offices/past`;
    const response = await fetchWithOAuth(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }

    const payload = (await response.json()) as CatalogueApiResponse;
    const records = extractApiResult(payload);

    if (!records.length) {
      logResponse(endpoint, []);
      return [];
    }

    const allGroups = await buildCatalogueOfficeGroups(records);

    // Convert CatalogueOfficeGroup[] to CatalogueReleaseGroup[]
    let releaseGroups: CatalogueReleaseGroup[] = allGroups.map(g => ({
      date: g.date,
      books: g.books,
    }));

    if (!hydrateCovers) {
      logResponse(endpoint, releaseGroups);

      if (onCoverProgress) {
        // Hydrate covers in background, emitting progress as CatalogueReleaseGroup[]
        const officeGroups = allGroups.map(g => ({ ...g, books: g.books.map(b => ({ ...b })) }));
        void hydrateCatalogueOfficeGroupsWithCovers(officeGroups, {
          onCoverProgress: (updated) => {
            onCoverProgress(updated.map(g => ({ date: g.date, books: g.books })));
          },
        }).catch(() => {});
      }

      return releaseGroups;
    }

    // Hydrate covers before returning
    const officeGroups = allGroups.map(g => ({ ...g, books: g.books.map(b => ({ ...b })) }));
    const hydrated = await hydrateCatalogueOfficeGroupsWithCovers(officeGroups, {
      onCoverProgress: onCoverProgress
        ? (updated) => onCoverProgress(updated.map(g => ({ date: g.date, books: g.books })))
        : undefined,
    });

    releaseGroups = hydrated.map(g => ({ date: g.date, books: g.books }));
    logResponse(endpoint, releaseGroups);
    return releaseGroups;
  } catch (error) {
    throw error;
  }
}

export async function fetchCatalogueBooksWithPagination(
  page: number = 1,
  pageSize: number = 50,
  options: FetchCatalogueBooksOptions = {},
): Promise<CatalogueBooksPage> {
  const { seed, signal, onProgress, filters } = options;
  const endpoint = `fetchCatalogueBooksWithPagination:page=${page}`;
  logRequest(endpoint);

  try {
    const params = new URLSearchParams({
      p: String(page),
      size: String(pageSize),
    });
    if (seed) {
      params.set('seed', seed);
    }
    if (filters?.publisher && filters.publisher.length > 0) {
      params.set('publisher', filters.publisher.join(','));
    }
    if (filters?.category && filters.category !== 'Toutes') {
      params.set('category', filters.category);
    }

    const url = `${CATALOGUE_API_BASE}/books?${params.toString()}`;
    const response = await fetchWithOAuth(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }

    const payload = (await response.json()) as CatalogueApiResponse;

    // L'API peut retourner :
    // - result: [...rows...] (tableau plat de livres)
    // - result: {"0": {...}, "1": {...}, ...} (objet à clés numériques, sérialisation PHP)
    // - result: { books: [...], pagination: {...} } (structure paginée du handler)
    const resultAsArray = Array.isArray(payload.result)
      ? (payload.result as RawCatalogueOfficeRecord[])
      : toArrayIfArrayLike(payload.result) as RawCatalogueOfficeRecord[] | null;

    const bookRecords = resultAsArray
      ?? (() => {
          const structured = payload.result as Record<string, unknown> | undefined;
          if (Array.isArray(structured?.books)) return structured.books as RawCatalogueOfficeRecord[];
          const booksAsArray = toArrayIfArrayLike(structured?.books);
          if (booksAsArray) return booksAsArray as RawCatalogueOfficeRecord[];
          // Fallback imbriqué: result: { result: { books: [...] } }
          const nested = structured?.result as Record<string, unknown> | undefined;
          if (Array.isArray(nested?.books)) return nested.books as RawCatalogueOfficeRecord[];
          return extractApiResult(payload);
        })();

    // Lire la pagination depuis l'enveloppe ou depuis result.pagination
    const paginationSource = !resultAsArray
      ? ((payload.result as Record<string, unknown>)?.pagination ?? (payload.pagination as Record<string, unknown>))
      : payload.pagination;
    const paginationObj = paginationSource as { total?: number; pages?: number; page?: number; perPage?: number } | undefined;
    const totalBooks = ensureNumber(paginationObj?.total) ?? bookRecords.length;
    const totalPages = ensureNumber(paginationObj?.pages) ?? Math.ceil(totalBooks / pageSize);

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

const CATALOGUE_API_BASE = import.meta.env.DEV
  ? '/Api/v2.0/catalogue'
  : 'https://api-dev.groupe-glenat.com/Api/v2.0/catalogue';

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
const COVER_BATCH_CONCURRENCY = 5;
const COVER_IDB_NAME = 'glenat-covers';
const COVER_IDB_STORE = 'covers';
const COVER_IDB_VERSION = 1;
// Covers older than 7 days are re-fetched
const COVER_IDB_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const coverCache = new Map<string, string>();
const pendingCoverRequests = new Map<string, Promise<string | null>>();
const authorPhotoCache = new Map<string, string>();
const pendingAuthorPhotoRequests = new Map<string, Promise<string | null>>();

let lastAuthorPhotoFetch: Promise<unknown> = Promise.resolve();

// ─── IndexedDB cover cache ──────────────────────────────────────────
let idbPromise: Promise<IDBDatabase | null> | null = null;

const openCoverIdb = (): Promise<IDBDatabase | null> => {
  if (idbPromise) return idbPromise;
  idbPromise = new Promise<IDBDatabase | null>(resolve => {
    try {
      const req = indexedDB.open(COVER_IDB_NAME, COVER_IDB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(COVER_IDB_STORE)) {
          db.createObjectStore(COVER_IDB_STORE);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
  return idbPromise;
};

const idbGet = async (ean: string): Promise<string | null> => {
  const db = await openCoverIdb();
  if (!db) return null;
  return new Promise(resolve => {
    try {
      const tx = db.transaction(COVER_IDB_STORE, 'readonly');
      const store = tx.objectStore(COVER_IDB_STORE);
      const req = store.get(ean);
      req.onsuccess = () => {
        const entry = req.result as { data: string; ts: number } | undefined;
        if (entry && Date.now() - entry.ts < COVER_IDB_TTL_MS) {
          resolve(entry.data);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
};

const idbSet = async (ean: string, data: string): Promise<void> => {
  const db = await openCoverIdb();
  if (!db) return;
  try {
    const tx = db.transaction(COVER_IDB_STORE, 'readwrite');
    tx.objectStore(COVER_IDB_STORE).put({ data, ts: Date.now() }, ean);
  } catch {
    // Silently ignore write errors (quota, etc.)
  }
};

// ─── Concurrency limiter for cover fetches ──────────────────────────
let activeCoverFetches = 0;
const coverQueue: Array<{ resolve: () => void; signal?: AbortSignal }> = [];

const acquireCoverSlot = (signal?: AbortSignal): Promise<void> => {
  if (signal?.aborted) return Promise.reject(new DOMException('Aborted', 'AbortError'));

  if (activeCoverFetches < COVER_BATCH_CONCURRENCY) {
    activeCoverFetches++;
    return Promise.resolve();
  }
  return new Promise<void>((resolve, reject) => {
    const entry = { resolve, signal };
    coverQueue.push(entry);

    if (signal) {
      const onAbort = () => {
        const idx = coverQueue.indexOf(entry);
        if (idx !== -1) {
          coverQueue.splice(idx, 1);
          reject(new DOMException('Aborted', 'AbortError'));
        }
      };
      signal.addEventListener('abort', onAbort, { once: true });
    }
  });
};

const releaseCoverSlot = () => {
  // Drain any already-aborted entries from the front of the queue
  while (coverQueue.length > 0 && coverQueue[0].signal?.aborted) {
    coverQueue.shift();
  }
  const next = coverQueue.shift();
  if (next) {
    next.resolve();
  } else {
    activeCoverFetches--;
  }
};

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

  // 1. Memory cache (instant)
  const cachedCover = coverCache.get(trimmedEan);
  if (cachedCover) {
    return cachedCover;
  }

  if (signal?.aborted) {
    return null;
  }

  // Deduplicate concurrent requests for the same EAN.
  // The pending request is signal-independent: it always completes and caches.
  // Callers can abort their *wait* via signal, but the underlying fetch continues
  // so other callers (and future visits) benefit from the result.
  let request = pendingCoverRequests.get(trimmedEan);

  if (!request) {
    request = (async () => {
      // 2. IndexedDB cache (fast, persists across sessions)
      const idbCover = await idbGet(trimmedEan);
      if (idbCover) {
        coverCache.set(trimmedEan, idbCover);
        return idbCover;
      }

      // 3. Network fetch with concurrency limit (no signal — let it complete)
      try {
        await acquireCoverSlot();
      } catch {
        return null;
      }
      try {
        return await fetchCoverFromNetwork(trimmedEan);
      } finally {
        releaseCoverSlot();
      }
    })();

    pendingCoverRequests.set(trimmedEan, request);
    request.finally(() => {
      pendingCoverRequests.delete(trimmedEan);
    });
  }

  // Allow caller to abort their wait via signal
  if (!signal) {
    return request;
  }

  return new Promise<string | null>((resolve) => {
    let settled = false;

    const onAbort = () => {
      if (settled) return;
      settled = true;
      resolve(null);
    };

    if (signal.aborted) {
      onAbort();
      return;
    }

    signal.addEventListener('abort', onAbort, { once: true });

    request.then((result) => {
      if (settled) return;
      settled = true;
      signal.removeEventListener('abort', onAbort);
      resolve(result);
    }).catch(() => {
      if (settled) return;
      settled = true;
      signal.removeEventListener('abort', onAbort);
      resolve(null);
    });
  });
};

const fetchCoverFromNetwork = async (ean: string, signal?: AbortSignal): Promise<string | null> => {
  for (let attempt = 0; attempt < COVER_FETCH_RETRY_ATTEMPTS; attempt += 1) {
    for (const endpoint of CATALOGUE_COVERAGE_ENDPOINTS) {
      if (signal?.aborted) return null;

      const url = `${endpoint}${endpoint.includes('?') ? '&' : '?'}ean=${encodeURIComponent(ean)}`;

      try {
        const response = await fetch(url, {
          ...buildCoverRequestInit(endpoint),
          signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status} ${response.statusText}`);
        }

        const data = (await response.json()) as CoverApiResponse;
        const imageBase64 = normaliseCoverDataUrl(data?.result?.imageBase64);

        if (data?.success && imageBase64) {
          coverCache.set(ean, imageBase64);
          void idbSet(ean, imageBase64);
          return imageBase64;
        }

        const errorMessage = data?.message ?? "Réponse inattendue de l'API couverture";
        if (errorMessage.includes('Image non trouvée') || errorMessage.includes('image non trouvée')) {
          coverCache.set(ean, FALLBACK_COVER_DATA_URL);
          void idbSet(ean, FALLBACK_COVER_DATA_URL);
          return FALLBACK_COVER_DATA_URL;
        }

        throw new Error(errorMessage);
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          return null;
        }

        const errorMsg = error instanceof Error ? error.message : String(error);
        if (errorMsg.includes('Image non trouvée') || errorMsg.includes('image non trouvée')) {
          coverCache.set(ean, FALLBACK_COVER_DATA_URL);
          void idbSet(ean, FALLBACK_COVER_DATA_URL);
          return FALLBACK_COVER_DATA_URL;
        }
      }
    }

    if (attempt < COVER_FETCH_RETRY_ATTEMPTS - 1) {
      await wait(COVER_FETCH_RETRY_DELAY_MS);
    }
  }

  return null;
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

interface CatalogueApiResponse {
  success?: boolean;
  code?: number;
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

/**
 * Convertit un objet avec des clés numériques en tableau.
 * PHP peut sérialiser les tableaux séquentiels comme des objets : {"0": {...}, "1": {...}, ...}
 */
const toArrayIfArrayLike = (value: unknown): unknown[] | null => {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== 'object') return null;

  const keys = Object.keys(value as Record<string, unknown>);
  if (keys.length === 0) return null;

  // Vérifier que toutes les clés sont des entiers séquentiels commençant à 0
  const allNumeric = keys.every((k) => /^\d+$/.test(k));
  if (!allNumeric) return null;

  const sorted = keys.map(Number).sort((a, b) => a - b);
  if (sorted[0] !== 0 || sorted[sorted.length - 1] !== sorted.length - 1) return null;

  return sorted.map((i) => (value as Record<string, unknown>)[String(i)]);
};

const extractApiResult = (payload: unknown): RawCatalogueOfficeRecord[] => {
  const visit = (input: unknown, depth = 0): unknown => {
    if (depth > 3) return [];
    if (Array.isArray(input)) {
      return input;
    }

    // Objet à clés numériques (sérialisation PHP) → convertir en tableau
    const asArray = toArrayIfArrayLike(input);
    if (asArray) {
      return asArray;
    }

    if (typeof input === 'string') {
      try {
        const parsed = JSON.parse(input) as unknown;
        return visit(parsed, depth + 1);
      } catch {
        return [];
      }
    }

    if (input && typeof input === 'object') {
      const objectPayload = input as Record<string, unknown>;
      const possibleKeys = ['rows', 'data', 'result', 'recordset', 'Recordset', 'records'];

      // D'abord chercher un tableau direct ou array-like
      for (const key of possibleKeys) {
        const candidate = objectPayload[key];
        if (Array.isArray(candidate)) {
          return candidate;
        }
        const candidateAsArray = toArrayIfArrayLike(candidate);
        if (candidateAsArray) {
          return candidateAsArray;
        }
      }

      // Ensuite chercher récursivement dans les objets imbriqués
      for (const key of possibleKeys) {
        const candidate = objectPayload[key];
        if (candidate && typeof candidate === 'object' && !Array.isArray(candidate) && !toArrayIfArrayLike(candidate)) {
          const nested = visit(candidate, depth + 1);
          if (Array.isArray(nested) && nested.length > 0) {
            return nested;
          }
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

export const getColorFromPublisher = (publisher?: string): string => {
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

export const getLogoFromPublisher = (publisher?: string): string => {
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
    const rawDate = getField(
      record,
      'datemev',
      'date',
      'dateparution',
      'nextdate',
      'dateoffre',
    );

    // Grouper par date de MEV (clé normalisée YYYY-MM-DD)
    const parsedDate = parseDateInput(rawDate);
    const dateKey = parsedDate
      ? `${parsedDate.getFullYear()}-${String(parsedDate.getMonth() + 1).padStart(2, '0')}-${String(parsedDate.getDate()).padStart(2, '0')}`
      : 'unknown';

    const office = ensureString(getField(record, 'office', 'codeoffice')) ?? dateKey;

    let group = groupsMap.get(dateKey);
    if (!group) {
      group = {
        office,
        records: [],
        order: order++,
      };
      groupsMap.set(dateKey, group);
    }

    group.records.push(record);

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
    const url = `${CATALOGUE_API_BASE}/offices`;
    const response = await fetchWithOAuth(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }

    const payload = (await response.json()) as CatalogueApiResponse;
    const records = extractApiResult(payload);

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

export interface CatalogueAuthorListItem {
  idAuthor: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  photo?: string;
  fonctions: string[];
  bookCount: number;
}

export async function fetchCatalogueAuthorsList(
  signal?: AbortSignal,
): Promise<CatalogueAuthorListItem[]> {
  const endpoint = 'fetchCatalogueAuthorsList';
  logRequest(endpoint);

  const url = `${CATALOGUE_API_BASE}/authors`;
  const response = await fetchWithOAuth(url, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    signal,
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`);
  }

  const payload = (await response.json()) as CatalogueApiResponse;
  const records = extractApiResult(payload);

  const authors: CatalogueAuthorListItem[] = records
    .map((record) => {
      const firstName = ensureString(getField(record, 'firstname', 'firstName', 'prenom')) ?? '';
      const lastName = ensureString(getField(record, 'lastname', 'lastName', 'nom')) ?? '';
      const fullName = ensureString(getField(record, 'fullname', 'fullName', 'nomcomplet'));
      const photo = ensureString(getField(record, 'photo'));
      const fonctionsRaw = ensureString(getField(record, 'fonctions', 'fonction')) ?? '';
      const bookCount = ensureNumber(getField(record, 'bookcount', 'bookCount', 'count')) ?? 0;
      const idAuthor = ensureString(getField(record, 'idauthor', 'idAuthor')) ?? '';

      const fonctions = fonctionsRaw
        .split(',')
        .map((f) => f.trim())
        .filter(Boolean);

      return {
        idAuthor,
        firstName,
        lastName,
        fullName,
        photo,
        fonctions,
        bookCount,
      };
    })
    .filter((a) => a.idAuthor && a.firstName && a.lastName);

  logResponse(endpoint, authors);
  return authors;
}

export async function fetchCatalogueAuthorBookCounts(
  signal?: AbortSignal,
): Promise<Record<string, number>> {
  const endpoint = 'fetchCatalogueAuthorBookCounts';
  logRequest(endpoint);

  const url = `${CATALOGUE_API_BASE}/authors/counts`;
  const response = await fetchWithOAuth(url, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    signal,
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`);
  }

  const payload = (await response.json()) as CatalogueApiResponse;
  const records = extractApiResult(payload);

  const counts: Record<string, number> = {};
  for (const record of records) {
    const name = ensureString(getField(record, 'authornamelower', 'authorNameLower', 'name'));
    const count = ensureNumber(getField(record, 'bookcount', 'bookCount', 'count'));
    if (name && count !== undefined) {
      counts[name] = count;
    }
  }

  logResponse(endpoint, counts);
  return counts;
}

export interface CatalogueAuthorDetailInfo {
  idAuthor: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  photo?: string;
  fonction?: string;
}

export async function fetchCatalogueAuthorById(
  idAuthor: string,
  signal?: AbortSignal,
): Promise<CatalogueAuthorDetailInfo | null> {
  const endpoint = `fetchCatalogueAuthorById:${idAuthor}`;
  logRequest(endpoint);

  const url = `${CATALOGUE_API_BASE}/authors/${encodeURIComponent(idAuthor)}`;
  const response = await fetchWithOAuth(url, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    signal,
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`);
  }

  const payload = (await response.json()) as CatalogueApiResponse;
  const records = extractApiResult(payload);
  const record = records[0];
  if (!record) return null;

  return {
    idAuthor: ensureString(getField(record, 'idauthor', 'idAuthor')) ?? idAuthor,
    firstName: ensureString(getField(record, 'firstname', 'firstName', 'prenom')) ?? '',
    lastName: ensureString(getField(record, 'lastname', 'lastName', 'nom')) ?? '',
    fullName: ensureString(getField(record, 'fullname', 'fullName', 'nomcomplet')),
    photo: ensureString(getField(record, 'photo')),
    fonction: ensureString(getField(record, 'fonction')),
  };
}

export interface CatalogueAuthorText {
  idTypeTexte?: string;
  texte: string;
}

export async function fetchCatalogueAuthorTexts(
  idAuthor: string,
  signal?: AbortSignal,
): Promise<CatalogueAuthorText[]> {
  const endpoint = `fetchCatalogueAuthorTexts:${idAuthor}`;
  logRequest(endpoint);

  const url = `${CATALOGUE_API_BASE}/authors/${encodeURIComponent(idAuthor)}/texts`;
  const response = await fetchWithOAuth(url, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    signal,
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`);
  }

  const payload = (await response.json()) as CatalogueApiResponse;
  const records = extractApiResult(payload);

  return records
    .map((record) => ({
      idTypeTexte: ensureString(getField(record, 'idtypetexte', 'idTypeTexte')),
      texte: ensureString(getField(record, 'texte')) ?? '',
    }))
    .filter((t) => t.texte);
}

export async function fetchCatalogueBooksByAuthorId(
  idAuthor: string,
  signal?: AbortSignal,
): Promise<CatalogueBook[]> {
  const endpoint = `fetchCatalogueBooksByAuthorId:${idAuthor}`;
  logRequest(endpoint);

  const url = `${CATALOGUE_API_BASE}/authors/${encodeURIComponent(idAuthor)}/books`;
  const response = await fetchWithOAuth(url, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    signal,
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`);
  }

  const payload = (await response.json()) as CatalogueApiResponse;
  const records = extractApiResult(payload);

  const books = (
    await Promise.all(records.map((record) => normalizeBookFromDatabaseRecord(record, false)))
  ).filter((book): book is CatalogueBook => book !== null);

  logResponse(endpoint, books);
  return books;
}

export interface FetchCatalogueNoStockBooksOptions {
  hydrateCovers?: boolean;
  signal?: AbortSignal;
  onProgress?: (books: CatalogueBook[]) => void;
}

export async function fetchCatalogueNoStockBooks(
  options: FetchCatalogueNoStockBooksOptions = {},
): Promise<CatalogueBook[]> {
  const { hydrateCovers = false, signal, onProgress } = options;
  const endpoint = 'fetchCatalogueNoStockBooks';
  logRequest(endpoint);

  const url = `${CATALOGUE_API_BASE}/nostock`;
  const response = await fetchWithOAuth(url, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    signal,
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`);
  }

  const payload = (await response.json()) as CatalogueApiResponse;
  const records = extractApiResult(payload);

  if (!records.length) {
    logResponse(endpoint, []);
    return [];
  }

  const booksWithoutCovers = (
    await Promise.all(records.map(record => normalizeBookFromDatabaseRecord(record, false)))
  ).filter((book): book is CatalogueBook => book !== null);

  if (!hydrateCovers && !onProgress) {
    logResponse(endpoint, booksWithoutCovers);
    return booksWithoutCovers;
  }

  if (!onProgress) {
    const booksWithCovers = (
      await Promise.all(records.map(record => normalizeBookFromDatabaseRecord(record, true)))
    ).filter((book): book is CatalogueBook => book !== null);

    logResponse(endpoint, booksWithCovers);
    return booksWithCovers;
  }

  // Progressive cover loading
  const resultBooks = [...booksWithoutCovers];
  void (async () => {
    await Promise.all(
      resultBooks.map(async (book, index) => {
        if (!book.ean || signal?.aborted) return;

        try {
          const coverUrl = await fetchCover(book.ean, signal);
          if (coverUrl && coverUrl !== book.cover) {
            resultBooks[index] = { ...book, cover: coverUrl };
          }
        } catch (error) {
          if (error instanceof Error && error.name === 'AbortError') return;
        }

        if (!signal?.aborted) {
          onProgress([...resultBooks]);
        }
      }),
    );
  })().catch(() => {
    // Silently ignore cover loading errors
  });

  logResponse(endpoint, booksWithoutCovers);
  return booksWithoutCovers;
}

export interface FetchCatalogueTopOrdersOptions {
  signal?: AbortSignal;
  onProgress?: (books: CatalogueBook[]) => void;
}

export async function fetchCatalogueTopOrders(
  options: FetchCatalogueTopOrdersOptions = {},
): Promise<CatalogueBook[]> {
  const { signal, onProgress } = options;
  const endpoint = 'fetchCatalogueTopOrders';
  logRequest(endpoint);

  const url = `${CATALOGUE_API_BASE}/top-orders`;
  const response = await fetchWithOAuth(url, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    signal,
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`);
  }

  const payload = (await response.json()) as CatalogueApiResponse;
  const records = extractApiResult(payload);

  if (!records.length) {
    logResponse(endpoint, []);
    return [];
  }

  const enriched = await Promise.all(
    records.map(async (record) => {
      const book = await normalizeBookFromDatabaseRecord(record, false);
      if (!book) return null;
      const nbCommandes =
        ensureNumber(getField(record, 'nb_commandes', 'nbcommandes', 'count', 'total')) ?? 0;
      return { book, nbCommandes };
    }),
  );

  const valid = enriched.filter(
    (item): item is { book: CatalogueBook; nbCommandes: number } => item !== null,
  );

  const booksWithoutCovers: CatalogueBook[] = valid.map((item, index) => ({
    ...item.book,
    ribbonText: `#${index + 1}`,
    infoLabel: 'Commandes',
    infoValue: item.nbCommandes,
  }));

  if (!onProgress) {
    logResponse(endpoint, booksWithoutCovers);
    return booksWithoutCovers;
  }

  const resultBooks = [...booksWithoutCovers];
  void (async () => {
    await Promise.all(
      resultBooks.map(async (book, index) => {
        if (!book.ean || signal?.aborted) return;

        try {
          const coverUrl = await fetchCover(book.ean, signal);
          if (coverUrl && coverUrl !== book.cover) {
            resultBooks[index] = { ...book, cover: coverUrl };
          }
        } catch (error) {
          if (error instanceof Error && error.name === 'AbortError') return;
        }

        if (!signal?.aborted) {
          onProgress([...resultBooks]);
        }
      }),
    );
  })().catch(() => {
    // Silently ignore cover loading errors
  });

  logResponse(endpoint, booksWithoutCovers);
  return booksWithoutCovers;
}

export async function fetchCatalogueEditions(): Promise<CatalogueEdition[]> {
  const endpoint = 'fetchCatalogueEditions';
  logRequest(endpoint);
  const data: CatalogueEdition[] = [];
  logResponse(endpoint, data);
  return Promise.resolve(data);
}

// [PERF] js-hoist-regexp: Pré-compiler les regex et map d'entités au niveau module
const HTML_ENTITIES_MAP: Record<string, string> = {
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

// Regex combinée pour toutes les entités nommées (plus efficace qu'une boucle)
const HTML_NAMED_ENTITIES_REGEX = new RegExp(
  Object.keys(HTML_ENTITIES_MAP).map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'),
  'g'
);
const HTML_NUMERIC_ENTITY_REGEX = /&#(\d+);/g;
const HTML_HEX_ENTITY_REGEX = /&#x([0-9A-Fa-f]+);/g;

const decodeHtmlEntities = (text: string): string => {
  if (typeof document !== 'undefined') {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
  }

  // [PERF] Fallback optimisé avec regex pré-compilées
  return text
    .replace(HTML_NAMED_ENTITIES_REGEX, match => HTML_ENTITIES_MAP[match] || match)
    .replace(HTML_NUMERIC_ENTITY_REGEX, (_, code) => String.fromCharCode(parseInt(code, 10)))
    .replace(HTML_HEX_ENTITY_REGEX, (_, code) => String.fromCharCode(parseInt(code, 16)));
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

// [PERF] js-cache-function-results: Cache et déduplication pour les requêtes de livres
const bookCache = new Map<string, CatalogueBook>();
const pendingBookRequests = new Map<string, Promise<CatalogueBook | null>>();
const BOOK_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const bookCacheTimestamps = new Map<string, number>();

export async function fetchCatalogueBook(
  ean: string,
): Promise<CatalogueBook | null> {
  const trimmedEan = ean.trim();
  const endpoint = `fetchCatalogueBook:${trimmedEan}`;
  logRequest(endpoint);

  // Vérifier le cache
  const cachedBook = bookCache.get(trimmedEan);
  const cacheTimestamp = bookCacheTimestamps.get(trimmedEan);
  if (cachedBook && cacheTimestamp && Date.now() - cacheTimestamp < BOOK_CACHE_TTL_MS) {
    logResponse(endpoint, cachedBook);
    return cachedBook;
  }

  // Vérifier si une requête est déjà en cours pour cet EAN
  const pendingRequest = pendingBookRequests.get(trimmedEan);
  if (pendingRequest) {
    return pendingRequest;
  }

  const request = (async (): Promise<CatalogueBook | null> => {
    try {
    // Le nouvel endpoint retourne le livre + textes + auteurs en une seule requête
    const url = `${CATALOGUE_API_BASE}/books/${encodeURIComponent(trimmedEan)}`;
    const response = await fetchWithOAuth(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    if (response.ok) {
      const payload = (await response.json()) as CatalogueApiResponse;

      // L'API peut retourner :
      // - result: { book: {...}, texts: [...], authors: [...] } (handler structuré)
      // - result: { idItem, titre, ... } (row directe)
      // - result: [{ idItem, titre, ... }] (array avec un row)
      const rawResult = payload.result;
      let apiResult: { book?: RawCatalogueOfficeRecord; texts?: RawCatalogueOfficeRecord[]; authors?: RawCatalogueOfficeRecord[] } | undefined;
      let bookRecord: RawCatalogueOfficeRecord | undefined;

      if (rawResult && typeof rawResult === 'object' && !Array.isArray(rawResult)) {
        const resultObj = rawResult as Record<string, unknown>;
        if (resultObj.book && typeof resultObj.book === 'object') {
          // Format structuré du handler: { book, texts, authors }
          apiResult = resultObj as { book: RawCatalogueOfficeRecord; texts?: RawCatalogueOfficeRecord[]; authors?: RawCatalogueOfficeRecord[] };
          bookRecord = apiResult.book;
        } else if ('book' in resultObj && !resultObj.book) {
          // Format structuré mais book est null (bug backend: mode 'row' + $bookRows[0])
          // Conserver texts/authors pour enrichir le livre si on le retrouve autrement
          apiResult = resultObj as { book?: RawCatalogueOfficeRecord; texts?: RawCatalogueOfficeRecord[]; authors?: RawCatalogueOfficeRecord[] };
          console.warn('[fetchCatalogueBook] Structured result but book is null — attempting fallback');
        } else if (resultObj.idItem || resultObj.iditem || resultObj.ean || resultObj.titre) {
          // Row directe: { idItem, titre, ... }
          bookRecord = resultObj as RawCatalogueOfficeRecord;
        }
      }

      if (!bookRecord) {
        // Fallback: extraire depuis l'array
        bookRecord = extractApiResult(payload)[0];
      }

      if (bookRecord) {
        const book = await normalizeBookFromDatabaseRecord(bookRecord);
        if (book) {
          // Extraire les textes depuis la réponse combinée
          const textRecords = apiResult?.texts ?? [];
          if (Array.isArray(textRecords) && textRecords.length > 0) {
            const texts: CatalogueText[] = textRecords
              .map(record => {
                const idTypeTexte = ensureString(getField(record, 'idTypeTexte', 'idtypetexte'));
                const rawText = ensureString(getField(record, 'texte', 'text', 'description', 'resume'));
                if (idTypeTexte && rawText) {
                  return { idTypeTexte, texte: cleanHtmlText(rawText) };
                }
                return null;
              })
              .filter((text): text is CatalogueText => text !== null);

            if (texts.length > 0 && book.details) {
              book.details.texts = texts;
              book.details.summary = texts[0]?.texte;
            }
          }

          // Extraire les auteurs depuis la réponse combinée
          const authorRecords = apiResult?.authors ?? [];
          if (Array.isArray(authorRecords) && authorRecords.length > 0) {
            const authors = await Promise.all(
              authorRecords.map(async (record) => {
                const idAuthor = ensureString(getField(record, 'idAuthor', 'idauthor', 'authorid'));
                if (!idAuthor) return null;

                const firstName = ensureString(getField(record, 'firstName', 'firstname', 'prenom'));
                const lastName = ensureString(getField(record, 'lastName', 'lastname', 'nom'));
                const fullName = lastName && firstName
                  ? `${firstName} ${lastName}`
                  : ensureString(getField(record, 'fullName', 'fullname', 'name', 'nom'));
                const photoFilename = ensureString(getField(record, 'photo', 'isPhoto', 'image'));
                const sortOrder = ensureNumber(getField(record, 'sortOrder', 'order', 'ordre'));
                const rawBio = ensureString(getField(record, 'bioTexte', 'texte', 'text', 'bio', 'biographie'));
                const bio = rawBio ? cleanHtmlText(rawBio) : undefined;

                let photo: string | undefined = undefined;
                if (photoFilename && photoFilename !== '0' && photoFilename !== 'NULL') {
                  const photoUrl = await fetchAuthorPhoto(photoFilename);
                  if (photoUrl) photo = photoUrl;
                }

                return { idAuthor, firstName, lastName, fullName, photo, bio, sortOrder } as CatalogueAuthor;
              })
            );

            const validAuthors = authors.filter((a): a is CatalogueAuthor => a !== null);
            validAuthors.sort((a, b) => {
              if (a.sortOrder !== undefined && b.sortOrder !== undefined) return a.sortOrder - b.sortOrder;
              return 0;
            });

            if (validAuthors.length > 0 && book.details) {
              book.details.authors = validAuthors;

              const combinedBio = validAuthors
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
          }

          // Mettre en cache le livre trouvé
          bookCache.set(trimmedEan, book);
          bookCacheTimestamps.set(trimmedEan, Date.now());

          logResponse(endpoint, book);
          return book;
        }
      }
    }

    // Aucune donnée disponible dans l'API
    logResponse(endpoint, null);
    return null;
  } catch {
    logResponse(endpoint, null);
    return null;
  }
  })();

  // Enregistrer la requête en cours
  pendingBookRequests.set(trimmedEan, request);

  // Nettoyer après résolution
  request.finally(() => {
    pendingBookRequests.delete(trimmedEan);
  });

  return request;
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
    const url = `${CATALOGUE_API_BASE}/books/${encodeURIComponent(ean)}/series/past`;
    const response = await fetchWithOAuth(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }

    const payload = (await response.json()) as CatalogueApiResponse;
    const records = extractApiResult(payload);

    if (records.length === 0) {
      return [];
    }

    // Normaliser les livres récupérés - charger les couvertures car c'est l'onglet par défaut
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

export async function fetchCatalogueSameCollectionBooks(
  ean: string,
): Promise<CatalogueBook[]> {
  const endpoint = `fetchCatalogueSameCollectionBooks:${ean}`;
  logRequest(endpoint);

  try {
    const url = `${CATALOGUE_API_BASE}/books/${encodeURIComponent(ean)}/collection`;
    const response = await fetchWithOAuth(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }

    const payload = (await response.json()) as CatalogueApiResponse;
    const records = extractApiResult(payload);

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
    const url = `${CATALOGUE_API_BASE}/books/${encodeURIComponent(ean)}/series/upcoming`;
    const response = await fetchWithOAuth(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }

    const payload = (await response.json()) as CatalogueApiResponse;
    const records = extractApiResult(payload);

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

export async function fetchCatalogueAuthors(
  ean: string,
): Promise<CatalogueAuthor[]> {
  const endpoint = `fetchCatalogueAuthors:${ean}`;
  logRequest(endpoint);

  try {
    const url = `${CATALOGUE_API_BASE}/books/${encodeURIComponent(ean)}/authors`;
    const response = await fetchWithOAuth(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }

    const payload = (await response.json()) as CatalogueApiResponse;
    const records = extractApiResult(payload);

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
    // Le nouvel endpoint fait la recherche par auteurs côté serveur
    const url = `${CATALOGUE_API_BASE}/books/${encodeURIComponent(currentEan)}/related-authors`;
    const response = await fetchWithOAuth(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }

    const payload = (await response.json()) as CatalogueApiResponse;
    const records = extractApiResult(payload);

    const books = (
      await Promise.all(records.map(record => normalizeBookFromDatabaseRecord(record, false)))
    ).filter((book): book is CatalogueBook => book !== null);

    // Remove duplicates (same book can be by multiple authors)
    const uniqueBooks = books.filter((book, index, self) =>
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
    const url = `${CATALOGUE_API_BASE}/offices/next`;
    const response = await fetchWithOAuth(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }

    const payload = (await response.json()) as CatalogueApiResponse;
    const records = extractApiResult(payload);

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
    const url = `${CATALOGUE_API_BASE}/search?q=${encodeURIComponent(searchTerm)}`;
    const response = await fetchWithOAuth(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }

    const payload = (await response.json()) as CatalogueApiResponse;
    const records = extractApiResult(payload);

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