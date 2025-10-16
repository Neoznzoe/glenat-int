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
import PlaceholderCover from '@/assets/images/catalogue-placeholder.svg';
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

const CATALOGUE_OFFICES_ENDPOINT = import.meta.env.VITE_CATALOGUE_OFFICES_ENDPOINT ??
  (import.meta.env.DEV
    ? '/intranet/call-database'
    : 'https://api-dev.groupe-glenat.com/Api/v1.0/Intranet/callDatabase');

const CATALOGUE_OFFICES_QUERY =
  typeof import.meta.env.VITE_CATALOGUE_OFFICES_QUERY === 'string'
    ? import.meta.env.VITE_CATALOGUE_OFFICES_QUERY
    : undefined;

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

type RawCatalogueOfficeRecord = Record<string, unknown>;

interface CatalogueDatabaseResponse {
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

const NORMALIZED_KEY_CACHE = new Map<string, string>();

const normalizeKeyName = (key: string): string => {
  const cached = NORMALIZED_KEY_CACHE.get(key);
  if (cached) {
    return cached;
  }
  const normalized = key
    .toLowerCase()
    .replace(/[\s_]+/g, '')
    .replace(/[^a-z0-9]/g, '');
  NORMALIZED_KEY_CACHE.set(key, normalized);
  return normalized;
};

const getCandidateValue = (record: RawCatalogueOfficeRecord, keys: string[]): unknown => {
  for (const key of keys) {
    if (key in record) {
      const value = record[key];
      if (value !== undefined && value !== null) {
        return value;
      }
    }
  }

  const normalizedTargets = keys.map(normalizeKeyName);
  for (const [candidateKey, candidateValue] of Object.entries(record)) {
    if (candidateValue === undefined || candidateValue === null) {
      continue;
    }
    if (normalizedTargets.includes(normalizeKeyName(candidateKey))) {
      return candidateValue;
    }
  }

  return undefined;
};

const toTrimmedString = (value: unknown): string | undefined => {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length ? trimmed : undefined;
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value.toString();
  }
  return undefined;
};

const toOptionalNumber = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const normalized = value
      .trim()
      .replace(/\s+/g, '')
      .replace(',', '.')
      .replace(/[^0-9.+-]/g, '');
    if (!normalized) {
      return undefined;
    }
    const parsed = Number.parseFloat(normalized);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }
  return undefined;
};

const toOptionalInteger = (value: unknown): number | undefined => {
  const numeric = toOptionalNumber(value);
  if (numeric === undefined || Number.isNaN(numeric)) {
    return undefined;
  }
  const integer = Math.round(numeric);
  if (!Number.isFinite(integer)) {
    return undefined;
  }
  return integer;
};

const parseDateCandidate = (value: unknown): Date | null => {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    if (value > 1e11) {
      return new Date(value);
    }
    if (value > 4e4) {
      const excelEpoch = Date.UTC(1899, 11, 30);
      return new Date(excelEpoch + Math.round(value) * 86400000);
    }
    return new Date(value * 1000);
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }
    const parsed = Date.parse(trimmed);
    if (!Number.isNaN(parsed)) {
      return new Date(parsed);
    }

    const slashMatch = trimmed.match(/^(\d{2})[/-](\d{2})[/-](\d{4})$/);
    if (slashMatch) {
      const [, day, month, year] = slashMatch;
      const date = new Date(Number(year), Number(month) - 1, Number(day));
      return Number.isNaN(date.getTime()) ? null : date;
    }

    const compactMatch = trimmed.match(/^(\d{4})(\d{2})(\d{2})$/);
    if (compactMatch) {
      const [, year, month, day] = compactMatch;
      const date = new Date(Number(year), Number(month) - 1, Number(day));
      return Number.isNaN(date.getTime()) ? null : date;
    }
  }
  return null;
};

const formatDisplayDate = (date: Date): string =>
  new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);

