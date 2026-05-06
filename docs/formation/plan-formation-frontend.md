# Plan de formation frontend — Intranet Glénat

> Document à destination d'un formateur React. Public cible : développeur confirmé (back-end / full-stack non-React) qui reprendra la maintenance et l'évolution de l'intranet Glénat.
>
> Objectif : identifier, module par module, les **concepts React/TypeScript** et les **patterns internes au projet** que le développeur doit maîtriser pour être autonome.

---

## 1. Vue d'ensemble du projet

### 1.1 Nature du produit

- **Intranet Glénat** : portail interne regroupant catalogue produit, offices, annonces, planning, agenda, documentation, annuaire "Qui fait quoi", administration CMS des droits.
- **SPA (Single Page Application)** construite avec **Vite + React 18 + TypeScript**.
- **Deux applications fusionnées** dans un seul bundle :
  - L'app principale (routes classiques via `react-router-dom`)
  - L'app d'administration (routage par **hash** `#/admin/...`, voir `src/AdminApp.tsx`)

### 1.2 Stack technique à maîtriser

| Domaine | Technologie | Fichier clé |
|---|---|---|
| Build / bundler | **Vite 5** | `vite.config.ts` |
| Langage | **TypeScript 5.5** (strict) | `tsconfig.app.json` |
| Framework UI | **React 18** | `src/main.tsx` |
| Routage | **react-router-dom 6** + routage sécurisé custom | `src/routes.tsx`, `src/lib/secureRouting.tsx` |
| État serveur | **@tanstack/react-query 5** | `src/lib/queryClient.ts`, `src/hooks/*` |
| État client | **Redux Toolkit** (limité au panier) | `src/store/` |
| État local partagé | **React Context** (Auth, Permissions, Sidebar) | `src/context/*` |
| Auth SSO | **MSAL (Azure AD)** + Microsoft Graph | `src/lib/msal.ts`, `src/context/AuthContext.tsx` |
| Auth API métier | OAuth2 (client credentials) | `src/lib/oauth.ts` |
| UI components | **shadcn/ui** (basés sur Radix UI) | `src/components/ui/` |
| Styling | **Tailwind CSS 3** + CSS variables | `tailwind.config.js`, `src/index.css` |
| Formulaires | **react-hook-form** + **zod** | `src/components/ui/form.tsx` |
| Toast | **sonner** | `src/components/ui/sonner.tsx` |
| Thème (dark/light) | **next-themes** | `src/components/ThemeProvider.tsx` |
| Icônes | **lucide-react** | utilisé partout |
| Dates | **date-fns** | `src/lib/calendarUtils.ts` |
| Charts | **recharts** | `src/components/ui/chart.tsx` |
| Carrousels | embla-carousel, carrousel custom | `src/components/InfiniteCarousel.tsx` |

### 1.3 Arborescence à connaître par cœur

```
src/
  main.tsx                ← point d'entrée, empile tous les providers
  App.tsx                 ← layout principal, gère routage main vs admin
  AdminApp.tsx            ← sous-application admin (hash routing)
  routes.tsx              ← table des routes + lazy loading + preloaders
  index.css               ← variables CSS (thème), polices, base Tailwind

  components/
    ui/                   ← composants shadcn (button, dialog, form, card…)
    admin/                ← composants spécifiques à l'admin
    routing/              ← SecureLink / ProtectedRoute
    <métier>/             ← annonces, calendar, docs, qui-fait-quoi
    <feature>.tsx         ← composants page (Sidebar, Topbar, BookCard…)

  pages/                  ← une page par route, regroupées par domaine
  layouts/                ← AdminLayout (main layout vit dans App.tsx)
  context/                ← AuthContext, ModulePermissionsContext, SidebarContext
  hooks/                  ← hooks custom (majoritairement React Query)
  store/                  ← Redux (cart uniquement)
  lib/                    ← api clients, utils, sécurité URL, mock server
  data/                   ← données statiques (liens utiles…)
  mocks/                  ← fixtures
  assets/                 ← logos, images
  types/                  ← types partagés
```

### 1.4 Alias d'import

Tout le code utilise `@/...` qui pointe vers `src/...` (configuré dans `vite.config.ts` et `tsconfig.app.json`). Le formateur doit insister dès le début : **aucun import relatif long** (`../../..`), toujours `@/components/...`, `@/hooks/...`, `@/lib/...`.

