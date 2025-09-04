import { createContext, useContext } from 'react';

export const SidebarContext = createContext(false);

export function useSidebar() {
  return useContext(SidebarContext);
}