const formatDateTime = (date: Date, time?: string): string => {
  const base = formatDisplayDate(date);
  if (!time) {
    return base;
  }
  const trimmed = time.trim();
  if (!trimmed) {
    return base;
  }
  return `${base} à ${trimmed}`;
};

const OFFICE_IDENTIFIER_KEYS = [
  'office',
  'officeId',
  'officeID',
  'office_id',
  'officeCode',
  'office_code',
  'numero',
  'numeroOffice',
  'numero_office',
  'officeNumber',
  'idOffice',
  'codeOffice',
];

const OFFICE_DATE_KEYS = [
  'officeDate',
  'dateOffice',
  'date_office',
  'office_date',
  'date',
  'Date',
  'dateParution',
  'DateParution',
  'datePublication',
  'DatePublication',
];

const SHIPPING_TEXT_KEYS = [
  'shipping',
  'Shipping',
  'shippingLabel',
  'ShippingLabel',
  'envoi',
  'Envoi',
  'expedition',
  'Expedition',
  'modeExpedition',
  'ModeExpedition',
  'libelleExpedition',
  'LibelleExpedition',
];

const SHIPPING_DATE_KEYS = [
  'shippingDate',
  'ShippingDate',
  'dateEnvoi',
  'DateEnvoi',
  'dateExpedition',
  'DateExpedition',
  'expeditionDate',
  'ExpeditionDate',
];

const SHIPPING_TIME_KEYS = [
  'shippingTime',
  'ShippingTime',
  'heureEnvoi',
  'HeureEnvoi',
  'heureExpedition',
  'HeureExpedition',
];

const EAN_KEYS = [
  'ean',
  'EAN',
  'ean13',
  'EAN13',
  'ean_13',
  'eanCode',
  'Ean',
  'isbn',
  'ISBN',
  'codeEAN',
  'code_ean',
  'CodeEAN',
];

const TITLE_KEYS = ['title', 'Title', 'titre', 'Titre', 'libelle', 'Libelle', 'name', 'Name', 'ouvrage', 'Ouvrage'];

const AUTHORS_KEYS = ['authors', 'Authors', 'auteur', 'Auteur', 'auteurs', 'Auteurs'];

const PUBLISHER_KEYS = [
  'publisher',
  'Publisher',
  'editeur',
  'Editeur',
  'marque',
  'Marque',
  'label',
  'Label',
  'univers',
  'Univers',
];

const PUBLICATION_DATE_KEYS = [
  'publicationDate',
  'PublicationDate',
  'datePublication',
  'DatePublication',
  'parution',
  'Parution',
  'dateParution',
  'DateParution',
  'sortie',
  'Sortie',
];

const PRICE_KEYS = ['priceHT', 'PriceHT', 'prixHT', 'PrixHT', 'prix', 'Prix', 'tarifHT', 'TarifHT', 'tarif', 'Tarif'];

const STOCK_KEYS = [
  'stock',
  'Stock',
  'quantite',
  'Quantite',
  'qte',
  'Qte',
  'stockTheorique',
  'StockTheorique',
  'stockPrev',
  'StockPrev',
  'stock_previsionnel',
];

const COVER_KEYS = [
  'cover',
  'Cover',
  'image',
  'Image',
  'visuel',
  'Visuel',
  'illustration',
  'Illustration',
  'urlImage',
  'UrlImage',
  'vignette',
  'Vignette',
];

const RIBBON_KEYS = ['ribbon', 'Ribbon', 'ribbonText', 'RibbonText', 'badge', 'Badge'];

const INFO_LABEL_KEYS = ['infoLabel', 'InfoLabel', 'statut', 'Statut', 'status', 'Status'];

const INFO_VALUE_KEYS = [
  'infoValue',
  'InfoValue',
  'statutDetail',
  'StatutDetail',
  'etat',
  'Etat',
  'statusDetail',
  'StatusDetail',
];

