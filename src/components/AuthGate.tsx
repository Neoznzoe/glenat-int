import { type ReactNode, useEffect, useState } from 'react';
import { InteractionStatus } from '@azure/msal-browser';
import { useMsal } from '@azure/msal-react';

import {
  isMsalConfigured,
  loginRequest,
  msalInitialization,
} from '@/lib/msal';

type AuthGateProps = {
  children: ReactNode;
};

export function AuthGate({ children }: AuthGateProps) {
  const { instance, inProgress } = useMsal();
  const [isInitialized, setIsInitialized] = useState(!isMsalConfigured);
  const [initializationFailed, setInitializationFailed] = useState(false);

  useEffect(() => {
    if (!isMsalConfigured) {
      return;
    }

    let isMounted = true;

    const initialize = async () => {
      try {
        await msalInitialization;
      } catch {
        if (isMounted) {
          setInitializationFailed(true);
          setIsInitialized(true);
        }

        return;
      }

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
        console.error('MSAL redirect handling failed', error);
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
    if (!isMsalConfigured || !isInitialized || initializationFailed) return;

    const activeAccount = instance.getActiveAccount();

    if (!activeAccount && inProgress === InteractionStatus.None) {
      void instance.loginRedirect(loginRequest);
    }
  }, [inProgress, instance, initializationFailed, isInitialized]);

  if (!isMsalConfigured) {
    return <>{children}</>;
  }

  if (initializationFailed) {
    return null;
  }

  if (!isInitialized || !instance.getActiveAccount()) {
    return null;
  }

  return <>{children}</>;
}
