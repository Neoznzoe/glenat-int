# main.tsx

Point d'entrée de l'application. Ce fichier :

- crée un `QueryClient` pour React Query.
- monte l'arbre React sur `#root` via `createRoot`.
- enveloppe `<App />` dans plusieurs providers :
  - `Provider` Redux pour l'état global,
  - `QueryClientProvider` pour les requêtes,
  - `ThemeProvider` pour le thème,
  - `BrowserRouter` pour la navigation,
  - `StrictMode` qui active des vérifications en développement.

Un provider MSAL est présent mais commenté.
