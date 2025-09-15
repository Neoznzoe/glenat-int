import { type ReactNode, useEffect, useState } from 'react';
import { InteractionStatus } from '@azure/msal-browser';
import { useMsal } from '@azure/msal-react';

import { loginRequest } from '@/lib/msal';

type AuthGateProps = {
  children: ReactNode;
};

export function AuthGate({ children }: AuthGateProps) {
  const { instance, inProgress } = useMsal();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      try {
        const response = await instance.handleRedirectPromise();

        if (response?.account) {
          instance.setActiveAccount(response.account);
          return;
        }

        const accounts = instance.getAllAccounts();

        if (accounts.length > 0) {
          instance.setActiveAccount(accounts[0]);
        }
      } catch (error) {
        console.error('MSAL initialization error', error);
      } finally {
        if (isMounted) {
          setIsInitialized(true);
        }
      }
    };

    void initialize();

    return () => {
      isMounted = false;
    };
  }, [instance]);

  useEffect(() => {
    if (!isInitialized) return;

    const activeAccount = instance.getActiveAccount();

    if (!activeAccount && inProgress === InteractionStatus.None) {
      void instance.loginRedirect(loginRequest);
    }
  }, [inProgress, instance, isInitialized]);

  if (!isInitialized || !instance.getActiveAccount()) {
    return null;
  }

  return <>{children}</>;
}
