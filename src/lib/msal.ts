import { PublicClientApplication, type Configuration } from '@azure/msal-browser';

const clientId =
  import.meta.env.VITE_MSAL_CLIENT_ID ?? import.meta.env.VITE_AZURE_CLIENT_ID;
const tenantId =
  import.meta.env.VITE_MSAL_TENANT_ID ?? import.meta.env.VITE_AZURE_TENANT_ID;

export const hasMsalConfig = Boolean(clientId && tenantId);

if (!hasMsalConfig) {
  console.warn(
    'MSAL: missing VITE_MSAL_CLIENT_ID or VITE_MSAL_TENANT_ID – authentication disabled.',
  );
}

const config: Configuration = {
  auth: {
    clientId: clientId || '00000000-0000-0000-0000-000000000000',
    authority: `https://login.microsoftonline.com/${tenantId || 'common'}`,
    redirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: true,
  },
};

export const msalInstance = new PublicClientApplication(config);
