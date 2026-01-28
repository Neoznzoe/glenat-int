import { fetchWithOAuth } from './oauth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'https://api-dev.groupe-glenat.com';

export interface Module {
  ModuleId: string;
  ZoneId: string;
  ModuleCode: string;
  ModuleName: string;
  ModuleType: string | null;
  TemplateKey: string | null;
  Description: string | null;
  IsActive: number;
  DisplayOrder: number | null;
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

export interface CreateModulePayload {
  ModuleCode: string;
  ModuleName: string;
  ZoneId: string;
  ModuleType?: string | null;
  TemplateKey?: string | null;
  Description?: string | null;
  IsActive: number;
  DisplayOrder?: number | null;
  CacheControl?: string | null;
  CachePragma?: string | null;
  CacheAgeSeconds?: number | null;
}

interface CreateModuleApiPayload {
  module_code: string;
  module_name: string;
  zone_id: string;
  module_type?: string | null;
  template_key?: string | null;
  description?: string | null;
  is_active: number;
  display_order?: number | null;
  cache_control?: string | null;
  cache_pragma?: string | null;
  cache_age_seconds?: number | null;
}

export interface ModulesListResponse {
  success: boolean;
  code: number;
  message: string;
  modules: Module[];
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

export async function fetchModules(): Promise<Module[]> {
  const url = `${API_BASE_URL}/Api/v2.0/Cms/module`;

  const response = await fetchWithOAuth(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const data = await handleResponse<ModulesListResponse>(response);

  return data.modules || [];
}

export async function fetchModule(moduleId: string): Promise<Module> {
  const url = `${API_BASE_URL}/Api/v2.0/Cms/module/${moduleId}`;

  const response = await fetchWithOAuth(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const data = await handleResponse<{ success: boolean; module: Module }>(response);
  return data.module;
}

export async function createModule(payload: CreateModulePayload): Promise<Module> {
  const url = `${API_BASE_URL}/Api/v2.0/Cms/module`;

  // Transform payload to snake_case for API
  const apiPayload: CreateModuleApiPayload = {
    module_code: payload.ModuleCode,
    module_name: payload.ModuleName,
    zone_id: payload.ZoneId,
    module_type: payload.ModuleType,
    template_key: payload.TemplateKey,
    description: payload.Description,
    is_active: payload.IsActive,
    display_order: payload.DisplayOrder,
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

  const data = await handleResponse<{ success: boolean; module: Module }>(response);
  return data.module;
}

export async function updateModule(
  moduleId: string,
  payload: Partial<CreateModulePayload>,
): Promise<Module> {
  const url = `${API_BASE_URL}/Api/v2.0/Cms/module/${moduleId}`;

  // Transform payload to snake_case for API - only include non-empty fields
  const apiPayload: Partial<CreateModuleApiPayload> = {};

  if (payload.ModuleCode) apiPayload.module_code = payload.ModuleCode;
  if (payload.ModuleName) apiPayload.module_name = payload.ModuleName;
  if (payload.ZoneId) apiPayload.zone_id = payload.ZoneId;
  if (payload.ModuleType) apiPayload.module_type = payload.ModuleType;
  if (payload.TemplateKey) apiPayload.template_key = payload.TemplateKey;
  if (payload.Description) apiPayload.description = payload.Description;
  if (payload.IsActive !== undefined) apiPayload.is_active = payload.IsActive;
  if (payload.DisplayOrder !== undefined) apiPayload.display_order = payload.DisplayOrder;
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

  const data = await handleResponse<{ success: boolean; module: Module }>(response);
  return data.module;
}

export async function deleteModule(moduleId: string): Promise<void> {
  const url = `${API_BASE_URL}/Api/v2.0/Cms/module/${moduleId}`;

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
    throw new Error(errorMessage || 'Erreur lors de la suppression du module');
  }
}
