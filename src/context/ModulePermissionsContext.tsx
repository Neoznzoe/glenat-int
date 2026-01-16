import { createContext, useContext, type ReactNode } from 'react';
import { useModulePermissions, type ModulePermissionsResult } from '@/hooks/useModulePermissions';
import { useAuth } from '@/context/AuthContext';

const ModulePermissionsContext = createContext<ModulePermissionsResult | null>(null);

interface ModulePermissionsProviderProps {
  children: ReactNode;
}

/**
 * Provider that wraps the app and provides module permissions context
 * Uses the current authenticated user's email to fetch their view matrix
 */
export function ModulePermissionsProvider({ children }: ModulePermissionsProviderProps) {
  const { user } = useAuth();
  const userEmail = user?.mail || user?.userPrincipalName;

  const permissions = useModulePermissions(userEmail);

  return (
    <ModulePermissionsContext.Provider value={permissions}>
      {children}
    </ModulePermissionsContext.Provider>
  );
}

/**
 * Hook to access module permissions from context
 */
export function useModulePermissionsContext(): ModulePermissionsResult {
  const context = useContext(ModulePermissionsContext);

  if (!context) {
    throw new Error(
      'useModulePermissionsContext must be used within a ModulePermissionsProvider'
    );
  }

  return context;
}
