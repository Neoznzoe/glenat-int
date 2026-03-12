import { fetchWithOAuth } from './oauth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'https://api-dev.groupe-glenat.com';

export interface Element {
  ElementId: string;
  BlockId: string;
  ElementType: string;
  ElementKey: string | null;
  Content: string | null;
  Metadata: string | null;
  IsActive: number;
  SortOrder: number | null;
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

export interface CreateElementPayload {
  BlockId: string;
  ElementType: string;
  ElementKey?: string | null;
  Content?: string | null;
  Metadata?: string | null;
  IsActive: number;
  SortOrder?: number | null;
}

interface CreateElementApiPayload {
  block_id: string;
  element_type: string;
  element_key?: string | null;
  content?: string | null;
  metadata?: string | null;
  is_active: number;
  sort_order?: number | null;
}

export interface ElementsListResponse {
  success: boolean;
  code: number;
  message: string;
  elements: Element[];
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

export async function fetchElements(): Promise<Element[]> {
  const url = `${API_BASE_URL}/Api/v2.0/cms/elements`;

  const response = await fetchWithOAuth(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const data = await handleResponse<ElementsListResponse & { result?: Element[] | { elements?: Element[] } }>(response);

  if (data.elements && data.elements.length > 0) {
    return data.elements;
  }
  if (data.result) {
    if (Array.isArray(data.result)) {
      return data.result;
    }
    if (data.result.elements) {
      return data.result.elements;
    }
  }
  return [];
}

export async function fetchElement(elementId: string): Promise<Element> {
  const url = `${API_BASE_URL}/Api/v2.0/cms/elements/${elementId}`;

  const response = await fetchWithOAuth(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const data = await handleResponse<{ success: boolean; element: Element }>(response);
  return data.element;
}

export async function createElement(payload: CreateElementPayload): Promise<Element> {
  const url = `${API_BASE_URL}/Api/v2.0/cms/createElement`;

  const apiPayload: CreateElementApiPayload = {
    block_id: payload.BlockId,
    element_type: payload.ElementType,
    element_key: payload.ElementKey,
    content: payload.Content,
    metadata: payload.Metadata,
    is_active: payload.IsActive,
    sort_order: payload.SortOrder,
  };

  const response = await fetchWithOAuth(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(apiPayload),
  });

  const data = await handleResponse<{ success: boolean; element: Element }>(response);
  return data.element;
}

export async function updateElement(
  elementId: string,
  payload: Partial<CreateElementPayload>,
): Promise<Element> {
  const url = `${API_BASE_URL}/Api/v2.0/cms/updateElement/${elementId}`;

  const apiPayload: Partial<CreateElementApiPayload> = {};

  if (payload.BlockId) apiPayload.block_id = payload.BlockId;
  if (payload.ElementType) apiPayload.element_type = payload.ElementType;
  if (payload.ElementKey) apiPayload.element_key = payload.ElementKey;
  if (payload.Content) apiPayload.content = payload.Content;
  if (payload.Metadata) apiPayload.metadata = payload.Metadata;
  if (payload.IsActive !== undefined) apiPayload.is_active = payload.IsActive;
  if (payload.SortOrder !== undefined) apiPayload.sort_order = payload.SortOrder;

  const response = await fetchWithOAuth(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(apiPayload),
  });

  const data = await handleResponse<{ success: boolean; element: Element }>(response);
  return data.element;
}

export async function deleteElement(elementId: string): Promise<void> {
  const url = `${API_BASE_URL}/Api/v2.0/cms/deleteElement/${elementId}`;

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
    throw new Error(errorMessage || "Erreur lors de la suppression de l'élément");
  }
}
