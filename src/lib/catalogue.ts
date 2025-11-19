import OnePiece110 from '@/assets/images/onepiece_110.webp';
import NayaPika from '@/assets/images/naya_pika.webp';
import JulesMatrat from '@/assets/images/jules_matrat.webp';
import CombatVie from '@/assets/images/le_combat_dune_vie.webp';
import Odysee from '@/assets/images/odyssee.webp';
import ControNatura from '@/assets/images/contro-natura.webp';
import Brume01 from '@/assets/images/brume-01.webp';
import Shangri17 from '@/assets/images/shangri-17.webp';
import Momie from '@/assets/images/momie-bandelette.webp';
import Cemotions from '@/assets/images/couleurs-emotions.webp';
import OnePieceGreen from '@/assets/images/onepiece-green.webp';
import OnePieceBlue from '@/assets/images/onepiece-blue.webp';
import OnePieceYellow from '@/assets/images/onepiece-yellow.webp';
import OnePieceBlueDeep from '@/assets/images/onepiece-bluedeep.webp';
import OnePieceRed from '@/assets/images/onepiece-red.webp';
import UniversBD from '@/assets/logos/univers/univers-bd.svg';
import UniversJeune from '@/assets/logos/univers/univers-jeunesse.svg';
import UniversLivre from '@/assets/logos/univers/univers-livres.svg';
import UniversManga from '@/assets/logos/univers/univers-manga.svg';
import type { BookCardProps } from '@/components/BookCard';
import { fetchWithOAuth } from './oauth';
import { applySecurePayloadHeaders, logSecurePayloadRequest, prepareSecureJsonPayload } from './securePayload';

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

