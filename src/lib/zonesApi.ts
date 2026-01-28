import { fetchWithOAuth } from './oauth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'https://api-dev.groupe-glenat.com';

export interface Zone {
  ZoneId: string;
  ProjectId: string;
  ZoneCode: string;
  ZoneName: string;
  TemplateKey: string | null;
  DefaultLanguage: string;
  AuthorizedLanguages: string;
  DefaultTimeZone: string | null;
  DefaultSiteZone: number;
  CacheControl: string | null;
  CachePragma: string | null;
  CacheAgeSeconds: number | null;
  FavIconMediaId: string | null;
  Description: string | null;
  Keywords: string | null;
  Robots: string | null;
  GoogleBot: string | null;
  VisualTheme: string | null;
  DefaultViewportSize: string | null;
  OptimizePerformance: number;
  PerformanceSettings: string | null;
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

export interface CreateZonePayload {
  ZoneCode: string;
  ZoneName: string;
  ProjectId?: string;
  TemplateKey?: string | null;
  DefaultLanguage: string;
  AuthorizedLanguages: string;
  DefaultTimeZone?: string | null;
  DefaultSiteZone: number;
  CacheControl?: string | null;
  CachePragma?: string | null;
  CacheAgeSeconds?: number | null;
  Description?: string | null;
}

interface CreateZoneApiPayload {
  zone_code: string;
  zone_name: string;
  project_id?: string;
  template_key?: string | null;
  default_language: string;
  authorized_languages: string;
  default_time_zone?: string | null;
  default_site_zone: number;
  cache_control?: string | null;
  cache_pragma?: string | null;
  cache_age_seconds?: number | null;
  description?: string | null;
}

export interface UpdateZonePayload extends Partial<CreateZonePayload> {
  ZoneId: string;
}

export interface ZonesListResponse {
  success: boolean;
  code: number;
  message: string;
  zones: Zone[];
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

export async function fetchZones(): Promise<Zone[]> {
  const url = `${API_BASE_URL}/Api/v2.0/Cms/zone`;

  const response = await fetchWithOAuth(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const data = await handleResponse<ZonesListResponse>(response);

  return data.zones || [];
}

export async function fetchZone(zoneId: string): Promise<Zone> {
  const url = `${API_BASE_URL}/Api/v2.0/Cms/zone/${zoneId}`;

  const response = await fetchWithOAuth(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const data = await handleResponse<{ success: boolean; zone: Zone }>(response);
  return data.zone;
}

export async function createZone(payload: CreateZonePayload): Promise<Zone> {
  const url = `${API_BASE_URL}/Api/v2.0/Cms/zone`;

  // Transform payload to snake_case for API
  const apiPayload: CreateZoneApiPayload = {
    zone_code: payload.ZoneCode,
    zone_name: payload.ZoneName,
    project_id: payload.ProjectId,
    template_key: payload.TemplateKey,
    default_language: payload.DefaultLanguage,
    authorized_languages: payload.AuthorizedLanguages,
    default_time_zone: payload.DefaultTimeZone,
    default_site_zone: payload.DefaultSiteZone,
    cache_control: payload.CacheControl,
    cache_pragma: payload.CachePragma,
    cache_age_seconds: payload.CacheAgeSeconds,
    description: payload.Description,
  };

  const response = await fetchWithOAuth(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(apiPayload),
  });

  const data = await handleResponse<{ success: boolean; zone: Zone }>(response);
  return data.zone;
}

export async function updateZone(zoneId: string, payload: Partial<CreateZonePayload>): Promise<Zone> {
  const url = `${API_BASE_URL}/Api/v2.0/Cms/zone/${zoneId}`;

  // Transform payload to snake_case for API - only include non-empty fields
  const apiPayload: Partial<CreateZoneApiPayload> = {};

  if (payload.ZoneCode) apiPayload.zone_code = payload.ZoneCode;
  if (payload.ZoneName) apiPayload.zone_name = payload.ZoneName;
  if (payload.ProjectId) apiPayload.project_id = payload.ProjectId;
  if (payload.TemplateKey) apiPayload.template_key = payload.TemplateKey;
  if (payload.DefaultLanguage) apiPayload.default_language = payload.DefaultLanguage;
  if (payload.AuthorizedLanguages) apiPayload.authorized_languages = payload.AuthorizedLanguages;
  if (payload.DefaultTimeZone) apiPayload.default_time_zone = payload.DefaultTimeZone;
  if (payload.DefaultSiteZone !== undefined) apiPayload.default_site_zone = payload.DefaultSiteZone;
  if (payload.CacheControl) apiPayload.cache_control = payload.CacheControl;
  if (payload.CachePragma) apiPayload.cache_pragma = payload.CachePragma;
  if (payload.CacheAgeSeconds !== undefined) apiPayload.cache_age_seconds = payload.CacheAgeSeconds;
  if (payload.Description) apiPayload.description = payload.Description;

  const response = await fetchWithOAuth(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(apiPayload),
  });

  const data = await handleResponse<{ success: boolean; zone: Zone }>(response);
  return data.zone;
}

export async function deleteZone(zoneId: string): Promise<void> {
  const url = `${API_BASE_URL}/Api/v2.0/Cms/zone/${zoneId}`;

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
    throw new Error(errorMessage || 'Erreur lors de la suppression de la zone');
  }
}
