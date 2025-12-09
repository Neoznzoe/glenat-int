import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function AdminDashboard() {
  return (
    <div className="p-6 space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Administration Glénat</h1>
        <p className="text-muted-foreground">
          Tableau de bord principal pour la gestion de votre plateforme
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Administration des Sections</CardDescription>
            <CardTitle className="text-lg">Gestion des contenus</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>Vous pouvez facilement administrer les différentes sections des sites grâce à ces cartes.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Administration des utilisateurs</CardDescription>
            <CardTitle className="text-lg">Gestion des accès</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>Vous pouvez facilement administrer les utilisateurs, les groupes et les droits des sites grâce à ces cartes.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Administration de PHPulse</CardDescription>
            <CardTitle className="text-lg">Fonctionnalités avancées</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>Vous pouvez facilement administrer les différentes fonctionnalités de PHPulse.</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Accès rapides</CardTitle>
            <CardDescription>
              Les sections les plus fréquemment utilisées
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <a href="/admin/users" className="block p-3 rounded-lg hover:bg-muted transition-colors">
              <div className="font-medium">Gestion des Utilisateurs</div>
              <div className="text-sm text-muted-foreground">Gérez les utilisateurs et leurs droits.</div>
            </a>
            <a href="/admin/modules" className="block p-3 rounded-lg hover:bg-muted transition-colors">
              <div className="font-medium">Gestion des Modules</div>
              <div className="text-sm text-muted-foreground">Gérez les modules et leurs configurations.</div>
            </a>
            <a href="/admin/pages" className="block p-3 rounded-lg hover:bg-muted transition-colors">
              <div className="font-medium">Gestion des Pages</div>
              <div className="text-sm text-muted-foreground">Gérez les pages et leur contenu.</div>
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informations système</CardTitle>
            <CardDescription>
              État actuel de la plateforme
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Version</span>
              <span className="text-sm font-medium">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Statut</span>
              <span className="text-sm font-medium text-green-600">Opérationnel</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Environnement</span>
              <span className="text-sm font-medium">Production</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AdminDashboard;