export const catalogueDb: CatalogueDb = {
  books: [
    {
      cover: OnePiece110,
      title: 'One Piece - Tome 110',
      ean: '9782380711102',
      authors: 'E. Oda',
      publisher: 'Glénat Manga',
      publicationDate: '01/02/2025',
      priceHT: '7.49',
      stock: 86,
      views: 140,
      color: '--glenat-manga',
      ribbonText: 'NOUVEAUTÉ',
      creationDate: '22/02/2024',
      details: {
        subtitle: 'Guide officiel des personnages de la saga des Empereurs',
        badges: ['Shonen Jump', 'Fiche personnage', 'Best-seller'],
        contributors: [
          { name: 'Eiichiro Oda', role: 'Auteur' },
        ],
        metadata: [
          { label: 'Marque éditoriale', value: 'Glénat Manga' },
          { label: 'Catégorie(s)', value: 'One Piece, Aventure' },
          { label: 'Série', value: 'One Piece Data Book' },
          { label: 'Collection', value: 'Shonen' },
          { label: 'Mot(s) clé', value: 'guide book, humour, aventure, action' },
          { label: 'Libellé de tomaison', value: 'Green' },
          { label: 'Nombre de pages', value: '394 pages' },
          { label: "Éditeur d'origine", value: 'Shueisha' },
          { label: 'BC', value: 'business central · descriptif technique · suivi fabrication' },
        ],
        specifications: [
          { label: 'EAN', value: '9782380711102' },
          { label: 'ISBN', value: '978-2-38071-110-2' },
          { label: 'Format', value: '130 x 180 mm' },
          { label: 'Pagination', value: '394 pages' },
          { label: 'Dimensions', value: '13,0 x 18,0 cm' },
          { label: 'Poids', value: '320 g' },
          { label: 'Date de parution', value: '01/02/2025' },
          { label: 'Date de disponibilité', value: '22/01/2025' },
          { label: 'Distributeur', value: 'Glénat' },
          { label: 'Hachette', value: '4124558' },
          { label: 'Façonnage', value: 'Souple' },
          { label: 'Stock', value: '86 ex' },
          { label: 'Presse', value: 'Pages à publier' },
        ],
        stats: [
          { label: 'Commandes totales', value: '320', helper: 'Depuis l’ouverture des précommandes' },
          { label: 'Stock disponible', value: '86 ex', helper: 'Mise à jour en temps réel' },
          { label: 'Précommandes', value: '48', helper: '7 derniers jours' },
          { label: 'Dernière commande', value: '22/02/2024', helper: 'Librairie Kabuto' },
        ],
        recommendedAge: 'DÈS 10 AN(S)',
        officeCode: '12594',
        categories: ['Glénat Manga', 'Shonen', 'Aventure', 'Action'],
        priceTTC: '7.90',
        availabilityStatus: 'Disponible',
        availabilityNote: 'En stock, expédition sous 48h',
        availabilityDate: '22/01/2025',
        relatedEans: [
          '9782723484223',
          '9782723484230',
          '9782723484247',
          '9782723484216',
          '9782723484209',
        ],
        summary:
          "L’intervention de l’équipage des géants apporte une lueur d’espoir à Luffy et ses amis dans leur tentative de s’évader de l’île futuriste, mais c’était sans compter l’arrivée des cinq doyens venus leur barrer le chemin ! Pendant ce temps, le monde entier frémit à l’écoute du message de Végapunk dont la diffusion vient tout juste de débuter… Les aventures de Luffy à la poursuite du One Piece continuent !",
        authorBio:
          "Eiichiro Oda est né le 1er janvier 1975 à Kumamoto (Japon). Dès l’âge de 4 ans, il veut devenir mangaka. En 1992, alors qu’il est encore au lycée, il est récompensé lors du 44e concours Tezuka pour Wanted!. Après avoir été assistant auprès de divers auteurs comme Nobuhiro Watsuki (l’auteur de Kenshin le vagabond), c’est en 1997 qu’Eiichiro Oda publie le premier chapitre de One Piece dans le magazine Weekly Shônen Jump. Grâce aux personnages attachants, aux scènes d’action dynamiques et au scénario émouvant qui la caractérisent, la série fait l’unanimité auprès d’un large public.\n\nEn décembre 2014, One Piece est entré dans le livre des records comme la série dessinée par un seul auteur la plus imprimée au monde (320 866 000 exemplaires). Et, en 2021, ce sont plus de 490 millions de mangas One Piece qui ont déjà été imprimés à travers le monde, chaque nouveau volume étant distribué au Japon à plus de 3 millions d’exemplaires.\n\nSes déclinaisons en série TV, jeux vidéo ou films sont tout aussi populaires que la série originale. One Piece jouit également d’un succès international.",
      },
    },
    {
      cover: NayaPika,
      title: 'Naya Pika - Tome 03',
      ean: '9782344059707',
      authors: 'Rabat · Rodi · Aneko',
      publisher: 'Glénat Jeunesse',
      publicationDate: '03/04/2024',
      priceHT: '10.95',
      stock: 42,
      views: 95,
      color: '--glenat-jeunesse',
      creationDate: '15/03/2024',
    },
    {
      cover: JulesMatrat,
      title: 'Jules Matrat - Tome 03',
      ean: '9782344059905',
      authors: 'Corbeyran · Horne',
      publisher: 'Glénat BD',
      publicationDate: '17/01/2024',
      priceHT: '17.90',
      stock: 58,
      views: 45,
      color: '--glenat-bd',
      ribbonText: 'À paraître',
      creationDate: '10/01/2024',
    },
    {
      cover: CombatVie,
      title: "Paul Watson - Le combat d'une vie",
      ean: '9782344059974',
      authors: 'Paul Watson',
      publisher: 'Glénat Livres',
      publicationDate: '05/06/2024',
      priceHT: '22.00',
      stock: 12,
      views: 60,
      color: '--glenat-livre',
      ribbonText: 'NOUVEAUTÉ',
      creationDate: '18/04/2024',
    },
    {
      cover: Odysee,
      title: 'Alva Odyssée',
      ean: '9782344059936',
      authors: 'Alva',
      publisher: 'Glénat Livres',
      publicationDate: '19/06/2024',
      priceHT: '19.95',
      stock: 18,
      views: 30,
      color: '--glenat-livre',
      ribbonText: 'PROVISOIRE',
      creationDate: '02/05/2024',
    },
    {
      cover: Cemotions,
      title: 'La couleur des émotions - Un livre tout animé',
      ean: '9791026400134',
      authors: 'Anna Llenas',
      publisher: 'Glénat Jeunesse',
      publicationDate: '10/10/2014',
      priceHT: '20.76',
      stock: 14574,
      views: 250,
      color: '--glenat-jeunesse',
      creationDate: '01/01/2014',
    },
    {
      cover: ControNatura,
      title: 'Contro Natura - Sang bleu',
      ean: '9782344069080',
      authors: 'M.Andolfo · I.Bigarella',
      publisher: 'Glénat BD',
      publicationDate: '27/08/2025',
      priceHT: '18.96',
      stock: 3373,
      views: 12,
      color: '--glenat-bd',
      ribbonText: 'nouveauté',
      creationDate: '11/06/2025',
    },
    {
      cover: Shangri17,
      title: 'Shangri-la Frontier - Tome 17',
      ean: '9782344066379',
      authors: 'Katarina · R.Fuji',
      publisher: 'Glénat Manga',
      publicationDate: '27/08/2025',
      priceHT: '6.82',
      stock: 6292,
      views: 5,
      color: '--glenat-manga',
      ribbonText: 'nouveauté',
      creationDate: '20/07/2025',
    },
    {
      cover: Brume01,
      title: 'Brume - Tome 01',
      ean: '9782344051733',
      authors: 'J.Pélissier · C.Hinder',
      publisher: 'Glénat BD',
      publicationDate: '26/04/2023',
      priceHT: '11.85',
      stock: 24479,
      views: 410,
      color: '--glenat-bd',
      creationDate: '13/03/2023',
    },
    {
      cover: Momie,
      title: 'Les bandelettes de Momie Molette',
      ean: '9782344057049',
      authors: 'Loïc Clément · Julien Arnal',
      publisher: 'Glénat Jeunesse',
      publicationDate: '09/10/2024',
      priceHT: '11.85',
      stock: 1952,
      views: 80,
      color: '--glenat-jeunesse',
      creationDate: '25/09/2024',
    },
    {
      cover: OnePieceGreen,
      title: 'One Piece - Green',
      ean: '9782723484223',
      authors: 'E. Oda',
      publisher: 'Glénat Manga',
      publicationDate: '24/11/2010',
      priceHT: '7.90',
      stock: 420,
      views: 520,
      color: '--glenat-manga',
      ribbonText: 'CLASSIQUE',
    },
    {
      cover: OnePieceBlueDeep,
      title: 'One Piece - Blue Deep',
      ean: '9782723484230',
      authors: 'E. Oda',
      publisher: 'Glénat Manga',
      publicationDate: '02/05/2012',
      priceHT: '7.90',
      stock: 380,
      views: 415,
      color: '--glenat-manga',
    },
    {
      cover: OnePieceYellow,
      title: 'One Piece - Yellow',
      ean: '9782723484247',
      authors: 'E. Oda',
      publisher: 'Glénat Manga',
      publicationDate: '13/03/2013',
      priceHT: '7.90',
      stock: 255,
      views: 362,
      color: '--glenat-manga',
    },
    {
      cover: OnePieceBlue,
      title: 'One Piece - Blue',
      ean: '9782723484216',
      authors: 'E. Oda',
      publisher: 'Glénat Manga',
      publicationDate: '06/07/2002',
      priceHT: '7.90',
      stock: 310,
      views: 298,
      color: '--glenat-manga',
    },
    {
      cover: OnePieceRed,
      title: 'One Piece - Red',
      ean: '9782723484209',
      authors: 'E. Oda',
      publisher: 'Glénat Manga',
      publicationDate: '06/07/2002',
      priceHT: '7.90',
      stock: 295,
      views: 340,
      color: '--glenat-manga',
    },
  ],
  releases: [
    {
      date: '22/01/2025',
      bookEans: ['9782380711102', '9782344059707', '9782344059905'],
    },
    {
      date: '05/06/2024',
      bookEans: ['9782344059974', '9782344059936', '9791026400134'],
    },
  ],
  offices: [
    {
      office: '25503',
      date: '22/01/2025',
      shipping: 'Envoi Chronolivre mardi 07/01/2025 à 18h55',
      bookEans: ['9782380711102', '9782344059707', '9782344059905'],
    },
    {
      office: '25504',
      date: '05/02/2025',
      shipping: 'Envoi Chronolivre mardi 21/01/2025 à 18h55',
      bookEans: ['9782344059974', '9782344059936', '9791026400134'],
    },
  ],
  kiosques: [
    {
      office: '25501',
      date: '05/09/2025',
      shipping: 'Envoi Chronolivre mardi 02/09/2025 à 18h55',
      bookEans: ['9782380711102', '9782344059707', '9782344059905'],
    },
    {
      office: '25502',
      date: '15/09/2025',
      shipping: 'Envoi Chronolivre mardi 09/09/2025 à 18h55',
      bookEans: ['9782344059974', '9782344059936', '9791026400134'],
    },
    {
      office: '25503',
      date: '25/09/2025',
      shipping: 'Envoi Chronolivre mardi 23/09/2025 à 18h55',
      bookEans: [
        '9782344069080',
        '9782344066379',
        '9782344051733',
        '9782344057049',
      ],
    },
  ],
  editions: [
    { title: 'Adonis', color: '--glenat-bd', logo: UniversBD },
    { title: 'Blanche', color: '--glenat-livre', logo: UniversLivre },
    { title: 'Comix Buro', color: '--glenat-jeunesse', logo: UniversJeune },
    { title: 'Disney', color: '--glenat-bd', logo: UniversLivre },
    { title: 'Éditions licences', color: '--glenat-livre', logo: UniversLivre },
    { title: 'Cheval Magazine', color: '--glenat-livre', logo: UniversLivre },
    { title: 'Glénat BD', color: '--glenat-bd', logo: UniversBD },
    { title: 'Glénat Jeunesse', color: '--glenat-jeunesse', logo: UniversJeune },
    { title: 'Glénat Manga', color: '--glenat-manga', logo: UniversManga },
    { title: 'Hugo', color: '--glenat-livre', logo: UniversLivre },
    { title: 'Livres diffusés', color: '--glenat-jeunesse', logo: UniversJeune },
    { title: 'Rando éditions', color: '--glenat-livre', logo: UniversLivre },
    { title: 'Glénat Livres', color: '--glenat-livre', logo: UniversLivre },
    { title: "Vent d'Ouest", color: '--glenat-bd', logo: UniversBD },
  ],
};

