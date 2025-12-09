import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

interface PlaceholderPageProps {
  title: string;
  description: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export function PlaceholderPage({ title, description, icon: Icon }: PlaceholderPageProps) {
  return (
    <div className="p-6 space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight flex items-center gap-3">
          {Icon && <Icon className="h-8 w-8" />}
          {title}
        </h1>
        <p className="text-muted-foreground">{description}</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-muted-foreground" />
            Page en cours de développement
          </CardTitle>
          <CardDescription>
            Cette section sera bientôt disponible.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Les fonctionnalités pour {title.toLowerCase()} sont actuellement en cours de développement.
            Revenez bientôt pour accéder à cette section.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default PlaceholderPage;
