import type {
  AccountInfo,
  AuthenticationResult,
  IPublicClientApplication,
} from '@azure/msal-browser';

import { graphScopes, isMsalConfigured } from './msal';

type GraphUserResponse = {
  id?: string;
  displayName?: string;
  givenName?: string;
  surname?: string;
  userPrincipalName?: string;
  mail?: string | null;
  jobTitle?: string | null;
};

export type GraphProfile = {
  id: string;
  displayName: string;
  givenName: string;
  surname: string;
  userPrincipalName: string;
  mail?: string;
  jobTitle?: string;
  photo?: string;
};

const GRAPH_ME_ENDPOINT =
  'https://graph.microsoft.com/v1.0/me?$select=id,displayName,givenName,surname,userPrincipalName,mail,jobTitle';
const GRAPH_PHOTO_ENDPOINT = 'https://graph.microsoft.com/v1.0/me/photo/$value';

const toBase64 = (buffer: ArrayBuffer) => {
  if (typeof window === 'undefined' || typeof window.btoa !== 'function') {
    return '';
  }

  let binary = '';
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;

  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }

  return window.btoa(binary);
};

const requestGraphToken = async (
  instance: IPublicClientApplication,
  account: AccountInfo,
): Promise<AuthenticationResult> => {
  return instance.acquireTokenSilent({
    account,
    scopes: [...graphScopes],
  });
};

const fetchProfileCore = async (
  accessToken: string,
): Promise<GraphProfile> => {
  const profileResponse = await fetch(GRAPH_ME_ENDPOINT, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!profileResponse.ok) {
    throw new Error(
      `Failed to load Microsoft 365 profile (status ${profileResponse.status})`,
    );
  }

  const rawProfile = (await profileResponse.json()) as GraphUserResponse;

  const profile: GraphProfile = {
    id: rawProfile.id ?? '',
    displayName: rawProfile.displayName ?? '',
    givenName: rawProfile.givenName ?? '',
    surname: rawProfile.surname ?? '',
    userPrincipalName: rawProfile.userPrincipalName ?? '',
    mail: rawProfile.mail ?? undefined,
    jobTitle: rawProfile.jobTitle ?? undefined,
  };

  const photoResponse = await fetch(GRAPH_PHOTO_ENDPOINT, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (photoResponse.ok) {
    const contentType = photoResponse.headers.get('content-type') ?? 'image/jpeg';
    const arrayBuffer = await photoResponse.arrayBuffer();
    const base64 = toBase64(arrayBuffer);

    if (base64) {
      profile.photo = `data:${contentType};base64,${base64}`;
    }
  } else if (photoResponse.status !== 404) {
    console.warn(
      'Unable to load Microsoft 365 profile photo',
      photoResponse.status,
      photoResponse.statusText,
    );
  }

  return profile;
};

export const fetchGraphProfile = async (
  instance: IPublicClientApplication,
  account: AccountInfo,
): Promise<GraphProfile> => {
  if (!isMsalConfigured) {
    throw new Error('Microsoft 365 authentication is not configured.');
  }

  const tokenResult = await requestGraphToken(instance, account);

  return fetchProfileCore(tokenResult.accessToken);
};