const VIEWS_KEYS = ['views', 'Views', 'nbVues', 'NbVues', 'vues', 'Vues'];

const extractOfficeRecords = (payload: unknown): RawCatalogueOfficeRecord[] => {
  const visited = new Set<unknown>();
  const queue: unknown[] = [payload];

  while (queue.length > 0) {
    const current = queue.shift();
    if (current === undefined || current === null) {
      continue;
    }
    if (visited.has(current)) {
      continue;
    }
    visited.add(current);

    if (Array.isArray(current)) {
      const records = current.filter(
        (item): item is RawCatalogueOfficeRecord =>
          item !== null && typeof item === 'object' && !Array.isArray(item),
      );
      if (records.length) {
        return records;
      }
      continue;
    }

    if (typeof current === 'string') {
      try {
        const parsed = JSON.parse(current) as unknown;
        queue.push(parsed);
      } catch {
        // ignore parse errors
      }
      continue;
    }

    if (typeof current === 'object') {
      const objectPayload = current as Record<string, unknown>;
      const keysToInspect = ['rows', 'data', 'result', 'recordset', 'Recordset', 'records'];
      for (const key of keysToInspect) {
        if (key in objectPayload) {
          queue.push(objectPayload[key]);
        }
      }
      if (Array.isArray(objectPayload.recordsets)) {
        for (const entry of objectPayload.recordsets as unknown[]) {
          queue.push(entry);
        }
      }
    }
  }

  return [];
};

const determinePublisherColor = (publisher?: string): string => {
  if (!publisher) {
    return '--glenat-bd';
  }

  const normalized = publisher.toLowerCase();
  if (normalized.includes('jeunesse')) {
    return '--glenat-jeunesse';
  }
  if (normalized.includes('manga')) {
    return '--glenat-manga';
  }
  if (normalized.includes('livre')) {
    return '--glenat-livre';
  }
  if (normalized.includes('bd')) {
    return '--glenat-bd';
  }
  if (normalized.includes("vent d'ouest") || normalized.includes('vents d’ouest')) {
    return '--glenat-bd';
  }
  return '--glenat-bd';
};

const buildPlaceholderBook = (
  record: RawCatalogueOfficeRecord,
  ean: string,
  fallbackDate?: Date | null,
): CatalogueBook => {
  const publisher =
    toTrimmedString(getCandidateValue(record, PUBLISHER_KEYS)) ?? 'Éditeur à confirmer';
  const title = toTrimmedString(getCandidateValue(record, TITLE_KEYS)) ?? `Référence ${ean}`;
  const authors =
    toTrimmedString(getCandidateValue(record, AUTHORS_KEYS)) ?? 'Auteur à confirmer';
  const publicationDateCandidate =
    parseDateCandidate(getCandidateValue(record, PUBLICATION_DATE_KEYS)) ?? fallbackDate ?? null;
  const publicationDate = publicationDateCandidate
    ? formatDisplayDate(publicationDateCandidate)
    : 'Date à confirmer';
  const price = toOptionalNumber(getCandidateValue(record, PRICE_KEYS));
  const stock = toOptionalInteger(getCandidateValue(record, STOCK_KEYS)) ?? 0;
  const cover =
    toTrimmedString(getCandidateValue(record, COVER_KEYS)) ?? PlaceholderCover;
  const ribbonText = toTrimmedString(getCandidateValue(record, RIBBON_KEYS));
  const infoLabel = toTrimmedString(getCandidateValue(record, INFO_LABEL_KEYS));

  const rawInfoValue = getCandidateValue(record, INFO_VALUE_KEYS);
  const infoValueString = toTrimmedString(rawInfoValue);
  const infoValueNumber = toOptionalNumber(rawInfoValue);
  const infoValue = infoValueString ?? (infoValueNumber !== undefined ? infoValueNumber : undefined);

  const rawViews = toOptionalNumber(getCandidateValue(record, VIEWS_KEYS));
  const views = rawViews !== undefined && Number.isFinite(rawViews) ? Math.max(0, Math.round(rawViews)) : undefined;

  return {
    cover,
    title,
    ean,
    authors,
    publisher,
    publicationDate,
    priceHT: (price ?? 0).toFixed(2),
    stock,
    color: determinePublisherColor(publisher),
    ...(ribbonText ? { ribbonText } : {}),
    ...(infoLabel ? { infoLabel } : {}),
    ...(infoValue !== undefined ? { infoValue } : {}),
    ...(views !== undefined ? { views } : {}),
  };
};

