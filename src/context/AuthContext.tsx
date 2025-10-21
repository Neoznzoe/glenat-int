import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  EventType,
  InteractionRequiredAuthError,
  type AccountInfo,
  type AuthenticationResult,
  type IPublicClientApplication,
} from '@azure/msal-browser';
import { useMsal } from '@azure/msal-react';
import { loginRequest } from '@/lib/msal';
import {
  lookupInternalUserByEmail,
  type DatabaseUserLookupResponse,
} from '@/lib/internalUserLookup';

interface UserProfile {
  id: string;
  displayName: string;
  givenName?: string;
  surname?: string;
  mail?: string;
  jobTitle?: string;
  officeLocation?: string;
  userPrincipalName?: string;
  photoUrl?: string;
  internalUser?: DatabaseUserLookupResponse | null;
}

interface AuthContextValue {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const convertBlobToDataUrl = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Impossible de convertir la photo de profil.'));
      }
    };
    reader.onerror = () => {
      reject(reader.error ?? new Error('Erreur lors de la lecture de la photo de profil.'));
    };
    reader.readAsDataURL(blob);
  });

async function fetchUserProfile(instance: IPublicClientApplication, account: AccountInfo) {
  const response = await instance.acquireTokenSilent({
    ...loginRequest,
    account,
  });

  const headers = {
    Authorization: `Bearer ${response.accessToken}`,
    'Content-Type': 'application/json',
  };

  const profileResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
    headers,
  });

  if (!profileResponse.ok) {
    throw new Error('Impossible de récupérer le profil utilisateur.');
  }

  const profile = (await profileResponse.json()) as UserProfile;
  let photoUrl: string | undefined;

  try {
    const photoResponse = await fetch('https://graph.microsoft.com/v1.0/me/photo/$value', {
      headers,
    });

    if (photoResponse.ok) {
      const blob = await photoResponse.blob();
      photoUrl = await convertBlobToDataUrl(blob);
    }
  } catch (photoError) {
    console.warn('Photo de profil indisponible :', photoError);
  }

  return {
    ...profile,
    photoUrl,
  } satisfies UserProfile;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { instance } = useMsal();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const isAuthenticationResult = (
      payload: unknown,
    ): payload is AuthenticationResult =>
      typeof payload === 'object' && payload !== null && 'account' in payload;

    const callbackId = instance.addEventCallback((event) => {
      if (event.eventType === EventType.LOGIN_SUCCESS && isAuthenticationResult(event.payload)) {
        instance.setActiveAccount(event.payload.account);
      }

      if (event.eventType === EventType.HANDLE_REDIRECT_END) {
        setLoading(false);
      }
    });

    return () => {
      if (callbackId) {
        instance.removeEventCallback(callbackId);
      }
    };
  }, [instance]);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true);
        await instance.handleRedirectPromise();
        let activeAccount = instance.getActiveAccount();

        if (!activeAccount) {
          const accounts = instance.getAllAccounts();
          if (accounts.length > 0) {
            activeAccount = accounts[0]!;
            instance.setActiveAccount(activeAccount);
          }
        }

        if (!activeAccount) {
          await instance.loginRedirect(loginRequest);
          return;
        }

        const profile = await fetchUserProfile(instance, activeAccount);
        let internalUser: DatabaseUserLookupResponse | null = null;
        const email = profile.mail ?? profile.userPrincipalName;

        if (email) {
          try {
            internalUser = await lookupInternalUserByEmail(email);
          } catch (syncError) {
            console.error(
              "Impossible de synchroniser l'utilisateur interne :",
              syncError,
            );
          }
        }

        setUser({ ...profile, internalUser });
        setError(null);
      } catch (authError) {
        if (authError instanceof InteractionRequiredAuthError) {
          await instance.loginRedirect(loginRequest);
          return;
        }
        console.error('Erreur MSAL :', authError);
        setError("Une erreur est survenue lors de l'authentification.");
      } finally {
        setLoading(false);
      }
    };

    void initializeAuth();
  }, [instance]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      error,
      login: async () => {
        await instance.loginRedirect(loginRequest);
      },
      logout: async () => {
        await instance.logoutRedirect({
          postLogoutRedirectUri: window.location.origin,
        });
      },
    }),
    [error, instance, loading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé à l’intérieur de AuthProvider.');
  }
  return context;
}
