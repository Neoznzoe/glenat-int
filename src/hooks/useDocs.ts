import { useQuery } from '@tanstack/react-query';
import {
  fetchDocCategories,
  fetchDocumentsBySubcategory,
  searchDocuments,
  DOCS_CATEGORIES_QUERY_KEY,
  DOCS_DOCUMENTS_QUERY_KEY,
  DOCS_SEARCH_QUERY_KEY,
  type DocCategory,
  type DocSubcategoryDocuments,
  type DocSearchResult,
} from '@/lib/docsApi';

export function useDocCategories() {
  return useQuery<DocCategory[]>({
    queryKey: [...DOCS_CATEGORIES_QUERY_KEY],
    queryFn: fetchDocCategories,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

export function useDocumentsBySubcategory(rub1Id: number, rub2Id: number) {
  return useQuery<DocSubcategoryDocuments>({
    queryKey: [...DOCS_DOCUMENTS_QUERY_KEY(rub1Id, rub2Id)],
    queryFn: () => fetchDocumentsBySubcategory(rub1Id, rub2Id),
    staleTime: 5 * 60 * 1000,
    retry: 1,
    enabled: rub1Id > 0 && rub2Id > 0,
  });
}

export function useSearchDocuments(query: string, rub1Id?: number) {
  return useQuery<DocSearchResult[]>({
    queryKey: [...DOCS_SEARCH_QUERY_KEY(query, rub1Id)],
    queryFn: () => searchDocuments(query, rub1Id),
    staleTime: 5 * 60 * 1000,
    retry: 1,
    enabled: query.trim().length >= 2,
  });
}