---

## 2. Pré-requis JavaScript / TypeScript

Avant même de parler React, s'assurer que le stagiaire maîtrise :

- **ES2020+** : destructuring, spread, optional chaining (`?.`), nullish coalescing (`??`), template literals, `async/await`, `Promise.all`.
- **Modules ES** : `import` / `export` nommés et par défaut.
- **TypeScript** :
  - `interface` vs `type`, union types, generics (`Array<T>`, `Record<K,V>`).
  - `as`, `satisfies`, `unknown`, `keyof`, `typeof`.
  - Types utilitaires : `Partial`, `Pick`, `Omit`, `ReturnType`.
  - Type narrowing par `typeof`, `in`, guards personnalisés.
  - Types d'événements DOM (`React.ChangeEvent`, `React.FocusEvent`…).
- **JSX/TSX** : c'est du JavaScript avec un sucre syntaxique pour décrire des arbres d'éléments, pas du HTML.

---

## 3. Les fondamentaux React à enseigner

### 3.1 Le modèle mental

| À déconstruire | À installer |
|---|---|
| "Je manipule le DOM" | Je déclare **ce que le DOM doit être** en fonction de l'état. React fait le diff. |
| "Je relance une fonction quand ça change" | Je **laisse React rappeler mon composant** chaque fois que son état / ses props changent. |
| "Mon composant se souvient de tout" | Un composant est une **fonction pure** appelée plusieurs fois ; ce qui "persiste" est dans `useState` / `useRef` / context / cache. |

### 3.2 Composants fonctionnels

Tout le projet est en composants fonctionnels (zéro classe). Points à couvrir :

- Signature `function Foo({ prop1, prop2 }: FooProps) { return <div>…</div> }`.
- `export default` (lazy routes) vs `export named` (composants UI). Dans `src/routes.tsx`, toutes les pages lazy utilisent `export default`.
- `children: ReactNode` : pattern omniprésent pour les wrappers (`AuthProvider`, `ThemeProvider`, `SecureRoutingProvider`).
- `forwardRef<HTMLButtonElement, ButtonProps>` : voir `src/components/ui/button.tsx` et `src/components/routing/SecureLink.tsx`.

### 3.3 Les hooks, un par un

Enseigner dans l'ordre suivant, avec exercices sur de vrais fichiers du projet :

1. **`useState`** → `src/App.tsx` (toggle sidebar), `src/components/Sidebar.tsx`.
2. **`useEffect`** → `src/App.tsx` ligne 55 (preload des routes), `src/context/AuthContext.tsx` ligne 116 (auth async).
   - Dépendances, cleanup, pièges (effets redondants).
3. **`useMemo`** → `src/pages/Home.tsx` (filtrage des liens), `src/context/AuthContext.tsx` ligne 166.
4. **`useCallback`** → `src/lib/secureRouting.tsx` (fonctions stables pour éviter les re-renders).
5. **`useRef`** → `src/pages/Home.tsx` (mesures DOM), `src/lib/secureRouting.tsx` (requêtes en cours).
6. **`useLayoutEffect`** → `src/pages/Home.tsx` ligne 155 (calculs de taille avant peinture).
7. **`useContext`** → `src/context/SidebarContext.tsx`, `src/context/AuthContext.tsx`.
8. **`useReducer`** (moins utilisé, à mentionner) + `useId` (utilisé dans `form.tsx`).
9. **Hooks custom** : comment et pourquoi — extraire toute logique partagée sous forme `useXxx`. Expliquer les règles des hooks (toujours au top-level, jamais dans un `if`).

### 3.4 Rendering & performance

- **Rendu conditionnel** : `{cond && <Comp />}`, `{cond ? <A /> : <B />}`.
- **Listes & keys** : importance du `key` stable (voir chaque `.map` dans le projet).
- **Lazy loading + Suspense** : `src/routes.tsx` déclare chaque page via `lazy(() => import('...'))` et `App.tsx` les emballe dans `<Suspense fallback={…}>`. C'est **central** : chaque page est un chunk séparé.
- **Preload échelonné** : `App.tsx` lignes 55-71 — technique de préchargement avec `setTimeout` entre chaque import pour ne pas saturer le réseau.
- **StrictMode** : en dev tout effet est exécuté deux fois ; ne pas paniquer, c'est voulu.

