import { fetchWithOAuth } from './oauth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'https://api-dev.groupe-glenat.com';

// ============================================================================
// TYPES
// ============================================================================

export interface DocusignSigner {
  name: string;
  email: string;
  role?: number;
  civility?: string;
  message?: string;
  function?: string;
}

export interface DocusignDocument {
  name: string;
  url: string;
  signable?: boolean;
}

export interface CreateEnvelopePayload {
  send?: boolean;
  societe: string;
  lang?: string;
  contract: number;
  subject: string;
  contact: string;
  signers: DocusignSigner[];
  documents: DocusignDocument[];
}

export interface EnvelopeResponse {
  success: boolean;
  code: number;
  message: string;
  result: {
    envelopeId: string;
  };
}

export interface EnvelopeStatusResponse {
  success: boolean;
  code: number;
  message: string;
  result: unknown;
}

export interface EnvelopeSignersResponse {
  success: boolean;
  code: number;
  message: string;
  result: {
    envelope: unknown;
    signers: DocusignSigner[];
  };
}

export interface EnvelopeDownloadResponse {
  success: boolean;
  code: number;
  message: string;
  result: {
    envelopeId: string;
    document: string;
    mimeType: string;
  };
}

// ============================================================================
// HELPERS
// ============================================================================

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

// ============================================================================
// ENVELOPE CRUD
// ============================================================================

export async function createEnvelope(payload: CreateEnvelopePayload): Promise<EnvelopeResponse> {
  const url = `${API_BASE_URL}/Api/v2.0/Docusign/envelope`;

  const response = await fetchWithOAuth(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  return handleResponse<EnvelopeResponse>(response);
}

export async function getEnvelopeStatus(
  envelopeId: string,
  societe: string,
  lang = 'fr',
): Promise<EnvelopeStatusResponse> {
  const url = `${API_BASE_URL}/Api/v2.0/Docusign/envelope/${encodeURIComponent(envelopeId)}?societe=${encodeURIComponent(societe)}&lang=${encodeURIComponent(lang)}`;

  const response = await fetchWithOAuth(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  return handleResponse<EnvelopeStatusResponse>(response);
}

export async function voidEnvelope(
  envelopeId: string,
  societe: string,
  lang = 'fr',
): Promise<EnvelopeStatusResponse> {
  const url = `${API_BASE_URL}/Api/v2.0/Docusign/envelope/${encodeURIComponent(envelopeId)}`;

  const response = await fetchWithOAuth(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ societe, lang, action: 'void' }),
  });

  return handleResponse<EnvelopeStatusResponse>(response);
}

/**
 * v2.2 — Annule (void) une enveloppe DocuSign via DELETE
 */
export async function deleteEnvelope(
  envelopeId: string,
  societe: string,
  lang = 'fr',
): Promise<EnvelopeStatusResponse> {
  const url = `${API_BASE_URL}/Api/v2.0/Docusign/envelope/${encodeURIComponent(envelopeId)}`;

  const response = await fetchWithOAuth(url, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ societe, lang }),
  });

  return handleResponse<EnvelopeStatusResponse>(response);
}

// ============================================================================
// ENVELOPE DOCUMENTS
// ============================================================================

export async function downloadEnvelopeDocuments(
  envelopeId: string,
  societe: string,
  lang = 'fr',
): Promise<EnvelopeDownloadResponse> {
  const url = `${API_BASE_URL}/Api/v2.0/Docusign/envelope/${encodeURIComponent(envelopeId)}/download?societe=${encodeURIComponent(societe)}&lang=${encodeURIComponent(lang)}`;

  const response = await fetchWithOAuth(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  return handleResponse<EnvelopeDownloadResponse>(response);
}

// ============================================================================
// ENVELOPE SIGNERS
// ============================================================================

export async function getEnvelopeSigners(
  envelopeId: string,
  societe: string,
  lang = 'fr',
): Promise<EnvelopeSignersResponse> {
  const url = `${API_BASE_URL}/Api/v2.0/Docusign/envelope/${encodeURIComponent(envelopeId)}/signers?societe=${encodeURIComponent(societe)}&lang=${encodeURIComponent(lang)}`;

  const response = await fetchWithOAuth(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  return handleResponse<EnvelopeSignersResponse>(response);
}

export async function getEnvelopeSigner(
  envelopeId: string,
  signerIdentifier: string,
  societe: string,
  lang = 'fr',
): Promise<EnvelopeStatusResponse> {
  const url = `${API_BASE_URL}/Api/v2.0/Docusign/envelope/${encodeURIComponent(envelopeId)}/signer/${encodeURIComponent(signerIdentifier)}?societe=${encodeURIComponent(societe)}&lang=${encodeURIComponent(lang)}`;

  const response = await fetchWithOAuth(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  return handleResponse<EnvelopeStatusResponse>(response);
}
