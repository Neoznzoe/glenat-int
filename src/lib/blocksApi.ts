import { fetchWithOAuth } from './oauth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'https://api-dev.groupe-glenat.com';

export interface Block {
  BlockId: string;
  PageId: string;
  BlockCode: string;
  Title: string | null;
  LayoutRegion: string | null;
  SortOrder: number | null;
  IsReusable: number;
  Status: string | null;
  ContentDefinition: string | null;
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

export interface CreateBlockPayload {
  PageId: string;
  BlockCode: string;
  Title?: string | null;
  LayoutRegion?: string | null;
  SortOrder?: number | null;
  IsReusable: number;
  Status?: string | null;
  ContentDefinition?: string | null;
}

interface CreateBlockApiPayload {
  page_id: string;
  block_code: string;
  title?: string | null;
  layout_region?: string | null;
  sort_order?: number | null;
  is_reusable: number;
  status?: string | null;
  content_definition?: string | null;
}

export interface BlocksListResponse {
  success: boolean;
  code: number;
  message: string;
  blocks: Block[];
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

export async function fetchBlocks(): Promise<Block[]> {
  const url = `${API_BASE_URL}/Api/v2.0/cms/blocks`;

  const response = await fetchWithOAuth(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const data = await handleResponse<BlocksListResponse & { result?: Block[] | { blocks?: Block[] } }>(response);

  if (data.blocks && data.blocks.length > 0) {
    return data.blocks;
  }
  if (data.result) {
    if (Array.isArray(data.result)) {
      return data.result;
    }
    if (data.result.blocks) {
      return data.result.blocks;
    }
  }
  return [];
}

export async function fetchBlock(blockId: string): Promise<Block> {
  const url = `${API_BASE_URL}/Api/v2.0/cms/blocks/${blockId}`;

  const response = await fetchWithOAuth(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const data = await handleResponse<{ success: boolean; block: Block }>(response);
  return data.block;
}

export async function createBlock(payload: CreateBlockPayload): Promise<Block> {
  const url = `${API_BASE_URL}/Api/v2.0/cms/createBlock`;

  const apiPayload: CreateBlockApiPayload = {
    page_id: payload.PageId,
    block_code: payload.BlockCode,
    title: payload.Title,
    layout_region: payload.LayoutRegion,
    sort_order: payload.SortOrder,
    is_reusable: payload.IsReusable,
    status: payload.Status,
    content_definition: payload.ContentDefinition,
  };

  const response = await fetchWithOAuth(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(apiPayload),
  });

  const data = await handleResponse<{ success: boolean; block: Block }>(response);
  return data.block;
}

export async function updateBlock(
  blockId: string,
  payload: Partial<CreateBlockPayload>,
): Promise<Block> {
  const url = `${API_BASE_URL}/Api/v2.0/cms/updateBlock/${blockId}`;

  const apiPayload: Partial<CreateBlockApiPayload> = {};

  if (payload.PageId) apiPayload.page_id = payload.PageId;
  if (payload.BlockCode) apiPayload.block_code = payload.BlockCode;
  if (payload.Title) apiPayload.title = payload.Title;
  if (payload.LayoutRegion) apiPayload.layout_region = payload.LayoutRegion;
  if (payload.SortOrder !== undefined) apiPayload.sort_order = payload.SortOrder;
  if (payload.IsReusable !== undefined) apiPayload.is_reusable = payload.IsReusable;
  if (payload.Status) apiPayload.status = payload.Status;
  if (payload.ContentDefinition) apiPayload.content_definition = payload.ContentDefinition;

  const response = await fetchWithOAuth(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(apiPayload),
  });

  const data = await handleResponse<{ success: boolean; block: Block }>(response);
  return data.block;
}

export async function deleteBlock(blockId: string): Promise<void> {
  const url = `${API_BASE_URL}/Api/v2.0/cms/deleteBlock/${blockId}`;

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
    throw new Error(errorMessage || 'Erreur lors de la suppression du bloc');
  }
}
