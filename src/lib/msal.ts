import {
  PublicClientApplication,
  type Configuration,
  type RedirectRequest,
} from '@azure/msal-browser';

type AzureEnvKey =
  | 'VITE_AZURE_CLIENT_ID'
  | 'VITE_AZURE_TENANT_ID'
  | 'VITE_AZURE_AUTHORITY'
  | 'VITE_AZURE_REDIRECT_URI'
  | 'VITE_AZURE_POST_LOGOUT_REDIRECT_URI';

const sanitizeEnvValue = (value?: string) => {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : undefined;
};

const readEnv = (key: AzureEnvKey) =>
  sanitizeEnvValue(import.meta.env[key] as string | undefined);

const requireEnv = (key: AzureEnvKey) => {
  const value = readEnv(key);

  if (!value) {
    throw new Error(
      `Missing required environment variable "${key}" for Azure AD authentication.`,
    );
  }

  return value;
};

const clientId = requireEnv('VITE_AZURE_CLIENT_ID');
const tenantId = readEnv('VITE_AZURE_TENANT_ID');
const authorityFromEnv = readEnv('VITE_AZURE_AUTHORITY');

const authority =
  authorityFromEnv ??
  (tenantId
    ? `https://login.microsoftonline.com/${tenantId}`
    : 'https://login.microsoftonline.com/organizations');

const currentOrigin =
  typeof window === 'undefined' ? '/' : window.location.origin;

const redirectUri = readEnv('VITE_AZURE_REDIRECT_URI') ?? currentOrigin;
const postLogoutRedirectUri =
  readEnv('VITE_AZURE_POST_LOGOUT_REDIRECT_URI') ?? redirectUri;

export const msalConfig: Configuration = {
  auth: {
    clientId,
    authority,
    redirectUri,
    postLogoutRedirectUri,
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false,
  },
};

export const loginRequest: RedirectRequest = {
  scopes: ['User.Read'],
};

export const msalInstance = new PublicClientApplication(msalConfig);

export const msalInitialization = msalInstance.initialize().catch((error) => {
  console.error('MSAL initialization failed', error);
  throw error;
});