### 3.5 Composition & patterns

- **Render props** / **compound components** : voir `<Select>`, `<Dialog>`, `<Popover>` de shadcn.
- **`children` as slot** + **`asChild`** (Radix Slot) : `Button` avec `asChild` pour rendre un `<a>` stylé. Voir `src/components/ui/button.tsx` ligne 45.
- **HOC forwardRef** + ClassName composition via `cn()` (voir 4.3).

---

## 4. Patterns spécifiques au projet

### 4.1 Deux applications dans un bundle

- `src/App.tsx` détecte la route (`location.pathname.startsWith('/admin')` **ou** `window.location.hash.startsWith('#/admin')`) et bascule vers `<AdminApp />` (`src/AdminApp.tsx`).
- L'admin utilise du **hash routing maison** : un `useEffect` écoute `hashchange` et utilise un dictionnaire `ADMIN_ROUTES` (lookup O(1)) pour afficher le bon composant lazy.
- À connaître : un lien vers `/admin/users` ou `#/admin/users` doit fonctionner dans les deux cas.

### 4.2 Empilement des providers (`src/main.tsx`)

Ordre **non négociable** (de l'extérieur vers l'intérieur) :

```
StrictMode
└─ MsalProvider          ← Azure AD doit être initialisé en premier
   └─ AuthProvider       ← construit le profil utilisateur
      └─ Provider Redux  ← store panier
         └─ QueryClientProvider  ← cache serveur
            └─ ThemeProvider     ← next-themes (class dark/light)
               └─ BrowserRouter  ← react-router-dom
                  └─ App
```

Le `bootstrap()` asynchrone (`await msalInstance.initialize()` + `await startMockServer()`) précède le rendu : expliquer pourquoi on ne peut pas rendre tant que MSAL n'est pas prêt.

### 4.3 Styling : Tailwind + CSS variables + `cn()`

- Toutes les couleurs thématiques sont déclarées en **variables CSS** (`--primary`, `--background`, `--card`…) dans `src/index.css` sous `:root` et `.dark`.
- `tailwind.config.js` expose ces variables comme classes Tailwind (`bg-primary`, `text-foreground`…). → **un dev qui ajoute une couleur doit l'ajouter dans `index.css` et la brancher dans `tailwind.config.js`**.
- `cn()` (`src/lib/utils.ts`) combine `clsx` + `tailwind-merge` pour fusionner intelligemment les classes (la dernière gagne en cas de conflit Tailwind).
- **CVA (class-variance-authority)** : définit des variantes typées pour un composant. Voir `src/components/ui/button.tsx` ligne 7 : `cva(base, { variants: { variant, size } })`. À enseigner : c'est la manière officielle d'avoir des "variants" comme Bootstrap sans `styled-components`.

### 4.4 Thème sombre

- Piloté par **`next-themes`** (`ThemeProvider` avec `attribute="class"`).
- Bascule par un toggle (`src/components/ThemeToggle.tsx`).
- Le mode sombre est actif quand `<html>` a la classe `dark` ; Tailwind utilise `darkMode: ['class']`.

### 4.5 shadcn/ui + Radix

- Les composants dans `src/components/ui/` **ne sont pas une librairie installée**, ce sont des sources copiées/adaptées (méthode shadcn). Le stagiaire peut les éditer.
- Chaque composant complexe (`Dialog`, `DropdownMenu`, `Popover`, `Tooltip`, `Select`, `Toast`…) enveloppe un package Radix UI (`@radix-ui/react-*`) qui gère l'accessibilité (focus trap, ARIA, clavier).
- À enseigner : comment lire la doc Radix pour trouver la bonne API.

### 4.6 Formulaires : react-hook-form + zod

- Pattern standard : schéma zod → `useForm({ resolver: zodResolver(schema) })` → `<Form>` (= `FormProvider`) → `<FormField>` (wrapper `Controller`) → `<FormItem>` / `<FormLabel>` / `<FormControl>` / `<FormMessage>`.
- Voir `src/components/ui/form.tsx` pour la tuyauterie de base et `src/components/admin/UserDialog.tsx` / `GroupDialog.tsx` pour des exemples complets.
- Points à appuyer : validation déclarative, gestion des erreurs, uncontrolled components par défaut.

