import { fetchWithOAuth } from './oauth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'https://api-dev.groupe-glenat.com';

export interface Project {
  ProjectId: string;
  ProjectCode: string;
  Company: string | null;
  ProjectName: string;
  Version: string | null;
  ProjectType: string | null;
  Uri: string | null;
  MemoryLimit: string | null;
  Domain: string | null;
  DomainSub: string | null;
  AssistanceEmail: string | null;
  WebsiteBrand: string | null;
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

export interface CreateProjectPayload {
  ProjectCode: string;
  ProjectName: string;
  Company?: string | null;
  Version?: string | null;
  ProjectType?: string | null;
  Uri?: string | null;
  MemoryLimit?: string | null;
  Domain?: string | null;
  DomainSub?: string | null;
  AssistanceEmail?: string | null;
  WebsiteBrand?: string | null;
}

interface CreateProjectApiPayload {
  project_code: string;
  project_name: string;
  company?: string | null;
  version?: string | null;
  project_type?: string | null;
  uri?: string | null;
  memory_limit?: string | null;
  domain?: string | null;
  domain_sub?: string | null;
  assistance_email?: string | null;
  website_brand?: string | null;
}

export interface ProjectsListResponse {
  success: boolean;
  code: number;
  message: string;
  projects: Project[];
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

export async function fetchProjects(): Promise<Project[]> {
  const url = `${API_BASE_URL}/Api/v2.0/Project/project`;

  const response = await fetchWithOAuth(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const data = await handleResponse<ProjectsListResponse>(response);

  return data.projects || [];
}

export async function fetchProject(projectId: string): Promise<Project> {
  const url = `${API_BASE_URL}/Api/v2.0/Project/project/${projectId}`;

  const response = await fetchWithOAuth(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const data = await handleResponse<{ success: boolean; project: Project }>(response);
  return data.project;
}

export async function createProject(payload: CreateProjectPayload): Promise<Project> {
  const url = `${API_BASE_URL}/Api/v2.0/Project/project`;

  // Transform payload to snake_case for API
  const apiPayload: CreateProjectApiPayload = {
    project_code: payload.ProjectCode,
    project_name: payload.ProjectName,
    company: payload.Company,
    version: payload.Version,
    project_type: payload.ProjectType,
    uri: payload.Uri,
    memory_limit: payload.MemoryLimit,
    domain: payload.Domain,
    domain_sub: payload.DomainSub,
    assistance_email: payload.AssistanceEmail,
    website_brand: payload.WebsiteBrand,
  };

  const response = await fetchWithOAuth(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(apiPayload),
  });

  const data = await handleResponse<{ success: boolean; project: Project }>(response);
  return data.project;
}

export async function updateProject(
  projectId: string,
  payload: Partial<CreateProjectPayload>,
): Promise<Project> {
  const url = `${API_BASE_URL}/Api/v2.0/Project/project/${projectId}`;

  // Transform payload to snake_case for API - only include non-empty fields
  const apiPayload: Partial<CreateProjectApiPayload> = {};

  if (payload.ProjectCode) apiPayload.project_code = payload.ProjectCode;
  if (payload.ProjectName) apiPayload.project_name = payload.ProjectName;
  if (payload.Company) apiPayload.company = payload.Company;
  if (payload.Version) apiPayload.version = payload.Version;
  if (payload.ProjectType) apiPayload.project_type = payload.ProjectType;
  if (payload.Uri) apiPayload.uri = payload.Uri;
  if (payload.MemoryLimit) apiPayload.memory_limit = payload.MemoryLimit;
  if (payload.Domain) apiPayload.domain = payload.Domain;
  if (payload.DomainSub) apiPayload.domain_sub = payload.DomainSub;
  if (payload.AssistanceEmail) apiPayload.assistance_email = payload.AssistanceEmail;
  if (payload.WebsiteBrand) apiPayload.website_brand = payload.WebsiteBrand;

  console.log('UPDATE PROJECT - URL:', url);
  console.log('UPDATE PROJECT - Payload:', apiPayload);

  const response = await fetchWithOAuth(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(apiPayload),
  });

  const data = await handleResponse<{ success: boolean; project: Project }>(response);
  console.log('UPDATE PROJECT - Response:', data);
  return data.project;
}

export async function deleteProject(projectId: string): Promise<void> {
  const url = `${API_BASE_URL}/Api/v2.0/Project/project/${projectId}`;

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
    throw new Error(errorMessage || 'Erreur lors de la suppression du projet');
  }
}
