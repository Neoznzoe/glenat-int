import {
  ensureDatabaseSeeded,
  listUsers,
  listGroups,
  listPermissions,
  listAuditLog,
  getCurrentUser,
  updateUserAccess,
  type PermissionOverride,
  type UserAccount,
  type AuditLogEntry,
  type UpdateUserAccessPayload,
} from './mockDb';
import { type GroupDefinition, type PermissionDefinition } from './access-control';
import { decryptUrlToken, isUrlEncryptionConfigured } from './urlEncryption';

interface UpdateUserAccessRequestBody {
  groups?: string[];
  permissionOverrides?: PermissionOverride[];
  actorId?: string;
}

function jsonResponse<T>(data: T, init?: ResponseInit): Response {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  });
}

function errorResponse(message: string, status = 400): Response {
  return jsonResponse({ message }, { status });
}

let mockServerStarted = false;

async function handleAdminRequest(request: Request): Promise<Response | undefined> {
  const url = new URL(request.url, window.location.origin);
  const { pathname } = url;
  const method = request.method.toUpperCase();

  try {
    if (pathname === '/api/admin/users' && method === 'GET') {
      const users = await listUsers();
      return jsonResponse<UserAccount[]>(users);
    }

    if (pathname === '/api/admin/groups' && method === 'GET') {
      const groups = await listGroups();
      return jsonResponse<GroupDefinition[]>(groups);
    }

    if (pathname === '/api/admin/permissions' && method === 'GET') {
      const permissions = await listPermissions();
      return jsonResponse<PermissionDefinition[]>(permissions);
    }

    if (pathname === '/api/admin/current-user' && method === 'GET') {
      const user = await getCurrentUser();
      return jsonResponse<UserAccount>(user);
    }

    if (pathname === '/api/admin/audit-log' && method === 'GET') {
      const limitParam = url.searchParams.get('limit');
      const limit = limitParam ? Number.parseInt(limitParam, 10) : 25;
      const entries = await listAuditLog(Number.isFinite(limit) ? limit : 25);
      return jsonResponse<AuditLogEntry[]>(entries);
    }

    const match = pathname.match(/^\/api\/admin\/users\/(.+?)\/access$/);
    if (match && method === 'PATCH') {
      const userId = decodeURIComponent(match[1]);
      const bodyText = await request.text();
      const body: UpdateUserAccessRequestBody = bodyText ? JSON.parse(bodyText) : {};

      const payload: UpdateUserAccessPayload = {
        userId,
        groups: body.groups ?? [],
        permissionOverrides: body.permissionOverrides ?? [],
        actorId: body.actorId,
      };

      const updated = await updateUserAccess(payload);
      return jsonResponse<UserAccount>(updated);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Une erreur est survenue';
    return errorResponse(message, 500);
  }

  return undefined;
}

export async function startMockServer(): Promise<void> {
  ensureDatabaseSeeded();

  if (typeof window === 'undefined' || mockServerStarted) {
    return;
  }

  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const request = input instanceof Request ? input : new Request(input, init);
    const url = new URL(request.url, window.location.origin);

    if (url.pathname.startsWith('/secure/') && isUrlEncryptionConfigured()) {
      const token = url.pathname.replace('/secure/', '');
      try {
        const payload = await decryptUrlToken(token);
        const method = request.method.toUpperCase();

        if (payload.method && payload.method !== method) {
          return errorResponse('Méthode HTTP inattendue pour ce jeton.', 405);
        }

        const targetUrl = new URL(
          `${payload.path}${payload.search ?? ''}`,
          window.location.origin,
        );

        const bodyText =
          method === 'GET' || method === 'HEAD' ? undefined : await request.clone().text();

        const headers = new Headers();
        request.headers.forEach((value, key) => {
          headers.append(key, value);
        });

        const proxiedRequest = new Request(targetUrl.toString(), {
          method,
          headers,
          body: bodyText,
        });

        const handled = await handleAdminRequest(proxiedRequest);
        if (handled) {
          return handled;
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Jeton chiffré invalide';
        return errorResponse(message, 400);
      }
    }

    if (url.pathname.startsWith('/api/admin/')) {
      const handled = await handleAdminRequest(request.clone());
      if (handled) {
        return handled;
      }
    }

    return originalFetch(input as RequestInfo, init);
  };

  mockServerStarted = true;
}