export default catalogueDb;


const cloneBook = (ean: string): CatalogueBook => {
  const book = catalogueDb.books.find(item => item.ean === ean);

  if (!book) {
    throw new Error(`Livre introuvable pour l'EAN ${ean}`);
  }

  const details = book.details
    ? {
        ...book.details,
        badges: book.details.badges ? [...book.details.badges] : undefined,
        metadata: book.details.metadata?.map(entry => ({ ...entry })) ?? [],
        specifications:
          book.details.specifications?.map(entry => ({ ...entry })) ?? [],
        stats: book.details.stats?.map(stat => ({ ...stat })) ?? [],
        relatedEans: book.details.relatedEans
          ? [...book.details.relatedEans]
          : undefined,
      }
    : undefined;

  return {
    ...book,
    details,
  };
};

const logRequest = (endpoint: string) => {
  console.info(`[catalogueApi] ${endpoint} appelé`);
};

const logResponse = (endpoint: string, payload: unknown) => {
  console.info(`[catalogueApi] ${endpoint} réponse`, payload);
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

export async function fetchCatalogueBooks(): Promise<CatalogueBook[]> {
  const endpoint = 'fetchCatalogueBooks';
  logRequest(endpoint);
  const data = catalogueDb.books.map(book => cloneBook(book.ean));
  logResponse(endpoint, data);
  return Promise.resolve(data);
}

export async function fetchCatalogueReleases(): Promise<CatalogueReleaseGroup[]> {
  const endpoint = 'fetchCatalogueReleases';
  logRequest(endpoint);
  const data = catalogueDb.releases.map(release => ({
    date: release.date,
    books: release.bookEans.map(cloneBook),
  }));
  logResponse(endpoint, data);
  return Promise.resolve(data);
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
      endpoints.add('https://api-dev.groupe-glenat.com/Api/v1.0/Extranet/couverture');
    }
  }

  endpoints.add('https://api-recette.groupe-glenat.com/Api/v1.0/Extranet/couverture');

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

          const data = (await response.json()) as CoverApiResponse;
          const imageBase64 = normaliseCoverDataUrl(data?.result?.imageBase64);

          if (data?.success && imageBase64) {
            console.debug('[catalogueApi] Couverture récupérée via le service distant.');
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
            console.debug('[catalogueApi] Photo auteur récupérée via le service distant.');
            authorPhotoCache.set(photoFilename, imageBase64);
            return imageBase64;
          }

          const errorMessage = data?.message ?? "Réponse inattendue de l'API photo auteur";
          throw new Error(errorMessage);
        } catch (error) {
          console.error(
            `[catalogueApi] Impossible de récupérer la photo auteur ${photoFilename} via ${endpoint} (tentative ${attempt + 1})`,
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

  if (!ean) {
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
          coverPromise = fetchCover(ean).catch(error => {
            console.warn(
              `[catalogueApi] Impossible de recuperer la couverture pour ${ean}`,
              error,
            );
            return null;
          });
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

    console.debug('[catalogueApi] Offices récupérés depuis la base.');

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

export const FALLBACK_CATALOGUE_COVER = FALLBACK_COVER_DATA_URL;

export async function fetchCatalogueCover(ean: string): Promise<string | null> {
  return fetchCover(ean);
}

export async function fetchCatalogueKiosques(): Promise<CatalogueKiosqueGroup[]> {
  const endpoint = 'fetchCatalogueKiosques';
  logRequest(endpoint);
  const data = catalogueDb.kiosques.map(kiosque => ({
    office: kiosque.office,
    date: kiosque.date,
    shipping: kiosque.shipping,
    books: kiosque.bookEans.map(cloneBook),
  }));
  logResponse(endpoint, data);
  return Promise.resolve(data);
}

export async function fetchCatalogueEditions(): Promise<CatalogueEdition[]> {
  const endpoint = 'fetchCatalogueEditions';
  logRequest(endpoint);
  const data = catalogueDb.editions.map(edition => ({ ...edition }));
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

      console.debug(`[catalogueApi] ${texts.length} texte(s) récupéré(s) depuis catalogTexts pour`, ean);
      return texts;
    }

    console.debug('[catalogueApi] Aucun texte trouvé dans catalogTexts pour', ean);
    return [];
  } catch (error) {
    console.error('[catalogueApi] Erreur lors de la récupération des textes pour', ean, error);
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

        console.debug('[catalogueApi] Auteurs récupérés pour', ean, validAuthors.length);
        return validAuthors;
      }
    }

    console.debug('[catalogueApi] Aucun auteur trouvé dans catalogAutors pour', ean);
    return [];
  } catch (error) {
    console.error('[catalogueApi] Erreur lors de la récupération des auteurs pour', ean, error);
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

    // Fallback vers les données statiques si l'API échoue
    console.debug('[catalogueApi] Utilisation des données statiques pour', ean);
    const book = cloneBook(ean);
    logResponse(endpoint, book);
    return Promise.resolve(book);
  } catch (error) {
    // Fallback vers les données statiques
    try {
      console.debug('[catalogueApi] Fallback vers données statiques pour', ean);
      const book = cloneBook(ean);
      logResponse(endpoint, book);
      return Promise.resolve(book);
    } catch (fallbackError) {
      logResponse(endpoint, null);
      console.debug(`[catalogueApi] Livre introuvable pour l'EAN ${ean}`);
      return Promise.resolve(null);
    }
  }
}

