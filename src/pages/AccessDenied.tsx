import { useLocation, useNavigate } from 'react-router-dom';
import { ShieldX, ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AccessDeniedState {
  from?: string;
  moduleName?: string;
  moduleCode?: string;
}

/**
 * Page displayed when a user tries to access a route they don't have permission for
 */
export function AccessDenied() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = (location.state as AccessDeniedState) || {};

  const { moduleName = 'cette page' } = state;

  return (
    <div className="flex min-h-[calc(100dvh-4rem)] flex-col items-center justify-center px-4">
      <div className="flex flex-col items-center text-center max-w-md">
        <div className="rounded-full bg-destructive/10 p-4 mb-6">
          <ShieldX className="h-12 w-12 text-destructive" />
        </div>

        <h1 className="text-2xl font-semibold mb-2">Acces refuse</h1>

        <p className="text-muted-foreground mb-6">
          Vous n'avez pas les droits necessaires pour acceder a {moduleName}.
        </p>

        <p className="text-sm text-muted-foreground mb-8">
          Si vous pensez que c'est une erreur, veuillez contacter votre administrateur
          pour obtenir les autorisations necessaires.
        </p>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>

          <Button
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            Accueil
          </Button>
        </div>
      </div>
    </div>
  );
}

export default AccessDenied;
