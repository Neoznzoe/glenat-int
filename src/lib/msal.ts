import { PublicClientApplication, type Configuration } from '@azure/msal-browser';

const clientId =
  import.meta.env.VITE_MSAL_CLIENT_ID ?? import.meta.env.VITE_AZURE_CLIENT_ID;
const tenantId =
  import.meta.env.VITE_MSAL_TENANT_ID ?? import.meta.env.VITE_AZURE_TENANT_ID;

if (!clientId || !tenantId) {
  throw new Error(
    'Missing Azure AD configuration. Ensure VITE_MSAL_CLIENT_ID and VITE_MSAL_TENANT_ID are set.',
  );
}

const config: Configuration = {
  auth: {
    clientId,
    authority: `https://login.microsoftonline.com/${tenantId}`,
    redirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: true,
  },
};

export const msalInstance = new PublicClientApplication(config);