### 4.7 Toasts

- `<Toaster />` placé dans `App.tsx` (shadcn wrapper sur sonner).
- Appel : `import { toast } from 'sonner'` puis `toast.success('Ajouté', { description: '…' })`.
- Exemple : `src/components/BookCard.tsx` ligne 32.

---

## 5. Routage

### 5.1 React Router 6 — l'essentiel

- `<BrowserRouter>` dans `main.tsx`, `<Routes>`/`<Route>` dans `secureRouting.tsx`.
- **Lazy routes** : chaque page est `lazy(() => import(...))`. Un `<Suspense>` global affiche un spinner pendant le chargement du chunk.
- Navigation :
  - Déclarative : `<Link to="...">`, `<NavLink>`.
  - Programmatique : `useNavigate()`.
- Lecture de l'URL : `useLocation()`, `useParams()`, `URLSearchParams` via `location.search`.
- Redirection : `<Navigate to="/..." replace />` (voir `src/routes.tsx` ligne 34).

### 5.2 Le routage sécurisé custom

Spécificité majeure du projet — **à expliquer soigneusement** : `src/lib/secureRouting.tsx` + `src/lib/urlEncryption.ts`.

Pipeline :

1. Quand l'utilisateur arrive sur `/catalogue/book?ean=123`, un `useEffect` appelle `ensureToken(path, search)`.
2. `encryptUrlPayload({ path, search, method })` produit un token chiffré.
3. Le token est formaté (slashes tous les 11 caractères) et la navigation est redirigée vers `/ci/{token}`.
4. La route `/ci/*` (définie dans `SecureRoutes`) déchiffre le token (`decryptUrlToken`), retrouve la définition de route correspondante et rend l'élément.

**Implications concrètes pour le dev** :
- On **n'utilise jamais** `<Link>` directement sur une route interne, mais **`<SecureLink>`** / **`<SecureNavLink>`** (`src/components/routing/SecureLink.tsx`).
- Les URLs dans le navigateur ne reflètent pas le path "humain" → conséquence sur les logs, le support, le debug. Un flag d'env (`isUrlEncryptionConfigured`) permet de désactiver.

### 5.3 Garde-fou d'accès : `RouteGuard`

- Wrap autour de `<AppRoutes />` dans `App.tsx`.
- Vérifie `canAccessRoute(pathname)` via `useModulePermissionsContext()` avant de rendre l'enfant ; sinon `<Navigate to="/acces-refuse" />` avec un state riche (module, page, type de restriction).
- Le loader de permissions affiche un spinner global tant qu'il tourne. Le formateur doit montrer la séquence : Auth chargé → permissions chargées → route rendue.

---

## 6. Gestion d'état

C'est la partie la plus subtile pour un dev non-React : **il n'y a pas UN état global, il y en a quatre**.

### 6.1 État local du composant — `useState`

Pour tout ce qui est purement UI : ouvert/fermé, valeur de champ, hover, étape d'un wizard… (ex : `src/App.tsx` `isSidebarExpanded`).

### 6.2 État partagé proche — Context API

Trois contexts dans le projet :

| Context | Rôle | Fichier |
|---|---|---|
| `AuthContext` | user MSAL + internalUser + login/logout | `src/context/AuthContext.tsx` |
| `ModulePermissionsContext` | matrice des droits (modules/pages/blocs/éléments) | `src/context/ModulePermissionsContext.tsx` |
| `SidebarContext` | état d'expansion de la sidebar (readonly côté consumer) | `src/context/SidebarContext.tsx` |

Insister sur le pattern **`useXxx()` qui jette si hors provider** (`AuthContext.tsx` ligne 188). C'est la seule façon sûre de typer un context `T | undefined`.

### 6.3 État serveur — React Query

**C'est le cœur du projet**. Presque toutes les données (users, modules, CMS, annonces, planning, présence, catalogue) passent par React Query.

Configuration globale (`src/lib/queryClient.ts`) :

```
staleTime: 5 min       ← données fraîches 5 min, pas de refetch
gcTime: 10 min         ← conservation 10 min après unmount
retry: 1               ← 1 seule retry
refetchOnWindowFocus: true
refetchOnMount: false
```

