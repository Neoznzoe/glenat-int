import { PublicClientApplication, type Configuration } from '@azure/msal-browser';

const config: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_AZURE_CLIENT_ID ?? '',
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_AZURE_TENANT_ID ?? ''}`,
    redirectUri: window.location.origin,
  },
};

export const msalInstance = new PublicClientApplication(config);
