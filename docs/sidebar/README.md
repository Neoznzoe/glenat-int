# Sidebar dynamique

Cette implémentation fournit une sidebar 100 % front calculée à partir des modules actifs et des permissions utilisateur.

## Endpoints requis

Les appels réseau utilisent trois endpoints REST existants :

| Endpoint | Description | Fichier client |
| --- | --- | --- |
| `GET /api/modules` | Liste des modules disponibles. | `src/api/client.ts` → `getModules()` |
| `GET /api/me/permissions` | Permissions du profil connecté. | `src/api/client.ts` → `getUserPermissions()` |
| `GET /api/me` | Informations sur l'utilisateur courant. | `src/api/client.ts` → `getCurrentUser()` |

Si les endpoints ne sont pas disponibles en local, servez les fichiers JSON du dossier `src/mocks/` via un simple mock (ex. `json-server` ou middleware Vite).

## Activation deny-list / allow-list

Le comportement par défaut repose sur une **deny-list** : un module actif est visible sauf s'il existe une permission explicite avec `canView=false`.

Pour basculer en mode **allow-list**, ouvrez `src/config.ts` et changez la valeur :

```ts
export const SIDEBAR_OPTIONS = {
  denyList: false,
} as const;
```

## Variante React Query

Le hook `useVisibleModules()` choisit automatiquement la stratégie de chargement selon `USE_REACT_QUERY` dans `src/config.ts`.

```ts
export const USE_REACT_QUERY = true; // active @tanstack/react-query
```

Lorsque ce flag est actif, installez un `QueryClientProvider` à la racine de l'application :

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const client = new QueryClient();

root.render(
  <QueryClientProvider client={client}>
    <App />
  </QueryClientProvider>
);
```

## Intégration composant

```tsx
import { Sidebar } from "@/components/Sidebar";

export function Layout() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1">{/* contenu */}</main>
    </div>
  );
}
```

Le composant gère automatiquement :

- skeleton de chargement
- gestion d'erreur discrète
- découpe en sections (principal / administration)
- icônes `lucide-react` avec fallback initiale
- affichage des modules actifs côté client

> ⚠️ **Rappel** : la visibilité front ne constitue pas un contrôle de sécurité. L'API doit continuer à vérifier les permissions serveur.