Ce que le stagiaire **doit** apprendre :

1. **`useQuery({ queryKey, queryFn })`** — ex : `src/hooks/useAdminData.ts`.
   - Clés **hiérarchiques et stables** : `['admin','users']`, `['user','rights', userId]`.
   - Option `enabled: !!userId` pour retarder une requête.
   - Option `select` pour projeter les données (voir `useSidebarModules`).
2. **`useMutation({ mutationFn, onSuccess })`** — ex : `useUpdateUserAccess`. Pattern :
   - Mutation → `onSuccess` → `queryClient.invalidateQueries({ queryKey })` ou `setQueryData` pour mise à jour optimiste.
3. **`useQueryClient()`** pour interagir avec le cache depuis un composant.
4. **Invalidation vs refetch vs setQueryData** : enseigner les trois stratégies.
5. **Fingerprint anti re-render** (avancé) : `useSidebarModules` (`src/hooks/useModules.ts`) compare un hash (`createModuleFingerprint`) avant de retourner de nouvelles données, pour éviter les re-renders inutiles quand les définitions sont identiques.
6. **Mocks** : certains hooks ont un flag `USE_MOCK` local (ex : `src/hooks/useAnnonces.ts`). Expliquer le rôle transitoire de ces mocks et où vit le "vrai" fetch (`src/lib/*Api.ts`).

### 6.4 État client global — Redux Toolkit

**Uniquement pour le panier** (`src/store/cartSlice.ts`). Concepts :

- `createSlice({ name, initialState, reducers })` — reducers en Immer-style, on "mute" sans danger.
- `PayloadAction<T>` pour typer le payload.
- Typage du store : `RootState`, `AppDispatch`.
- Hooks typés : `useAppDispatch`, `useAppSelector` (`src/hooks/redux.ts`) → **toujours utiliser ces deux-là**, jamais les hooks natifs de `react-redux`.
- Usage : `src/components/BookCard.tsx` (dispatch), `src/components/CartSummary.tsx` (selector).

> Pédagogiquement : expliquer pourquoi on garde Redux pour le panier et pas React Query. Réponse : le panier est 100 % client, non persisté côté API dans l'état actuel.

---

## 7. Authentification & sécurité

### 7.1 MSAL (Azure AD)

- `src/lib/msal.ts` : `PublicClientApplication` configuré via `VITE_AZURE_CLIENT_ID` / `VITE_AZURE_TENANT_ID`.
- Scopes par défaut : `User.Read`.
- Cache : `localStorage`.
- `main.tsx` : `await msalInstance.initialize()` **avant** le rendu.

### 7.2 AuthProvider

- `src/context/AuthContext.tsx` :
  - Appelle `handleRedirectPromise()` au montage.
  - `acquireTokenSilent` puis fetch **parallèle** `graph.microsoft.com/v1.0/me` + `/me/photo/$value` (technique `Promise.all`).
  - Convertit la photo (blob) en data URL via `FileReader` + `readAsDataURL`.
  - Enrichit le profil par un lookup interne (`lookupInternalUserByEmail`) pour lier l'identité Azure à l'ID métier (nécessaire pour les permissions).
  - `login()` → `loginRedirect`, `logout()` → `logoutRedirect`.
- Le login pass par `src/pages/Login.tsx` quand `user` est `null`.

### 7.3 Permissions (CMS)

- Modèle hiérarchique : **Module → Page → Bloc → Élément**.
- `ModulePermissionsContext` expose : `canAccessRoute`, `canAccessModule`, `canAccessPage`, `canAccessBloc(code)`, `canAccessElement(code)`, + helpers de mapping route→module/page.
- Usage dans les pages : voir `src/pages/Home.tsx` — chaque bloc UI est encadré par `canAccessBloc('HOME_…')`. Le dev qui ajoute un nouveau bloc doit :
  1. Déclarer le code CMS.
  2. Ajouter la condition dans le JSX.
  3. Configurer les droits via l'interface d'administration.

### 7.4 OAuth2 pour l'API métier

`src/lib/oauth.ts` gère un token OAuth2 (client credentials) pour `api-dev.groupe-glenat.com` :

