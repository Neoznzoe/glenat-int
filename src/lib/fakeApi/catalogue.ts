import {
  catalogueDb,
  type CatalogueBook,
  type CatalogueEdition,
} from '@/data/catalogue';

const simulateDelay = (min = 200, max = 600) =>
  new Promise<void>(resolve => {
    const timeout = Math.floor(Math.random() * (max - min + 1)) + min;
    setTimeout(() => resolve(), timeout);
  });

const cloneBook = (ean: string): CatalogueBook => {
  const book = catalogueDb.books.find(item => item.ean === ean);

  if (!book) {
    throw new Error(`Livre introuvable pour l'EAN ${ean}`);
  }

  return { ...book };
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
  await simulateDelay();
  return catalogueDb.books.map(book => ({ ...book }));
}

export async function fetchCatalogueReleases(): Promise<CatalogueReleaseGroup[]> {
  await simulateDelay();
  return catalogueDb.releases.map(release => ({
    date: release.date,
    books: release.bookEans.map(cloneBook),
  }));
}

export async function fetchCatalogueOffices(): Promise<CatalogueOfficeGroup[]> {
  await simulateDelay();
  return catalogueDb.offices.map(office => ({
    office: office.office,
    date: office.date,
    shipping: office.shipping,
    books: office.bookEans.map(cloneBook),
  }));
}

export async function fetchCatalogueKiosques(): Promise<CatalogueKiosqueGroup[]> {
  await simulateDelay();
  return catalogueDb.kiosques.map(kiosque => ({
    office: kiosque.office,
    date: kiosque.date,
    shipping: kiosque.shipping,
    books: kiosque.bookEans.map(cloneBook),
  }));
}

export async function fetchCatalogueEditions(): Promise<CatalogueEdition[]> {
  await simulateDelay();
  return catalogueDb.editions.map(edition => ({ ...edition }));
}