const tryCloneBook = (ean: string): CatalogueBook | null => {
  try {
    return cloneBook(ean);
  } catch (error) {
    console.warn(`[catalogueApi] Livre introuvable pour l'EAN ${ean}`, error);
    return null;
  }
};

const resolveBookFromRecord = (
  record: RawCatalogueOfficeRecord,
  ean: string,
  fallbackDate?: Date | null,
): CatalogueBook | null => {
  const existing = tryCloneBook(ean);
  if (existing) {
    const infoLabel = toTrimmedString(getCandidateValue(record, INFO_LABEL_KEYS));
    const rawInfoValue = getCandidateValue(record, INFO_VALUE_KEYS);
    const infoValueString = toTrimmedString(rawInfoValue);
    const infoValueNumber = toOptionalNumber(rawInfoValue);
    const infoValue = infoValueString ?? (infoValueNumber !== undefined ? infoValueNumber : undefined);
    const rawViews = toOptionalNumber(getCandidateValue(record, VIEWS_KEYS));
    const views =
      rawViews !== undefined && Number.isFinite(rawViews) ? Math.max(0, Math.round(rawViews)) : undefined;

    return {
      ...existing,
      ...(infoLabel ? { infoLabel } : {}),
      ...(infoValue !== undefined ? { infoValue } : {}),
      ...(views !== undefined ? { views } : {}),
    };
  }

  return buildPlaceholderBook(record, ean, fallbackDate);
};

interface OfficeAccumulator {
  office: string;
  order: number;
  officeDate?: Date | null;
  shippingText?: string;
  shippingDate?: Date | null;
  shippingTime?: string;
  books: CatalogueBook[];
  seenEans: Set<string>;
}

const extractShippingInformation = (
  record: RawCatalogueOfficeRecord,
): { text?: string; date?: Date | null; time?: string } => {
  const text = toTrimmedString(getCandidateValue(record, SHIPPING_TEXT_KEYS));
  const date = parseDateCandidate(getCandidateValue(record, SHIPPING_DATE_KEYS));
  const time = toTrimmedString(getCandidateValue(record, SHIPPING_TIME_KEYS));
  return { text: text ?? undefined, date, time: time ?? undefined };
};