- Cache mémoire + persistance **chiffrée** dans `localStorage` (`encryptForStorage`/`decryptFromStorage`).
- `pendingTokenRequest` pour dédupliquer les requêtes concurrentes.
- Refresh automatique (avec `REFRESH_LEEWAY_SECONDS`).
- Fonction d'or : `fetchWithOAuth(url, init)` → surcharge le `Authorization` et renvoie une `Response` fetch standard.

### 7.5 Mock server (dev)

- `src/lib/mockServer.ts` intercepte certaines routes `/api/admin/*` via une stratégie `fetch` override / MSW-like selon le cas.
- Permet de développer sans back-end complet.
- À désactiver ou à brancher selon l'environnement (voir `src/lib/mockDb.ts`).

---

## 8. Chargement & performance

### 8.1 Code splitting

- **Toutes** les pages non critiques sont `lazy`. `src/routes.tsx` → 20+ chunks séparés.
- `Home` est **non lazy** (page critique, importée en dur).
- `LAZY_ROUTE_PRELOADERS` : tableau de preloaders appelés en échelon dans `App.tsx` pour pré-télécharger les chunks en arrière-plan (150 ms entre chaque). Équilibre entre TTI et bande passante.

### 8.2 Memoization & stabilité

- `useMemo` sur tout tableau dérivé consommé par React Query ou passé en prop à des enfants memoizés (voir `src/pages/Home.tsx`).
- `useCallback` pour tout handler passé en prop (`src/lib/secureRouting.tsx`).
- **Fingerprint** pour éviter les re-renders lorsque les données reçues du serveur sont identiques sémantiquement (`moduleFingerprint.ts`).
- Commentaires `// [PERF] xxx` partout dans le code — c'est une convention projet. Le dev doit comprendre chaque étiquette (`async-parallel`, `bundle-preload`, `rerender-memo`, `rerender-functional-setstate`, `client-swr-dedup`).

### 8.3 Lazy cover loading

- `src/hooks/useLazyCoverLoading.ts` + `src/components/InfiniteCarousel.tsx` + `useInfiniteCarouselIndex.ts` → enseigner le pattern de chargement progressif des couvertures (IntersectionObserver, batching).

### 8.4 Scroll restoration

- `src/hooks/useScrollRestoration.ts` : restaure la position de scroll entre navigations.

---

## 9. Points durs & pièges connus

À montrer au stagiaire **avec le code sous les yeux** :

1. **StrictMode double-exécute les effets** en dev → prévoir cleanup/`isActive` (voir `src/pages/Home.tsx` ligne 67 `let isActive = true`).
2. **Closures obsolètes** : dépendances manquantes dans `useEffect`/`useCallback` → bugs silencieux. ESLint `react-hooks/exhaustive-deps` est activé.
3. **`useState` avec initialiseur** : passer une fonction pour un calcul coûteux — `useState(() => …)`.
4. **Navigation lazy + Suspense** : tout composant hors lazy qui lance un import dynamique doit être sous un `<Suspense>`.
5. **URLs chiffrées** : jamais construire d'URL interne "à la main" — toujours `SecureLink` ou `useEncryptedPath(to)`.
6. **MSAL `initialize()` asynchrone** : rendu bloqué pendant le bootstrap — ne pas contourner.
7. **Permissions** : toujours guarder côté UI **et** côté route (`RouteGuard` + `canAccessBloc`). Un dev qui oublie le guard côté route ouvre un trou.
8. **Redux Toolkit Immer** : on peut écrire `state.items.push(...)` dans un reducer — mais **uniquement** dans un `createSlice`.
9. **Hash routing admin** : ne jamais mélanger `useNavigate()` et `window.location.hash = '#/admin/...'`. Utiliser ce qui correspond à la sous-app.

---

## 10. Outillage & workflow

- **Scripts npm** (`package.json`) :
  - `npm run dev` → Vite dev server (HMR).
  - `npm run build` → `tsc -b` puis `vite build` (output à la racine, `assetsDir: 'public/assets'`).
  - `npm run lint` → ESLint 9 flat config (`eslint.config.js`), avec `react-hooks` et `react-refresh`.
  - `npm run preview` → preview du build.
