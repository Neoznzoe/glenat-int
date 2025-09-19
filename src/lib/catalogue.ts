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
import UniversBD from '@/assets/logos/univers/univers-bd.svg';
import UniversJeune from '@/assets/logos/univers/univers-jeunesse.svg';
import UniversLivre from '@/assets/logos/univers/univers-livres.svg';
import UniversManga from '@/assets/logos/univers/univers-manga.svg';
import type { BookCardProps } from '@/components/BookCard';

export interface CatalogueBook extends BookCardProps {
  creationDate?: string;
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
      priceHT: '7.99',
      stock: 86,
      views: 140,
      color: '--glenat-manga',
      ribbonText: 'NOUVEAUTÉ',
      creationDate: '22/02/2024',
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

  return { ...book };
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
  const data = catalogueDb.books.map(book => ({ ...book }));
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
