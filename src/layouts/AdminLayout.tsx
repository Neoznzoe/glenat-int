import { useState, Suspense, type ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { AdminSidebar } from '@/components/AdminSidebar';
import { Topbar } from '@/components/Topbar';
import { SidebarContext } from '@/context/SidebarContext';

interface AdminLayoutProps {
  children?: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  return (
    <SidebarContext.Provider value={isSidebarExpanded}>
      <div className="flex h-screen bg-background text-foreground overflow-hidden">
        <AdminSidebar onExpandChange={setIsSidebarExpanded} />
        <div className="flex-1 flex flex-col">
          <Topbar />
          <main className="flex-1 overflow-auto">
            <Suspense
              fallback={
                <div className="flex min-h-[calc(100dvh-4rem)] w-full items-center justify-center">
                  <span
                    aria-hidden="true"
                    className="inline-flex h-12 w-12 animate-spin rounded-full border-4 border-[var(--primary)] border-t-transparent"
                  />
                  <span className="sr-only">Chargement…</span>
                </div>
              }
            >
              {children || <Outlet />}
            </Suspense>
          </main>
        </div>
      </div>
    </SidebarContext.Provider>
  );
}