const buildOfficeGroupsFromRecords = (
  records: RawCatalogueOfficeRecord[],
): CatalogueOfficeGroup[] => {
  if (!records.length) {
    return [];
  }

  const groups = new Map<string, OfficeAccumulator>();
  let order = 0;

  for (const record of records) {
    if (!record || typeof record !== 'object') {
      continue;
    }

    const officeIdentifier = toTrimmedString(getCandidateValue(record, OFFICE_IDENTIFIER_KEYS));
    if (!officeIdentifier) {
      continue;
    }

    let accumulator = groups.get(officeIdentifier);
    if (!accumulator) {
      accumulator = {
        office: officeIdentifier,
        order: order += 1,
        books: [],
        seenEans: new Set<string>(),
      };
      groups.set(officeIdentifier, accumulator);
    }

    const officeDateCandidate = parseDateCandidate(getCandidateValue(record, OFFICE_DATE_KEYS));
    if (officeDateCandidate && !accumulator.officeDate) {
      accumulator.officeDate = officeDateCandidate;
    }

    const shippingInfo = extractShippingInformation(record);
    if (shippingInfo.text && !accumulator.shippingText) {
      accumulator.shippingText = shippingInfo.text;
    }
    if (shippingInfo.date && !accumulator.shippingDate) {
      accumulator.shippingDate = shippingInfo.date;
    }
    if (shippingInfo.time && !accumulator.shippingTime) {
      accumulator.shippingTime = shippingInfo.time;
    }

    const ean = toTrimmedString(getCandidateValue(record, EAN_KEYS));
    if (!ean || accumulator.seenEans.has(ean)) {
      continue;
    }

    const book = resolveBookFromRecord(record, ean, accumulator.officeDate ?? shippingInfo.date ?? null);
    if (!book) {
      continue;
    }

    accumulator.seenEans.add(ean);
    accumulator.books.push(book);
  }

  const result = Array.from(groups.values())
    .filter(group => group.books.length > 0)
    .sort((a, b) => {
      if (a.officeDate && b.officeDate) {
        return b.officeDate.getTime() - a.officeDate.getTime();
      }
      if (a.officeDate) {
        return -1;
      }
      if (b.officeDate) {
        return 1;
      }
      return a.order - b.order;
    })
    .map(group => {
      const date = group.officeDate ? formatDisplayDate(group.officeDate) : 'Date à confirmer';
      const shipping = group.shippingText
        ? group.shippingText
        : group.shippingDate
          ? `Expédition planifiée le ${formatDateTime(group.shippingDate, group.shippingTime)}`
          : group.officeDate
            ? `Expédition planifiée le ${formatDisplayDate(group.officeDate)}`
            : 'Expédition à confirmer';

      return {
        office: group.office,
        date,
        shipping,
        books: group.books,
      } satisfies CatalogueOfficeGroup;
    });

  return result;
};

const fetchOfficeGroupsFromDatabase = async (): Promise<CatalogueOfficeGroup[] | null> => {
  if (!CATALOGUE_OFFICES_QUERY) {
    return null;
  }

  const response = await fetch(CATALOGUE_OFFICES_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: CATALOGUE_OFFICES_QUERY }),
  });

  if (!response.ok) {
    throw new Error(
      `Impossible de charger les offices (${response.status}) ${response.statusText}`,
    );
  }

  const payload = (await response.json()) as CatalogueDatabaseResponse;
  if (payload.success === false) {
    const message = typeof payload.message === 'string' ? payload.message : undefined;
    throw new Error(message ?? 'Impossible de charger les offices');
  }

  const candidatePayload =
    payload.result ??
    payload.data ??
    payload.rows ??
    payload.recordset ??
    payload.Recordset ??
    payload.records ??
    payload.recordsets ??
    payload;

  const records = extractOfficeRecords(candidatePayload);
  if (!records.length) {
    return [];
  }

  const groups = buildOfficeGroupsFromRecords(records);
  if (!groups.length) {
    throw new Error('Impossible de construire les offices à partir des données reçues.');
  }

  return groups;
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

export async function fetchCatalogueOffices(): Promise<CatalogueOfficeGroup[]> {
  const endpoint = 'fetchCatalogueOffices';
  logRequest(endpoint);
  if (CATALOGUE_OFFICES_QUERY) {
    try {
      const groups = await fetchOfficeGroupsFromDatabase();
      if (groups && groups.length > 0) {
        logResponse(endpoint, groups);
        return groups;
      }
      if (groups && groups.length === 0) {
        console.warn('[catalogueApi] Aucun office retourné par la base, utilisation du jeu statique.');
      }
    } catch (error) {
      console.error('[catalogueApi] Échec de la récupération des offices depuis la base.', error);
    }
  }

  const data = catalogueDb.offices.map(office => ({
    office: office.office,
    date: office.date,
    shipping: office.shipping,
    books: office.bookEans.map(cloneBook),
  }));
  logResponse(endpoint, data);
  return Promise.resolve(data);
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
