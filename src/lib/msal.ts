import { PublicClientApplication, type Configuration, type RedirectRequest } from '@azure/msal-browser';

const clientId = import.meta.env.VITE_AZURE_CLIENT_ID ?? '2e14c153-a2a5-483d-9e72-c539e10ac7c9';
const tenantId = import.meta.env.VITE_AZURE_TENANT_ID ?? 'c3250c51-0028-4f12-984a-9fd7d9cc4179';

const config: Configuration = {
  auth: {
    clientId,
    authority: `https://login.microsoftonline.com/${tenantId}`,
    redirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false,
  },
};

export const loginRequest: RedirectRequest = {
  scopes: ['User.Read'],
};

export const msalInstance = new PublicClientApplication(config);
