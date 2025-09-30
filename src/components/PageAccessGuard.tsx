import { Card, CardContent } from '@/components/ui/card';
import { usePagePermission } from '@/hooks/usePageAccess';
import { type ReactNode } from 'react';

interface PageAccessGuardProps {
  pageKey: string;
  children: ReactNode;
  loadingFallback?: ReactNode;
  unauthorizedFallback?: ReactNode;
}

function DefaultUnauthorizedFallback() {
  return (
    <div className="flex min-h-[calc(100dvh-4rem)] w-full items-center justify-center p-6">
      <Card className="max-w-lg w-full">
        <CardContent className="space-y-4 p-8 text-center">
          <h1 className="text-2xl font-semibold">Accès restreint</h1>
          <p className="text-muted-foreground">
            Vous n&apos;avez pas les droits nécessaires pour consulter cette page.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export function PageAccessGuard({
  pageKey,
  children,
  loadingFallback,
  unauthorizedFallback,
}: PageAccessGuardProps) {
  const { allowed, loading, fetching, error } = usePagePermission(pageKey);

  if (loading || fetching) {
    return <>{loadingFallback ?? null}</>;
  }

  if (error) {
    return unauthorizedFallback ?? <DefaultUnauthorizedFallback />;
  }

  if (!allowed) {
    return unauthorizedFallback ?? <DefaultUnauthorizedFallback />;
  }

  return <>{children}</>;
}
