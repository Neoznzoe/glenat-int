# Passation projet — Intranet Glénat

> Document rédigé pour la passation à ma remplaçante, développeuse reprenant le projet.
> Objectif : donner en un seul document la vue d'ensemble (pourquoi ce projet existe, à qui il sert)
> **et** le niveau de détail nécessaire pour être opérationnelle rapidement (architecture, sécurité,
> déploiement, chantiers en cours).
>
> Ce document est le point d'entrée. Pour l'apprentissage React/TypeScript approfondi
> (hooks, patterns du projet, exercices), voir **[`docs/formation/plan-formation-frontend.md`](formation/plan-formation-frontend.md)**
> qui est complémentaire et beaucoup plus détaillé sur le "comment coder dans ce repo".

---

## Sommaire

1. [Vue d'ensemble](#1-vue-densemble)
2. [Panorama fonctionnel des modules](#2-panorama-fonctionnel-des-modules)
3. [Architecture technique frontend](#3-architecture-technique-frontend)
4. [Backend & intégrations externes](#4-backend--intégrations-externes)
5. [Authentification, permissions & sécurité](#5-authentification-permissions--sécurité)
6. [Déploiement & infrastructure](#6-déploiement--infrastructure)
7. [État du projet à la date de passation](#7-état-du-projet-à-la-date-de-passation)
8. [Documentation existante — index](#8-documentation-existante--index)
9. [Checklist de passation](#9-checklist-de-passation)
10. [Recommandations pour les premières semaines](#10-recommandations-pour-les-premières-semaines)

---

## 1. Vue d'ensemble

### 1.1 Qu'est-ce que ce projet ?

**glenat-int** est l'**intranet des Éditions Glénat** : un portail web interne utilisé par les
collaborateurs (édition, production, diffusion, RH, support) pour :

- consulter le **catalogue** des ouvrages (nouveautés, offices, kiosque numérique, stocks) ;
- suivre la **vie de l'entreprise** (absences, télétravail, agenda, annonces internes, offres d'emploi) ;
- accéder à l'**annuaire** ("Qui fait quoi"), à la **documentation interne** (Glénat'Doc) et aux
  **services support** (Informatique, Production) ;
- pour les administrateurs, **gérer les droits d'accès** (utilisateurs, groupes, modules/pages/blocs/éléments).

C'est le "Refresh 2024" de l'ancien intranet : reconstruction complète en SPA moderne (React/Vite/TypeScript),
qui vient progressivement remplacer un existant PHP plus ancien côté API (voir §4).

### 1.2 Qui l'utilise et comment

- Authentification via le **compte Microsoft/Azure AD** de chaque collaborateur (SSO, pas de mot de
  passe applicatif).
- Ce que chaque utilisateur voit (menu, pages, blocs, boutons) dépend d'une **matrice de droits**
  gérée depuis le module Administration (voir §5.3).
- Trois environnements vivent en parallèle : **développement**, **recette** et **production**, chacun
  avec sa propre API backend (voir §6.3).

### 1.3 Deux applications dans un seul bundle

Le repo contient en réalité **deux applications React livrées dans le même build** :

- l'**app principale** (routes classiques `react-router-dom`, ex. `/catalogue`, `/planning`) ;
- la **sous-app Administration**, routée en **hash routing maison** (`#/admin/users`, `#/admin/groups`…),
  isolée dans `src/AdminApp.tsx` + `src/layouts/AdminLayout.tsx`.

`src/App.tsx` détecte si l'URL commence par `/admin` (path ou hash) et bascule l'affichage entre les
deux. C'est une spécificité du projet à bien comprendre avant d'y toucher — un lien admin doit
fonctionner sous les deux formes.

---

## 2. Panorama fonctionnel des modules

| Module (menu) | Route(s) principales | Rôle | Source de données |
|---|---|---|---|
| **Accueil** | `/` | Vue synthétique du jour : carrousel de couvertures, actualités internes, calendrier, listes de présence (absents/télétravail/visites/déplacements), liens utiles/SharePoint. | Mix API (présence, calendrier) + données statiques (`src/data/homeData.ts`, `src/data/saints.ts` pour la fête du jour) |
| **Qui fait quoi** | `/qui-fait-quoi`, `/qui-fait-quoi/groupes`, `/company`, `/departement`, `/employe` | Annuaire interne : sociétés du groupe, départements, fiches employés, groupes/organigrammes. | `src/lib/placesApi.ts` (`usePlaces.ts`) |
| **Catalogue** | `/catalogue`, `/catalogue/all`, `/kiosque`, `/offices`, `/nouveautes`, `/espace-titre`, `/couverture-a-paraitre`, `/telecharger`, `/top-commandes`, `/plus-de-stock`, `/auteurs(/:id)`, `/book` | Cœur métier édition : parcourir les éditions/collections, toutes les nouveautés, prochaines offices, kiosque numérique, fiches livres détaillées (Business Central), fiches auteurs, export de listes, gestion du panier de commande. | Business Central (fiche produit, stock — voir §4.2), Extranet v1.0 (couvertures/photos auteurs) |
| **Emploi** | `/emploi` | Offres d'emploi internes (mobilité). Badge de comptage dans la sidebar. | `src/lib/jobOffers.ts` / `jobsApi.ts` |
| **Annonces** | `/annonces` | Petites annonces internes, dépôt d'annonce par un collaborateur. Badge de comptage dans la sidebar. | `src/lib/annoncesApi.ts` |
| **Agenda** | `/agenda` (redirection depuis `/calendrier`, `/calendar`) | Calendrier des événements d'entreprise (jours fériés, institutionnel, autres). | `src/lib/calendar.ts` |
| **Planning** | `/planning` | Planning des absences/congés par équipe, avec motifs de congé, filtres, recherche. **Module en cours de refonte au moment de la passation** (voir §7.1). | `src/lib/planningApi.ts` (`usePlanning.ts`) |
| **Glénat'Doc** | `/glenat-doc`, `/glenat-doc/categorie`, `/glenat-doc/documents` | Documentation interne classée par catégories (procédures, guides). | `src/lib/docsApi.ts` |
| **Services — Informatique** | `/services` | Support IT : demandes d'intervention, liens vers outils/ressources par catégorie. | Données statiques + compteur d'interventions |
| **Services — Production** | `/services/production` | Idem, orienté ateliers de production (Achats, Atelier, Mac, Knowbox, Maestro…). | Données statiques |
| **Administration** | `/admin/*` (hash routing) | CMS de gestion des droits : utilisateurs, groupes métier, modules/pages/blocs/éléments, projets, journal d'audit. Voir §5.3. | `src/lib/adminApi.ts`, `pagesApi.ts`, `modulesApi.ts`, `zonesApi.ts`, `projectsApi.ts` |

**Modules déclarés côté admin mais pas encore développés côté fonctionnel** (affichent une page
"placeholder" — voir `src/AdminApp.tsx`) : PHPulse, Qui fait quoi (admin dédié), Glénat'ée, plans de
parking, gestion des temps, agenda (admin), emplois (admin), alertes, crédit livre, désabonnement
newsletter, écran de service. **Ce sont des routes prévues pour de futures évolutions, pas des bugs.**

---

## 3. Architecture technique frontend

### 3.1 Stack

React 18 + TypeScript (strict) + Vite 5 + TailwindCSS 3 + shadcn/ui (Radix UI) + Redux Toolkit
(panier uniquement) + TanStack React Query 5 (quasi toute la donnée serveur) + react-router-dom 6 +
MSAL (Azure AD) + react-hook-form/zod + sonner (toasts) + next-themes (dark mode) + recharts +
embla-carousel.

Détail complet dans `docs/formation/plan-formation-frontend.md` §1.2 — je ne duplique pas ici.

### 3.2 Arborescence

```
src/
  main.tsx        point d'entrée, empile les providers (MSAL → Auth → Redux → React Query → Theme → Router)
  App.tsx         layout principal, bascule main app / admin app, providers de routing sécurisé
  AdminApp.tsx    sous-app admin (hash routing #/admin/...)
  routes.tsx      table des routes de l'app principale (lazy + préchargement échelonné)
  api/            (dossiers vides/legacy — la vraie logique API est dans lib/*Api.ts)
  components/     composants réutilisables (ui/ = shadcn, admin/, calendar/, docs/, qui-fait-quoi/, annonces/)
  pages/          une page par route, regroupées par domaine (catalogue/, services/, docs/, qui-fait-quoi/, administration/)
  context/        AuthContext, ModulePermissionsContext, SidebarContext
  hooks/          hooks custom, majoritairement des wrappers React Query
  lib/            clients API (*Api.ts), sécurité (URL/payload), utils, mock server
  store/          Redux Toolkit (panier uniquement)
  data/           données statiques (liens utiles, calendrier des prénoms, mock calendrier)
  layouts/        AdminLayout (le layout de l'app principale vit directement dans App.tsx)
  routes/         (vestige — voir routes.tsx à la racine, source de vérité)
```

Alias `@/...` → `src/...` partout (voir `vite.config.ts` / `tsconfig.app.json`). Ne jamais faire
d'import relatif long (`../../..`).

### 3.3 Les 4 façons de gérer l'état

1. **`useState` local** — UI pure (ouvert/fermé, champ de formulaire...).
2. **React Context** — `AuthContext` (utilisateur MSAL + profil interne), `ModulePermissionsContext`
   (matrice de droits), `SidebarContext` (état d'expansion sidebar).
3. **React Query** — le cœur du projet : quasiment toute donnée qui vient d'une API (users, CMS,
   catalogue, planning, présence, annonces...). Config globale dans `src/lib/queryClient.ts`
   (`staleTime` 5 min, `gcTime` 10 min, `retry` 1).
4. **Redux Toolkit** — **uniquement le panier** (`src/store/cartSlice.ts`). Volontairement pas utilisé
   ailleurs : le panier est 100 % client, non persisté côté API à ce stade.

### 3.4 Routage

- `react-router-dom` classique pour l'app principale, mais **jamais directement exposé à l'écran** :
  toute navigation interne passe par un système de **chiffrement d'URL** (voir §5.4).
- Lazy loading systématique (`lazy(() => import(...))`) sauf `Home` (page critique, chargée en dur).
- `App.tsx` précharge en tâche de fond tous les chunks lazy avec un délai échelonné de 150 ms
  (`LAZY_ROUTE_PRELOADERS`) pour ne pas saturer le réseau au démarrage.
- `RouteGuard` (`src/components/RouteGuard.tsx`) encadre `<AppRoutes />` et bloque le rendu d'une page
  si l'utilisateur n'a pas la permission (`canAccessRoute`), avec redirection vers `/acces-refuse`.

### 3.5 Conventions notables

- Commentaires `// [PERF] ...` : convention du projet pour signaler une optimisation volontaire
  (`async-parallel`, `bundle-preload`, `rerender-memo`, `client-swr-dedup`...). Utile pour comprendre
  pourquoi un bout de code a l'air "compliqué".
- shadcn/ui : les composants dans `src/components/ui/` ne sont **pas une lib installée**, ce sont des
  sources copiées/adaptées — on peut et doit les éditer directement.
- `USE_MOCK` : plusieurs hooks (`usePlanning.ts`, `useAnnonces.ts`...) ont un flag local qui bascule
  entre données mockées et vrai fetch API. C'est transitoire, à retirer au fur et à mesure que le
  backend correspondant est stabilisé — bien vérifier son état avant de "corriger un bug" dessus.

---

## 4. Backend & intégrations externes

### 4.1 Le vrai backend n'est pas dans ce repo

**Important pour la passation** : le dossier `backend/Intranet.Api/` présent dans ce repo (structure
.NET : Controllers/, Entities/, Services/, Migrations/...) est **vide et non suivi par Git**
(`git ls-files backend` ne retourne rien). C'est un scaffold abandonné/exploratoire — **ce n'est pas
le backend réel**. Ne pas perdre de temps dessus, il peut être supprimé si confirmé inutile.

Le vrai backend est une **API PHP** hébergée séparément (`api-dev` / `api-recette` /
`api.groupe-glenat.com`), dans un **autre dépôt** (à récupérer auprès de l'IT/DevOps — je n'ai pas
la main dessus dans ce repo). Ce que j'ai laissé dans `docs/api-migration/v2.0/` et
`docs/api-migration/v2.2/` est une **copie de référence des contrôleurs/handlers PHP** (côté
lecture seule) récupérée pour documenter les endpoints pendant la migration v2.0 → v2.2 — pratique
pour chercher "quel contrôleur répond à quel endpoint" sans avoir accès au repo backend.

Contrôleurs backend identifiés (v2.2) : `AnnoncesController`, `AuditController`, `AuthController`,
`BusinessCentralController`, `CalendarController`, `CatalogueController`, `CmsController`,
`CustomersController`, `DevController` (legacy SQL passthrough), `DocsController`,
`DocusignController`, `ImaginoController`, `JobController`, `JobOffersController`,
`JournalistsController`, `KelioController`, `MangaController`, `OAuthController`,
`PlacesController`, `PlanningController`, `PresenceController`, `ProjectController`,
`SharepointController`, `TicketController`, `UserController`.

`storage/*.sql` (racine du repo) contient des scripts d'initialisation de la base ("PHPulse") —
utiles pour comprendre le schéma, pas pour l'exécution côté front.

### 4.2 Intégrations tierces utilisées par le frontend

| Intégration | Usage | Fichier(s) frontend |
|---|---|---|
| **Azure AD / MSAL** | SSO, identité utilisateur | `src/lib/msal.ts`, `src/context/AuthContext.tsx` |
| **Microsoft Graph** | Profil (`/me`) + photo (`/me/photo/$value`) après login MSAL | `AuthContext.tsx` |
| **OAuth2 (client credentials)** | Jeton pour appeler l'API métier PHP | `src/lib/oauth.ts` |
| **Business Central** | Fiche produit catalogue (infos, résumé, auteurs, papier, stock) — voir [[bc-item-profiles]] : `/items/{ean}/byProfile/IntranetCatalogCard?include=clusters` | `src/lib/catalogue.ts` |
| **Kelio** | Absences, télétravail | `src/lib/absencesApi.ts` |
| **DocuSign** | Signature électronique de contrats | `src/lib/docusignApi.ts` |
| **Imagino** | Gestion de contacts/newsletters | `src/lib/imaginoApi.ts` |
| **SharePoint** | Fichiers/dossiers liés à la doc interne | référencé côté backend (`SharepointController`) |

### 4.3 Résolution automatique de l'environnement API

`src/lib/apiConfig.ts` est la **source de vérité unique** pour l'URL de base de l'API : elle est
déduite du **hostname du front** (pas de variable d'env à synchroniser manuellement en prod) :

- hostname contient `-recette` → `https://api-recette.groupe-glenat.com`
- hostname contient `-dev` → `https://api-dev.groupe-glenat.com`
- tout autre hostname réel → `https://api.groupe-glenat.com` (production)
- en local (`localhost`) → override possible via `VITE_API_BASE_URL`, sinon API de dev par défaut

**Ne jamais réintroduire un fallback `api-dev` codé en dur ailleurs dans le code** — c'était un
finding de l'audit sécurité (§8, voir `docs/audit-securite-frontend-etat.md`), déjà corrigé.

### 4.4 Migration API v2.0 → v2.2 (dette technique en cours de résorption)

Voir `docs/api-migration/MIGRATION-v2.0-to-v2.2.md` pour le détail complet. Résumé : le backend
avait un contrôleur générique `Dev/callDatabase` qui exécutait du **SQL brut envoyé depuis le
front** (`adminApi.ts` faisait ~3000 lignes de SQL construit côté client). Ce pattern a été
**éliminé côté admin/CMS/utilisateurs** au profit de vrais endpoints REST (`UserController`,
`CmsController`, `ProjectController`...).

**Reste sur `Dev/callDatabase`** au moment de la passation : `catalogue.ts`, `calendar.ts`,
`jobOffers.ts`. Ce n'est pas urgent de tout migrer d'un coup, mais **ne pas ajouter de nouvelles
requêtes SQL brutes** dans ces fichiers — préférer étendre l'API PHP avec un vrai endpoint quand
c'est possible, sur le modèle de ce qui a été fait pour l'admin.

---

## 5. Authentification, permissions & sécurité

### 5.1 MSAL (identité)

- `src/lib/msal.ts` configure `PublicClientApplication` (`VITE_AZURE_CLIENT_ID` / `VITE_AZURE_TENANT_ID`).
- `main.tsx` attend `await msalInstance.initialize()` **avant** de monter React — ne pas contourner.
- `AuthContext` gère `handleRedirectPromise()`, `acquireTokenSilent`, puis va chercher en parallèle
  le profil et la photo Microsoft Graph, et fait un **lookup interne** (`lookupInternalUserByEmail`)
  pour relier l'identité Azure AD à l'utilisateur métier (nécessaire pour les permissions).

### 5.2 OAuth2 (accès à l'API métier)

- `src/lib/oauth.ts` : flow `client_credentials`/`authorization_code` selon config, token en mémoire
  + persistance JSON dans `localStorage`, refresh automatique, déduplication des requêtes concurrentes
  (`pendingTokenRequest`).
- Fonction centrale : `fetchWithOAuth(url, init)` — tout appel à l'API métier passe par là pour
  injecter l'en-tête `Authorization: Bearer`.
- Variables d'environnement : voir `.env.example` (`VITE_OAUTH_CLIENT_ID/SECRET`, endpoints...).
  Seuls client ID + secret sont indispensables.

### 5.3 Permissions CMS (qui voit quoi)

Modèle hiérarchique : **Module → Page → Bloc → Élément**.

- `ModulePermissionsContext` (`useModulePermissions(userEmail)`) expose `canAccessRoute`,
  `canAccessModule`, `canAccessPage`, `canAccessBloc(code)`, `canAccessElement(code)`.
- Chaque bloc UI sensible est encadré dans le JSX par une vérification `canAccessBloc('CODE')`
  (voir `src/pages/Home.tsx` pour des exemples).
- Gérable depuis **Administration** : `Groups.tsx` (groupes métier + permissions par défaut, voir
  `src/lib/access-control.ts` pour la liste des `PERMISSION_DEFINITIONS` et `GROUP_DEFINITIONS`),
  `Modules.tsx` / `Pages.tsx` / `Blocks.tsx` / `Elements.tsx` (arborescence CMS), `Administration.tsx`
  (utilisateurs, page principale avec `UserListPanel` + `UserAccessEditor` + journal d'audit).
- **Règle à ne jamais oublier** : une permission doit être vérifiée **côté UI ET côté route**
  (`RouteGuard`). Oublier le guard de route ouvre un accès direct par URL même si le bouton est caché.
- Cartographie détaillée de chaque élément d'interface pilotable par les droits :
  `docs/cartographie-elements.md` + `docs/cartographie-elements.json` (⚠️ légèrement daté sur le
  routage global, cf. §8, mais très fiable sur le détail composant par composant).

### 5.4 Chiffrement des URLs (spécificité forte du projet)

Toute navigation interne est passée dans une enveloppe chiffrée AES-256-GCM
(`src/lib/urlEncryption.ts` + `src/lib/secureRouting.tsx`) : `/catalogue/nouveautes` devient
`/ci/{token}` à l'écran, et le routeur déchiffre le token pour retrouver la route réelle.

**Conséquence pratique** : ne jamais utiliser `<Link>` de react-router directement sur une route
interne — toujours **`<SecureLink>` / `<SecureNavLink>`** (`src/components/routing/SecureLink.tsx`).
Un flag d'environnement permet de désactiver ce mécanisme si besoin (`isUrlEncryptionConfigured`).

### 5.5 Chiffrement hybride des payloads API

Les requêtes POST vers les proxys internes peuvent être encapsulées en AES-256-GCM avec clé
protégée par RSA-OAEP (`src/lib/securePayload.ts`), pilotable par `VITE_SECURE_API_MODE`
(`disabled` / `optional` / `required`). Détail complet dans le `README.md` du repo.

### 5.6 État de l'audit sécurité

Un audit sécurité externe (Stéphane Chermette, Direction Informatique, mai 2026) a relevé 5 points ;
**tous corrigés** au 8 juin 2026 (voir `docs/audit-securite-frontend-etat.md` pour le détail complet
et l'historique des correctifs) :

| Finding | Sévérité | État |
|---|---|---|
| En-têtes de sécurité nginx manquants / config cassée | Critique | ✅ Corrigé |
| `dangerouslySetInnerHTML` non sanitisés (2 occurrences) | Critique | ✅ Corrigé (DOMPurify) |
| Chiffrement localStorage cosmétique (clé dans le bundle) | Élevé | ✅ Corrigé — couche supprimée (option pragmatique retenue ; la vraie protection repose sur CSP + sanitisation HTML) |
| Dockerfile affichait les variables d'env en clair dans les logs | Moyen | ✅ Corrigé (checks fail-fast) |
| Fallback `api-dev` codé en dur dans `oauth.ts` | Moyen | ✅ Corrigé (`apiConfig.ts`, voir §4.3) |

**Reste à faire (le seul point encore ouvert)** : la CSP est actuellement en
`Content-Security-Policy-Report-Only` (observation, ne bloque rien). Il faut faire une session de
clic complète en recette, console ouverte, collecter les violations, ajuster les directives, puis
**renommer en `Content-Security-Policy`** (mode bloquant) une fois zéro violation constatée. C'est
la tâche sécurité prioritaire à transmettre.

---

## 6. Déploiement & infrastructure

### 6.1 Conteneurisation

- `Dockerfile` : build multi-stage (Node 18.20.8 → build Vite → nginx 1.27-alpine), avec vérification
  fail-fast des variables d'environnement requises à la construction.
- `docker/nginx/default.conf` : un seul bloc `server`, en-têtes de sécurité en tête (HSTS,
  X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy, CSP Report-Only),
  `server_tokens off`. ⚠️ `add_header` ne cascade pas dans les `location` qui définissent leur propre
  `add_header` (`/health`, `/version.json`) — sans impact car le document HTML principal est servi
  par `location /` qui hérite bien de la CSP.
- `docker-compose.yml` : déploiement derrière **Traefik** (labels de routage + healthcheck HTTP sur
  `/health`), réseau externe `traefik`.
- `docker-compose-standalone.yml` : variante sans Traefik, exposition directe d'un port
  (`APP_HTTP_PORT`).
- `docker/healthcheck.sh` : script de health check du conteneur.
- Endpoints de contrôle : `/health` (liveness) et `/version.json` (hash de build / version déployée
  — utile pour vérifier qu'un déploiement recette/prod a bien pris).

### 6.2 Pipeline CI/CD

- `azure-pipelines.yml` (générique/template dans ce repo) : stage **Build** (Node 18.20.8, `npm ci`
  + `npm run build`, build & push image Docker vers Azure Container Registry) puis stage **Deploy**
  (pull de l'image sur un agent auto-hébergé, `docker stop/rm/run`).
- `docs/azure-setup.txt` : guide pas-à-pas pour recréer l'infra Azure DevOps/ACR/agent si jamais il
  faut la reconfigurer entièrement (ACR, service connection, variable group, environnement, agent
  self-hosted Linux).
- **⚠️ Flux réel constaté en pratique** (à vérifier/confirmer directement dans Azure DevOps, le YAML
  du repo est plus un gabarit qu'un reflet exact de la config actuelle) : le déploiement en
  **recette se fait via Pull Request vers la branche `recette`** — sans PR mergée sur cette branche,
  le stage de déploiement recette est simplement **skippé**. Après un déploiement, toujours vérifier
  le **hash du bundle** et `/version.json` pour confirmer que la bonne version tourne.

### 6.3 Environnements

| Environnement | Build command | Fichier env | API cible |
|---|---|---|---|
| Développement | `npm run dev` (`--mode developpement`) | `.env.developpement` | `api-dev.groupe-glenat.com` (ou proxy Vite `/intranet` → `api-recette`, voir `vite.config.ts`) |
| Recette | `npm run build:recette` | `.env.recette` | `api-recette.groupe-glenat.com` |
| Production | `npm run build:production` | `.env.production` | `api.groupe-glenat.com` |

`.env.example` documente toutes les variables nécessaires (clé AES, OAuth, clé publique RSA,
versioning Docker). **Les vraies valeurs de secrets ne sont pas dans le repo** (`.env.*` réels sont
gitignorés) — à transmettre séparément et de façon sécurisée (voir checklist §9).

---

## 7. État du projet à la date de passation

### 7.1 Travaux en cours (non commités au moment de la rédaction)

Au moment d'écrire ce document, la branche `main` a des modifications locales non commitées :

- **Planning** (`src/hooks/usePlanning.ts`, `src/pages/Planning.tsx`) : refonte en cours du hook de
  données planning (gros diff, +221/-lignes) — vérifier l'état d'avancement avant de repartir dessus,
  possible travail non terminé.
- **Catalogue** (`src/lib/catalogue.ts`, `src/components/BookDetailPanel.tsx`) : ajustements sur le
  stock / fiche produit (lié au chantier stockHachette / cluster inventory, voir
  [[bc-item-profiles]]).
- **Absences** (`src/lib/absencesApi.ts`) : ajustements sur `fetchAbsences`/`fetchRemoteWorking`.
- **Accueil** (`src/components/ActualitesCard.tsx`) : ajustements d'affichage.
- **`docs/endpoints-v2.0-uppercase.md`** : correction de casse sur deux endpoints Kelio
  (`Kelio/absences` → `kelio/absences`).
- **Nouveau fichier `src/data/saints.ts`** : calendrier des prénoms ("fête du jour") en dur, sans
  appel réseau — vient alimenter le bloc "Bonnes fêtes aux..." de l'accueil.

**Avant de continuer** : relire ces diffs (`git diff`), comprendre s'ils sont finis/testés, et
décider de les committer ou de les terminer avant toute nouvelle fonctionnalité.

### 7.2 Dette technique connue

1. **`Dev/callDatabase`** encore utilisé par `catalogue.ts`, `calendar.ts`, `jobOffers.ts` (§4.4).
2. **CSP en Report-Only**, pas encore passée en mode bloquant (§5.6).
3. **`backend/Intranet.Api/`** : dossier scaffold vide et non suivi par Git, à supprimer après
   confirmation que rien ne s'appuie dessus.
4. **Flags `USE_MOCK`** disséminés dans plusieurs hooks (`usePlanning.ts`, `useAnnonces.ts`...) — état
   transitoire pendant que les endpoints correspondants se stabilisent côté backend PHP.
5. **Docs historiques obsolètes** : `docs/main.md`, `docs/app.md`, `docs/fonctionnement.md`,
   `docs/home.md` décrivent une version **antérieure** de l'app (routing par état au lieu de
   react-router, pas d'admin, pas d'auth réelle). Je les ai laissés pour l'historique mais **ils ne
   reflètent plus le code actuel** — voir §8 pour ce qui fait référence aujourd'hui.
6. **Modules admin placeholders** listés en §2 — routes prévues, pas implémentées.

### 7.3 Ce qui marche bien et n'a pas besoin d'attention immédiate

- Authentification MSAL + lookup interne : stable.
- Migration API v2.0 → v2.2 côté admin/CMS/utilisateurs : terminée et fonctionnelle.
- Sécurité : audit traité à 95 % (reste uniquement la bascule CSP en mode bloquant).
- Performance : lazy loading + préchargement échelonné + fingerprint anti-rerender en place et
  documentés (`docs/formation/plan-formation-frontend.md` §8).

---

## 8. Documentation existante — index

| Document | Contenu | Fiabilité à ce jour |
|---|---|---|
| **`docs/passation-projet.md`** (ce document) | Vue d'ensemble + tout ce qui n'est pas ailleurs | ✅ à jour (rédigé pour la passation) |
| `docs/formation/plan-formation-frontend.md` | Plan de formation détaillé React/TS pour développeur reprenant le front : hooks, patterns, pièges, exercices | ✅ à jour, très complet, **à lire en second** après ce document |
| `docs/cartographie-elements.md` (+ `.json`) | Cartographie fine de chaque élément d'UI pilotable par les droits (id, composant, page) | ✅ fiable au niveau composant, un peu daté sur l'architecture globale (écrit avant react-router/admin) |
| `docs/audit-securite-frontend-etat.md` | Suivi de l'audit sécurité externe, findings et correctifs | ✅ à jour au 8 juin 2026 |
| `docs/api-migration/MIGRATION-v2.0-to-v2.2.md` | Détail de la bascule SQL brut → API REST côté admin | ✅ à jour |
| `docs/api-migration/v2.0/`, `v2.2/` | Copie de référence des contrôleurs/handlers PHP du backend réel | Référence en lecture seule, peut diverger du repo backend réel dans le temps |
| `docs/endpoints-v2.0-uppercase.md` | Convention de casse des endpoints (uppercase vs lowercase selon version API) | ✅ à jour |
| `docs/azure-setup.txt` | Guide de recréation de l'infra Azure DevOps/ACR si besoin | Générique, à valider avec la config Azure DevOps réelle |
| `docs/main.md`, `app.md`, `fonctionnement.md`, `home.md` | Anciennes descriptions de l'app (pré react-router, pré-admin) | ❌ obsolètes — historique seulement, ne pas utiliser pour comprendre le code actuel |
| `README.md` (racine) | Setup rapide, chiffrement URL, OAuth, chiffrement hybride des payloads | ✅ à jour |
| `CHANGELOG.md` | Historique des livraisons notables | ✅ à jour, à continuer d'alimenter |

---

## 9. Checklist de passation

À faire avant/pendant mon départ (à cocher au fur et à mesure) :

- [ ] Transfert des accès **Azure DevOps** (repo Git, pipelines, variable groups) sur son compte.
- [ ] Transfert des accès **Azure AD / App registration** (client ID/secret MSAL) si elle doit les
      gérer.
- [ ] Transfert des accès à l'**Azure Container Registry** (ACR).
- [ ] Accès au(x) **serveur(s) Docker self-hosted** (dev/recette/prod) — SSH, droits `docker`.
- [ ] Transmission sécurisée des fichiers **`.env.*` réels** (secrets OAuth, clé AES, clé publique
      RSA) — jamais par email en clair, utiliser un coffre-fort de secrets partagé si l'entreprise en
      a un.
- [ ] Accès au **repo backend PHP** (nom exact du repo, accès Git à obtenir auprès de l'IT).
- [ ] Contact(s) côté **IT/Direction Informatique** (interlocuteur de l'audit sécurité, responsable
      infra Azure).
- [ ] Contact côté **métier** pour chaque module (qui valide les évolutions catalogue, RH/Kelio,
      annonces...).
- [ ] Vérifier qu'elle a accès aux **environnements de test** (recette) avec un compte de test pour
      chaque profil de droits (au moins un par groupe métier, voir `src/lib/access-control.ts`).
- [ ] Point sur les **tickets/PR en cours** (VBE/xxxx) non encore mergés.
- [ ] Présentation orale de ce document + démonstration live des 2-3 flux les plus sensibles
      (chiffrement d'URL, permissions, déploiement recette).

---

## 10. Recommandations pour les premières semaines

1. **Lire ce document puis `docs/formation/plan-formation-frontend.md`** avant de toucher au code.
2. **Faire tourner le projet en local** (`npm install && npm run dev`), se connecter avec un compte
   de test, naviguer dans chaque module pour se faire une carte mentale avant de lire le code en
   profondeur.
3. **Ne pas committer sans relire** les diffs en cours listés en §7.1 — ils sont à moi, à évaluer
   avant de repartir dessus ou de les jeter.
4. **Prioriser la fermeture de la CSP** (§5.6) — c'est la seule action sécurité encore ouverte et
   elle est simple (observation puis bascule).
5. Pour toute nouvelle fonctionnalité touchant les droits d'accès : toujours passer par
   **Administration → Modules/Pages/Blocs/Éléments**, ne jamais coder un accès en dur.
6. Pour toute nouvelle donnée serveur : passer par **React Query** avec une clé de cache
   hiérarchique stable, sur le modèle des hooks existants dans `src/hooks/`.
7. En cas de doute sur un endpoint API : chercher d'abord dans
   `docs/api-migration/v2.2/*Controller.php` avant de deviner un contrat.
