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

type ReleasesApiResponse =
  | ReleasesApiRecord[]
  | { data?: ReleasesApiRecord[]; result?: ReleasesApiRecord[]; items?: ReleasesApiRecord[] };

interface ReleasesApiRecord {
  date?: string;
  releaseDate?: string;
  release_date?: string;
  bookEans?: string[];
  book_eans?: string[];
  books?: Array<{
    ean?: string;
  }>;
}

const RELEASES_ENDPOINT = '/api/catalogue/releases/latest';

const resolveReleasesApiUrl = (): string => {
  const baseUrl = import.meta.env.VITE_CATALOGUE_API_URL ?? import.meta.env.VITE_API_URL;

  if (!baseUrl) {
    return RELEASES_ENDPOINT;
  }

  return `${baseUrl.replace(/\/$/, '')}${RELEASES_ENDPOINT}`;
};

const extractReleaseRecords = (payload: ReleasesApiResponse): ReleasesApiRecord[] => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  if (Array.isArray(payload?.result)) {
    return payload.result;
  }

  if (Array.isArray(payload?.items)) {
    return payload.items;
  }

  return [];
};

const mapReleaseRecord = (record: ReleasesApiRecord): CatalogueReleaseGroup | null => {
  const rawDate = record.date ?? record.releaseDate ?? record.release_date;

  if (!rawDate && !record.bookEans && !record.book_eans && !Array.isArray(record.books)) {
    return null;
  }

  const normalizedDate = normalizeDateFromApi(rawDate);
  const releaseMatch = catalogueDb.releases.find(release => {
    if (!rawDate) {
      return release.date === normalizedDate;
    }

    return release.date === rawDate || release.date === normalizedDate;
  });

  const eansFromRecord = [
    ...(record.bookEans ?? []),
    ...(record.book_eans ?? []),
    ...(Array.isArray(record.books)
      ? record.books
          .map(book => book?.ean)
          .filter((ean): ean is string => typeof ean === 'string' && ean.trim().length > 0)
      : []),
  ];

  const eans = Array.from(
    new Set([
      ...eansFromRecord,
      ...(releaseMatch?.bookEans ?? []),
    ]),
  );

  const books = eans
    .map(ean => {
      try {
        return cloneBook(ean);
      } catch (error) {
        console.warn(`[catalogueApi] Livre introuvable pour l'EAN ${ean} (release ${rawDate ?? 'inconnue'})`, error);
        return null;
      }
    })
    .filter((book): book is CatalogueBook => book !== null);

  return {
    date: normalizedDate || releaseMatch?.date || rawDate || 'Date non communiquée',
    books,
  };
};

