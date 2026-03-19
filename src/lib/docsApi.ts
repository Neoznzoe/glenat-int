import { fetchWithOAuth } from './oauth';

const DOCS_BASE_URL = import.meta.env.DEV
  ? '/Api/v2.0/docs'
  : 'https://api-dev.groupe-glenat.com/Api/v2.0/docs';

// ─── Types ─────────────────────────────────────────────────

export interface DocSubcategory {
  id: number;
  title: string;
  description: string;
  sortOrder: number;
}

export interface DocCategory {
  id: number;
  title: string;
  description: string;
  sortOrder: number;
  subcategories: DocSubcategory[];
}

export interface PhpDate {
  date: string;
  timezone_type: number;
  timezone: string;
}

export type DateField = string | PhpDate | null;

export function parseDateField(value: DateField): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && 'date' in value) return value.date;
  return '';
}

export interface DocDocument {
  id: number;
  title: string;
  description: string;
  extension: string;
  file: string;
  version: string;
  keywords: string;
  createdAt: DateField;
  updatedAt: DateField;
  createdBy: string;
  isText?: boolean;
  text?: string;
}

export interface DocSearchResult extends DocDocument {
  rub1Name: string;
  rub2Name: string;
}

export interface DocSubcategoryDocuments {
  rub1Id: number;
  rub1Name: string;
  rub2Id: number;
  rub2Name: string;
  documents: DocDocument[];
}

// ─── Helpers ───────────────────────────────────────────────

interface ApiResponse<T> {
  success?: boolean;
  message?: string;
  result?: T | { result?: T };
}

function extractResult<T>(data: ApiResponse<T>): T | undefined {
  const result = data.result;
  if (result && typeof result === 'object' && 'result' in (result as Record<string, unknown>)) {
    return (result as { result: T }).result;
  }
  return result as T | undefined;
}

// ─── API Calls ─────────────────────────────────────────────

export async function fetchDocCategories(): Promise<DocCategory[]> {
  const response = await fetchWithOAuth(`${DOCS_BASE_URL}/categories`);

  if (!response.ok) {
    throw new Error(
      `La récupération des catégories a échoué (${response.status}) ${response.statusText}`,
    );
  }

  const data = (await response.json()) as ApiResponse<DocCategory[]>;
  if (data.success === false) {
    throw new Error(data.message || 'La récupération des catégories a échoué.');
  }

  return extractResult(data) ?? [];
}

export async function fetchDocumentsBySubcategory(rub1Id: number, rub2Id: number): Promise<DocSubcategoryDocuments> {
  const response = await fetchWithOAuth(`${DOCS_BASE_URL}/categories/${rub1Id}/${rub2Id}/documents`);

  if (!response.ok) {
    throw new Error(
      `La récupération des documents a échoué (${response.status}) ${response.statusText}`,
    );
  }

  const data = (await response.json()) as ApiResponse<DocSubcategoryDocuments>;
  if (data.success === false) {
    throw new Error(data.message || 'La récupération des documents a échoué.');
  }

  return extractResult(data) ?? { rub1Id, rub1Name: '', rub2Id, rub2Name: '', documents: [] };
}

export async function searchDocuments(query: string, rub1Id?: number): Promise<DocSearchResult[]> {
  const params = new URLSearchParams({ q: query });
  if (rub1Id) params.set('rub1', String(rub1Id));
  const response = await fetchWithOAuth(`${DOCS_BASE_URL}/search?${params.toString()}`);

  if (!response.ok) {
    throw new Error(
      `La recherche a échoué (${response.status}) ${response.statusText}`,
    );
  }

  const data = (await response.json()) as ApiResponse<DocSearchResult[]>;
  if (data.success === false) {
    throw new Error(data.message || 'La recherche a échoué.');
  }

  return extractResult(data) ?? [];
}

// ─── Query Keys ────────────────────────────────────────────

export const DOCS_CATEGORIES_QUERY_KEY = ['docs', 'categories'] as const;
export const DOCS_DOCUMENTS_QUERY_KEY = (rub1Id: number, rub2Id: number) => ['docs', 'documents', rub1Id, rub2Id] as const;
export const DOCS_SEARCH_QUERY_KEY = (query: string, rub1Id?: number) => ['docs', 'search', query, rub1Id ?? 'all'] as const;

// ─── Document file URL ────────────────────────────────────

const DOCS_FILE_BASE_URL = 'https://intranet.glenat.com/upload/doc';

export function getDocFileUrl(file: string, extension?: string, rub1Name?: string, rub2Name?: string, version?: string): string | null {
  if (!file || file.trim() === '') return null;
  const fileName = file.trim();
  const ext = (extension || '').toLowerCase().replace('.', '');
  const ver = (version || '').trim();
  const baseName = ver ? `${fileName}-v${ver}` : fileName;
  const fullName = ext && !baseName.toLowerCase().endsWith(`.${ext}`) ? `${baseName}.${ext}` : baseName;
  const encodedFile = encodeURIComponent(fullName);

  if (rub1Name && rub2Name) {
    return `${DOCS_FILE_BASE_URL}/${encodeURIComponent(rub1Name.trim())}/${encodeURIComponent(rub2Name.trim())}/${encodedFile}`;
  }
  return `${DOCS_FILE_BASE_URL}/${encodedFile}`;
}

export function getExtensionColor(extension: string): string {
  const ext = (extension || '').toLowerCase().replace('.', '');
  switch (ext) {
    case 'pdf': return '#F00020';
    case 'doc': case 'docx': return '#2B579A';
    case 'xls': case 'xlsx': return '#217346';
    case 'ppt': case 'pptx': return '#F4B400';
    case 'jpg': case 'jpeg': case 'png': case 'gif': return '#D63384';
    default: return '#6b7280';
  }
}
