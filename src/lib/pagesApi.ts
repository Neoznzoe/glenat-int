import { fetchWithOAuth } from './oauth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'https://api-dev.groupe-glenat.com';

export interface Page {
  PageId: string;
  ModuleId: string;
  PageCode: string;
  PageName: string;
  PageType: string | null;
  TemplateKey: string | null;
  Description: string | null;
  IsActive: number;
  IsPublished: number;
  DisplayOrder: number | null;
  MetaTitle: string | null;
  MetaDescription: string | null;
  MetaKeywords: string | null;
  CacheControl: string | null;
  CachePragma: string | null;
  CacheAgeSeconds: number | null;
  CreatedAt: {
    date: string;
    timezone_type: number;
    timezone: string;
  } | null;
  CreatedBy: string | null;
  UpdatedAt: {
    date: string;
    timezone_type: number;
    timezone: string;
  } | null;
  UpdatedBy: string | null;
}

export interface CreatePagePayload {
  PageCode: string;
  PageName: string;
  ModuleId: string;
  PageType?: string | null;
  TemplateKey?: string | null;
  Description?: string | null;
  IsActive: number;
  IsPublished: number;
  DisplayOrder?: number | null;
  MetaTitle?: string | null;
  MetaDescription?: string | null;
  MetaKeywords?: string | null;
  CacheControl?: string | null;
  CachePragma?: string | null;
  CacheAgeSeconds?: number | null;
}

interface CreatePageApiPayload {
  page_code: string;
  page_name: string;
  module_id: string;
  page_type?: string | null;
  template_key?: string | null;
  description?: string | null;
  is_active: number;
  is_published: number;
  display_order?: number | null;
  meta_title?: string | null;
  meta_description?: string | null;
  meta_keywords?: string | null;
  cache_control?: string | null;
  cache_pragma?: string | null;
  cache_age_seconds?: number | null;
}

export interface PagesListResponse {
  success: boolean;
  code: number;
  message: string;
  pages: Page[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
    pages: number;
  };
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = response.statusText;
    try {
      const errorData = (await response.json()) as { message?: string };
      if (errorData.message) {
        errorMessage = errorData.message;
      }
    } catch {
      // Ignore JSON parse errors
    }
    throw new Error(errorMessage || 'Une erreur est survenue');
  }
  return (await response.json()) as T;
}

export async function fetchPages(): Promise<Page[]> {
  const url = `${API_BASE_URL}/Api/v2.0/Cms/page`;

  const response = await fetchWithOAuth(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const data = await handleResponse<PagesListResponse>(response);

  return data.pages || [];
}

export async function fetchPage(pageId: string): Promise<Page> {
  const url = `${API_BASE_URL}/Api/v2.0/Cms/page/${pageId}`;

  const response = await fetchWithOAuth(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const data = await handleResponse<{ success: boolean; page: Page }>(response);
  return data.page;
}

export async function createPage(payload: CreatePagePayload): Promise<Page> {
  const url = `${API_BASE_URL}/Api/v2.0/Cms/page`;

  // Transform payload to snake_case for API
  const apiPayload: CreatePageApiPayload = {
    page_code: payload.PageCode,
    page_name: payload.PageName,
    module_id: payload.ModuleId,
    page_type: payload.PageType,
    template_key: payload.TemplateKey,
    description: payload.Description,
    is_active: payload.IsActive,
    is_published: payload.IsPublished,
    display_order: payload.DisplayOrder,
    meta_title: payload.MetaTitle,
    meta_description: payload.MetaDescription,
    meta_keywords: payload.MetaKeywords,
    cache_control: payload.CacheControl,
    cache_pragma: payload.CachePragma,
    cache_age_seconds: payload.CacheAgeSeconds,
  };

  const response = await fetchWithOAuth(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(apiPayload),
  });

  const data = await handleResponse<{ success: boolean; page: Page }>(response);
  return data.page;
}

export async function updatePage(pageId: string, payload: Partial<CreatePagePayload>): Promise<Page> {
  const url = `${API_BASE_URL}/Api/v2.0/Cms/page/${pageId}`;

  // Transform payload to snake_case for API - only include non-empty fields
  const apiPayload: Partial<CreatePageApiPayload> = {};

  if (payload.PageCode) apiPayload.page_code = payload.PageCode;
  if (payload.PageName) apiPayload.page_name = payload.PageName;
  if (payload.ModuleId) apiPayload.module_id = payload.ModuleId;
  if (payload.PageType) apiPayload.page_type = payload.PageType;
  if (payload.TemplateKey) apiPayload.template_key = payload.TemplateKey;
  if (payload.Description) apiPayload.description = payload.Description;
  if (payload.IsActive !== undefined) apiPayload.is_active = payload.IsActive;
  if (payload.IsPublished !== undefined) apiPayload.is_published = payload.IsPublished;
  if (payload.DisplayOrder !== undefined) apiPayload.display_order = payload.DisplayOrder;
  if (payload.MetaTitle) apiPayload.meta_title = payload.MetaTitle;
  if (payload.MetaDescription) apiPayload.meta_description = payload.MetaDescription;
  if (payload.MetaKeywords) apiPayload.meta_keywords = payload.MetaKeywords;
  if (payload.CacheControl) apiPayload.cache_control = payload.CacheControl;
  if (payload.CachePragma) apiPayload.cache_pragma = payload.CachePragma;
  if (payload.CacheAgeSeconds !== undefined) apiPayload.cache_age_seconds = payload.CacheAgeSeconds;

  const response = await fetchWithOAuth(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(apiPayload),
  });

  const data = await handleResponse<{ success: boolean; page: Page }>(response);
  return data.page;
}

export async function deletePage(pageId: string): Promise<void> {
  const url = `${API_BASE_URL}/Api/v2.0/Cms/page/${pageId}`;

  const response = await fetchWithOAuth(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    let errorMessage = response.statusText;
    try {
      const errorData = (await response.json()) as { message?: string };
      if (errorData.message) {
        errorMessage = errorData.message;
      }
    } catch {
      // Ignore JSON parse errors
    }
    throw new Error(errorMessage || 'Erreur lors de la suppression de la page');
  }
}
