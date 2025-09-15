import {
  PublicClientApplication,
  type Configuration,
  type RedirectRequest,
} from '@azure/msal-browser';

const config: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_AZURE_CLIENT_ID ?? '',
    authority: `https://login.microsoftonline.com/${
      import.meta.env.VITE_AZURE_TENANT_ID ?? ''
    }`,
    redirectUri: window.location.origin,
    postLogoutRedirectUri: window.location.origin,
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
