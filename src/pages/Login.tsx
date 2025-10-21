import { LogIn } from 'lucide-react';
import Logo from '@/assets/logos/glenat/glenat_white.svg';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuth } from '@/context/AuthContext';

export default function Login() {
  const { login, error } = useAuth();

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-background via-muted to-background px-4 py-10">
      <div className="w-full max-w-lg">
        <Card className="border-0 shadow-2xl">
          <CardHeader className="space-y-4 text-center">
            <div className="flex justify-center">
              <img src={Logo} alt="Logo Glénat" className="h-12 w-auto" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl font-semibold">
                Bienvenue sur le portail Glénat
              </CardTitle>
              <CardDescription className="text-base">
                Connectez-vous avec votre compte Microsoft pour accéder aux services
                internes.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Pour continuer, veuillez lancer la connexion. Vous serez redirigé vers
              la page Microsoft dans un nouvel écran.
            </p>
            {error ? (
              <Alert variant="destructive" className="text-left">
                <AlertTitle>Échec de la connexion</AlertTitle>
                <AlertDescription>
                  {error}
                </AlertDescription>
              </Alert>
            ) : null}
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button size="lg" className="w-full" onClick={login}>
              <LogIn className="mr-2 h-5 w-5" />
              Se connecter
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Besoin d&apos;aide ? Contactez le support informatique Glénat.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
