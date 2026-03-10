import { fetchWithOAuth } from './oauth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'https://api-dev.groupe-glenat.com';

// ============================================================================
// TYPES
// ============================================================================

export interface JobExecuteResponse {
  success: boolean;
  code: number;
  message: string;
  result: {
    jobId: string;
    instanceId: string;
  } | null;
}

export interface JobStatusResponse {
  success: boolean;
  code: number;
  message: string;
  result: unknown;
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
// ENDPOINTS
// ============================================================================

/**
 * v2.2 — Lance un job SQL cote Business Central
 */
export async function executeJob(jobName: string): Promise<JobExecuteResponse> {
  const url = `${API_BASE_URL}/Api/v2.0/Job/job`;

  const response = await fetchWithOAuth(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ job_name: jobName }),
  });

  return handleResponse<JobExecuteResponse>(response);
}

/**
 * v2.2 — Recupere le statut d'execution d'un job SQL
 * Note : un code 308 signifie que le job est toujours en cours (timeout de polling)
 */
export async function getJobStatus(
  jobId: string,
  instanceId: string,
): Promise<JobStatusResponse> {
  const url = `${API_BASE_URL}/Api/v2.0/Job/job/status/${encodeURIComponent(jobId)}/${encodeURIComponent(instanceId)}`;

  const response = await fetchWithOAuth(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  // Le status 308 n'est pas une erreur, c'est un timeout de polling
  if (response.status === 308) {
    const data = (await response.json()) as JobStatusResponse;
    return { ...data, code: 308 };
  }

  return handleResponse<JobStatusResponse>(response);
}

/**
 * Lance un job et attend sa completion en polling le statut
 */
export async function executeJobAndWait(
  jobName: string,
  maxRetries = 10,
  delayMs = 3000,
): Promise<JobStatusResponse> {
  const execResult = await executeJob(jobName);

  if (!execResult.result) {
    throw new Error(execResult.message || 'Echec du lancement du job');
  }

  const { jobId, instanceId } = execResult.result;

  for (let i = 0; i < maxRetries; i++) {
    await new Promise(resolve => setTimeout(resolve, delayMs));

    const status = await getJobStatus(jobId, instanceId);

    if (status.code !== 308) {
      return status;
    }
  }

  throw new Error(`Le job ${jobName} n'a pas termine apres ${maxRetries} tentatives`);
}