- **Proxy dev** (`vite.config.ts`) : `/intranet` → `api-recette.groupe-glenat.com/Api/v1.0/Intranet`. À expliquer : toutes les requêtes locales `/intranet/...` sont redirigées par Vite en dev ; en prod, le reverse proxy du serveur assure la même chose.
- **TypeScript strict** : pas de `any` toléré, le lint remonte tout.
- **CI** : `azure-pipelines.yml` + `Dockerfile` (mentionné pour contexte ; à approfondir si la mission inclut le déploiement).

---

## 11. Ordre recommandé de la formation (suggestion)

### Jour 1 — Socle
1. JavaScript moderne & TypeScript (1/2 journée si nécessaire).
2. Mental model React + JSX + composants fonctionnels.
3. `useState` / `useEffect` (exos sur un `Home.tsx` simplifié).

### Jour 2 — Hooks & composition
1. `useMemo`, `useCallback`, `useRef`, `useContext`.
2. Hooks custom → lire `useExpandableList`, en écrire un.
3. Rendu conditionnel, listes, keys.
4. Lazy/Suspense — modifier `routes.tsx`.

### Jour 3 — Styling & UI
1. Tailwind : classes, variantes responsive, `dark:`, arbitraires.
2. `cn()`, `cva`, pattern shadcn.
3. Radix : accessibilité par défaut, compound components.
4. Exercice : créer un nouveau composant UI réutilisable.

### Jour 4 — Données
1. React Query : `useQuery`, `useMutation`, invalidation, clés.
2. Lire `useAdminData.ts` en entier, refaire un hook sur une autre ressource.
3. Redux Toolkit : slice cart, sélecteurs typés.
4. Context API : créer `useAuth`, expliquer le pattern "throw if no provider".

### Jour 5 — Routage & sécurité
1. React Router 6 : routes, params, navigation.
2. `SecureRouting` : lire `secureRouting.tsx`, comprendre le cycle encrypt/decrypt.
3. MSAL : flow login, `AuthProvider`, Graph API.
4. Permissions : `RouteGuard`, `canAccessBloc`, ajouter un nouveau bloc protégé.

### Jour 6 — Mise en pratique complète
1. Ajouter une nouvelle page : route, lazy, permissions, hook React Query, composant UI.
2. Revue des patterns PERF du projet.
3. Debugging : React DevTools, React Query DevTools, Network.

---

## 12. Ressources à recommander au stagiaire

- **React** — docs officielles (react.dev), en particulier *Learn > Describing the UI* et *Managing State*.
- **TypeScript** — *TypeScript Handbook* + *TypeScript + React Cheatsheet* (github.com/typescript-cheatsheets/react).
- **React Query** — *tanstack.com/query*, section *Overview* puis *Guides*.
- **React Router 6** — *reactrouter.com/en/main/start/tutorial*.
- **Radix UI** — *radix-ui.com/primitives*.
- **Tailwind** — *tailwindcss.com/docs* + lecture du `tailwind.config.js` du projet.
- **shadcn/ui** — *ui.shadcn.com* (chaque composant = une page avec la source).
- **MSAL** — *learn.microsoft.com/en-us/entra/identity-platform/msal-overview*.

---

## 13. Grille d'évaluation finale

Le stagiaire est autonome quand il peut, **sans aide**, réaliser :

- [ ] Ajouter une route lazy protégée par permission, avec une page affichant une donnée chargée via React Query et une mutation optimiste.
- [ ] Créer un hook custom réutilisable documenté en TypeScript strict.
- [ ] Créer un composant UI avec `cva` (au moins 2 variants × 2 tailles), accessible (via Radix si nécessaire).
- [ ] Intégrer un formulaire react-hook-form + zod avec messages d'erreur.
- [ ] Ajouter un nouveau bloc de l'interface, le mettre derrière `canAccessBloc('…')`, l'alimenter via React Query.
- [ ] Expliquer la traversée d'une requête : clic `SecureLink` → URL `/ci/…` → déchiffrement → `RouteGuard` → `Suspense` → lazy chunk → page → `useQuery` → render.
- [ ] Diagnostiquer un bug : re-render excessif, closure obsolète, cache désynchronisé, URL qui ne se chiffre pas.

---

*Ce plan doit être adapté au profil précis du stagiaire : si solide en TS/JS, compresser le jour 1 ; si faible en HTTP/auth, étendre les jours 4-5. L'ordre peut être modifié tant que la chaîne "composant → état → data → routage → permissions" est respectée.*