export async function fetchCatalogueRelatedBooks(
  ean: string,
): Promise<CatalogueBook[]> {
  const endpoint = `fetchCatalogueRelatedBooks:${ean}`;
  logRequest(endpoint);

  try {
    const book = cloneBook(ean);
    const relatedEans = book.details?.relatedEans ?? [];
    const related = relatedEans
      .filter(relatedEan => relatedEan !== ean)
      .map(relatedEan => {
        try {
          return cloneBook(relatedEan);
        } catch (error) {
          console.debug(
            `[catalogueApi] Livre recommandé introuvable pour l'EAN ${relatedEan}`,
            error,
          );
          return null;
        }
      })
      .filter((item): item is CatalogueBook => item !== null);

    logResponse(endpoint, related);
    return Promise.resolve(related);
  } catch (error) {
    logResponse(endpoint, []);
    console.debug(
      `[catalogueApi] Aucune recommandation disponible pour ${ean}`,
    );
    return Promise.resolve([]);
  }
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
      console.debug('[catalogueApi] Livre source introuvable pour', ean);
      return [];
    }

    const record = records[0];
    const serie = ensureString(getField(record, 'serie'));

    if (!serie) {
      console.debug('[catalogueApi] Aucune série trouvée pour', ean);
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
      console.debug('[catalogueApi] Aucun livre déjà paru trouvé pour la série', serie);
      return [];
    }

    // Normaliser les livres récupérés - charger les couvertures car c'est l'onglet par défaut
    const books = (
      await Promise.all(pastRecords.map(record => normalizeBookFromDatabaseRecord(record, true)))
    ).filter((book): book is CatalogueBook => book !== null);

    console.debug(`[catalogueApi] ${books.length} livre(s) déjà paru(s) trouvé(s) pour la série ${serie}`);
    logResponse(endpoint, books);
    return books;
  } catch (error) {
    console.error('[catalogueApi] Erreur lors de la récupération des livres déjà parus', error);
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
      console.debug('[catalogueApi] Aucun livre de la même collection trouvé');
      return [];
    }

    // Normaliser les livres récupérés avec chargement des couvertures
    const books = (
      await Promise.all(records.map(record => normalizeBookFromDatabaseRecord(record, true)))
    ).filter((book): book is CatalogueBook => book !== null);

    console.debug(`[catalogueApi] ${books.length} livre(s) de la même collection trouvé(s)`);
    logResponse(endpoint, books);
    return books;
  } catch (error) {
    console.error('[catalogueApi] Erreur lors de la récupération des livres de la même collection', error);
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
      console.debug('[catalogueApi] Livre source introuvable pour', ean);
      return [];
    }

    const record = records[0];
    const serie = ensureString(getField(record, 'serie'));

    if (!serie) {
      console.debug('[catalogueApi] Aucune série trouvée pour', ean);
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
      console.debug('[catalogueApi] Aucun livre à paraître trouvé pour la série', serie);
      return [];
    }

    // Normaliser les livres récupérés avec chargement des couvertures
    const books = (
      await Promise.all(upcomingRecords.map(record => normalizeBookFromDatabaseRecord(record, true)))
    ).filter((book): book is CatalogueBook => book !== null);

    console.debug(`[catalogueApi] ${books.length} livre(s) à paraître trouvé(s) pour la série ${serie}`);
    logResponse(endpoint, books);
    return books;
  } catch (error) {
    console.error('[catalogueApi] Erreur lors de la récupération des livres à paraître', error);
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
      console.debug('[catalogueApi] Aucun auteur trouvé pour', ean);
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

    console.debug(`[catalogueApi] ${authors.length} auteur(s) trouvé(s) pour ${ean}`);
    logResponse(endpoint, authors);
    return authors;
  } catch (error) {
    console.error('[catalogueApi] Erreur lors de la récupération des auteurs', error);
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
    console.debug('[catalogueApi] Aucun auteur fourni');
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

    console.debug(`[catalogueApi] ${finalBooks.length} livres récupérés pour ${authors.length} auteur(s)`);
    logResponse(endpoint, finalBooks);
    return finalBooks;
  } catch (error) {
    console.error('[catalogueApi] Erreur lors de la récupération des livres par auteurs', error);
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

    console.debug('[catalogueApi] Prochaine office récupérée depuis la base.');

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
        void hydrateCatalogueOfficeGroupsWithCovers([nextOffice], { onCoverProgress }).catch(error => {
          console.warn('[catalogueApi] Hydratation des couvertures interrompue', error);
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
    console.error('[catalogueApi] Impossible de recuperer la prochaine office', error);
    throw error;
  }
}