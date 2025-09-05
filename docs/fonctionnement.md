# Fonctionnement détaillé de l'application

Ce document décrit pas à pas le fonctionnement de l'application **glenat-int**. Il peut servir de support pour expliquer l'architecture à un public non spécialiste.

## 1. Concepts clés de React

- **Bibliothèque déclarative** : React décrit l'interface sous forme de composants qui produisent du JSX. Ce JSX est transformé en DOM par React qui ne met à jour que les éléments nécessaires grâce au *Virtual DOM*.
- **Composants fonctionnels** : chaque composant est une fonction JavaScript qui retourne du JSX. Les composants peuvent recevoir des **props** (paramètres) et possèdent un état interne via les *hooks*.
- **`useState`** : permet de mémoriser une valeur locale. Exemple : `const [page, setPage] = useState('home');`. Appeler `setPage` entraîne un nouveau rendu du composant.
- **`useEffect`** : exécute du code en réaction à un changement d'état ou de props (appel API, mise à jour du titre, etc.).
- **Flux de données** : les données circulent du parent vers l'enfant via les props. Pour remonter une action (clic, formulaire…), l'enfant invoque une fonction passée en props.

## 2. Point d'entrée

- **Fichier : `src/main.tsx`**
- Le navigateur charge `index.html` qui appelle `main.tsx`.
- `createRoot` monte l'application sur l'élément HTML `#root`.
- L'application est enveloppée par plusieurs *providers* :
  - `StrictMode` active des vérifications supplémentaires en développement.
  - `MsalProvider` initialise l'authentification Azure AD (MSAL).
  - `Provider` de Redux expose le *store* global.
  - `QueryClientProvider` configure React Query pour la gestion des requêtes réseau et le cache.
  - `ThemeProvider` gère le thème clair/sombre.

## 3. Composition de l'interface

- **Fichier : `src/App.tsx`**
- Un `useState` garde en mémoire la page courante (`activePage`).
- Le rendu conditionnel affiche la page correspondante (`Home`, `Emploi`, `Catalogue`, etc.).
- `Sidebar` et `Topbar` sont toujours présents. Ils reçoivent des callbacks (`onNavigate`) permettant de modifier `activePage` ; un clic sur un lien met donc à jour l'état et provoque un nouveau rendu.
- Cette logique remplace un système de routage classique (ex. `react-router`) et constitue un *routing* interne simplifié basé sur l'état.

## 4. Pages et composants

- Dossier `src/components/` : éléments réutilisables tels que `Sidebar`, `Topbar`, cartes d'actualités ou de livres. Chaque composant gère son propre état local si nécessaire et reçoit des props pour être configuré.
- Dossier `src/pages/` : chaque fichier représente une vue complète (ex. `Home.tsx`, `Emploi.tsx`). Les sous-dossiers `catalogue` et `services` regroupent des pages spécialisées.
- Les pages peuvent utiliser des *hooks* (`useEffect`, `useState`, hooks personnalisés) pour récupérer des données ou réagir aux interactions.

## 5. Gestion de l'état global

- Dossier `src/store/` : configuration Redux Toolkit.
  - `cartSlice.ts` définit l'état du panier et les actions `addItem`, `updateQuantity`, `removeItem`.
  - `index.ts` assemble le *store* et exporte les types `RootState` et `AppDispatch`.
- Les composants obtiennent les données globales via `useAppSelector` et déclenchent des actions avec `useAppDispatch`.
- Le hook personnalisé `use-toast.ts` implémente un système de notifications toast avec file d'attente et fermeture automatique.

## 6. Requêtes réseau et effets

- React Query (`@tanstack/react-query`) gère la mise en cache des données et la synchronisation avec le serveur.
- Les effets secondaires (appel API, abonnement) sont généralement placés dans `useEffect` ou délégués à React Query.

## 7. Authentification

- `src/lib/msal.ts` configure `PublicClientApplication` avec les identifiants Azure provenant des variables d'environnement.

## 8. Style et thème

- TailwindCSS fournit les classes utilitaires pour la mise en forme.
- `ThemeProvider` et `ThemeToggle` permettent de basculer entre les thèmes clair et sombre.

## 9. Résumé de l'exécution

1. Le navigateur charge `index.html` qui fait appel à `main.tsx`.
2. `main.tsx` initialise les *providers* puis rend `App` dans `#root`.
3. `App` affiche `Sidebar`, `Topbar` et la page correspondant à `activePage`.
4. Un clic sur la `Sidebar` appelle `onNavigate`, met à jour `activePage` via `setActivePage` puis déclenche un nouveau rendu.
5. Les pages peuvent déclencher des actions Redux (ajout au panier) ou des requêtes via React Query.
6. Les effets (`useEffect`, notifications toast) mettent à jour l'interface lorsque les données changent.

Ce texte peut être adapté pour une présentation ou une formation afin d'expliquer clairement chaque couche de l'application.