const fetchReleasesFromApi = async (): Promise<CatalogueReleaseGroup[]> => {
  const response = await fetch(resolveReleasesApiUrl(), {
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Erreur API nouveautés (${response.status}) ${response.statusText}`);
  }

  const payload = (await response.json()) as ReleasesApiResponse;
  const records = extractReleaseRecords(payload);

  return records
    .map(mapReleaseRecord)
    .filter((group): group is CatalogueReleaseGroup => group !== null);
};

export async function fetchCatalogueReleases(): Promise<CatalogueReleaseGroup[]> {
  const endpoint = 'fetchCatalogueReleases';
  logRequest(endpoint);

  try {
    const apiData = await fetchReleasesFromApi();
    logResponse(endpoint, apiData);
    return apiData;
  } catch (error) {
    console.error('[catalogueApi] Impossible de récupérer les nouveautés via API', error);
  }

  const fallback = catalogueDb.releases.map(release => ({
    date: release.date,
    books: release.bookEans.map(cloneBook),
  }));
  logResponse(`${endpoint}:fallback`, fallback);
  return fallback;
}

type OfficesApiResponse =
  | OfficesApiRecord[]
  | { data?: OfficesApiRecord[]; result?: OfficesApiRecord[]; items?: OfficesApiRecord[] };

interface OfficesApiRecord {
  office?: string;
  officeCode?: string;
  code?: string;
  date?: string;
  officeDate?: string;
  office_date?: string;
  shipping?: string;
  shippingDate?: string;
  shipping_date?: string;
  bookEans?: string[];
  book_eans?: string[];
  books?: Array<{
    ean?: string;
  }>;
}

const OFFICES_ENDPOINT = '/api/catalogue/offices/upcoming';

const normalizeDateFromApi = (value?: string): string => {
  if (!value) {
    return '';
  }

  const trimmed = value.trim();

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) {
    return trimmed;
  }

  const parsed = new Date(trimmed);

  if (!Number.isNaN(parsed.getTime())) {
    try {
      return parsed.toLocaleDateString('fr-FR');
    } catch {
      return trimmed;
    }
  }

  return trimmed;
};

const resolveOfficesApiUrl = (): string => {
  const baseUrl = import.meta.env.VITE_CATALOGUE_API_URL ?? import.meta.env.VITE_API_URL;

  if (!baseUrl) {
    return OFFICES_ENDPOINT;
  }

  return `${baseUrl.replace(/\/$/, '')}${OFFICES_ENDPOINT}`;
};

const extractOfficeRecords = (payload: OfficesApiResponse): OfficesApiRecord[] => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  if (Array.isArray(payload?.result)) {
    return payload.result;
  }

  if (Array.isArray(payload?.items)) {
    return payload.items;
  }

  return [];
};

const mapOfficeRecord = (record: OfficesApiRecord): CatalogueOfficeGroup | null => {
  const officeCode = record.office ?? record.officeCode ?? record.code;

  if (!officeCode) {
    return null;
  }

  const catalogueOffice = catalogueDb.offices.find(item => item.office === officeCode);

  const normalizedDate = normalizeDateFromApi(
    record.date ?? record.officeDate ?? record.office_date ?? catalogueOffice?.date,
  );
  const normalizedShipping = normalizeDateFromApi(
    record.shipping ?? record.shippingDate ?? record.shipping_date ?? catalogueOffice?.shipping,
  );

  const eansFromRecord = [
    ...(record.bookEans ?? []),
    ...(record.book_eans ?? []),
    ...(Array.isArray(record.books)
      ? record.books
          .map(book => book?.ean)
          .filter((ean): ean is string => typeof ean === 'string' && ean.trim().length > 0)
      : []),
  ];

  const eans = Array.from(
    new Set([
      ...eansFromRecord,
      ...(catalogueOffice?.bookEans ?? []),
    ]),
  );

  const books = eans
    .map(ean => {
      try {
        return cloneBook(ean);
      } catch (error) {
        console.warn(
          `[catalogueApi] Livre introuvable pour l'EAN ${ean} (office ${officeCode})`,
          error,
        );
        return null;
      }
    })
    .filter((book): book is CatalogueBook => book !== null);

  return {
    office: officeCode,
    date: normalizedDate || catalogueOffice?.date || 'Date non communiquée',
    shipping: normalizedShipping || catalogueOffice?.shipping || 'Expédition non communiquée',
    books,
  };
};

const fetchOfficesFromApi = async (): Promise<CatalogueOfficeGroup[]> => {
  const response = await fetch(resolveOfficesApiUrl(), {
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Erreur API offices (${response.status}) ${response.statusText}`);
  }

  const payload = (await response.json()) as OfficesApiResponse;
  const records = extractOfficeRecords(payload);

  return records
    .map(mapOfficeRecord)
    .filter((group): group is CatalogueOfficeGroup => group !== null);
};

export async function fetchCatalogueOffices(): Promise<CatalogueOfficeGroup[]> {
  const endpoint = 'fetchCatalogueOffices';
  logRequest(endpoint);

  try {
    const apiData = await fetchOfficesFromApi();
    logResponse(endpoint, apiData);
    return apiData;
  } catch (error) {
    console.error('[catalogueApi] Impossible de récupérer les offices via API', error);
  }

  const fallback = catalogueDb.offices.map(office => ({
    office: office.office,
    date: office.date,
    shipping: office.shipping,
    books: office.bookEans.map(cloneBook),
  }));
  logResponse(`${endpoint}:fallback`, fallback);
  return fallback;
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

export async function fetchCatalogueBook(
  ean: string,
): Promise<CatalogueBook | null> {
  const endpoint = `fetchCatalogueBook:${ean}`;
  logRequest(endpoint);

  try {
    const book = cloneBook(ean);
    logResponse(endpoint, book);
    return Promise.resolve(book);
  } catch (error) {
    logResponse(endpoint, null);
    console.warn(`[catalogueApi] Livre introuvable pour l'EAN ${ean}`, error);
    return Promise.resolve(null);
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
          console.warn(
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
    console.warn(
      `[catalogueApi] Impossible de récupérer les recommandations pour ${ean}`,
      error,
    );
    return Promise.resolve([]);
  }
}
