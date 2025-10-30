# glenat-int

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Redux](https://img.shields.io/badge/Redux_Toolkit-593D88?style=for-the-badge&logo=redux&logoColor=white)](https://redux.js.org/)
[![React Query](https://img.shields.io/badge/React_Query-FF4154?style=for-the-badge&logo=react-query&logoColor=white)](https://tanstack.com/query/latest)
[![MSAL](https://img.shields.io/badge/Azure_MSAL-0078D4?style=for-the-badge&logo=microsoft-azure&logoColor=white)](https://learn.microsoft.com/azure/active-directory/develop/msal-overview)

Application interne construite avec **React**, **Vite** et **TypeScript**. Elle sert d'exemple pour montrer la structure d'un projet moderne utilisant TailwindCSS, Redux Toolkit, React Query et l'authentification Azure via MSAL.

## 🚀 Démarrage rapide

1. Installer les dépendances :
   ```bash
   npm install
   ```
2. Lancer le serveur de développement :
   ```bash
   npm run dev
   ```

## 🔐 Chiffrement des URLs (AES-256-GCM)

Les appels réseau **et la navigation applicative** sont encapsulés dans des URLs chiffrées grâce à AES-256-GCM. Dès qu'une clé est fournie, les routes telles que `/catalogue/nouveautes` sont automatiquement exposées comme `/ci/amPPhBtip/pZGy2/...` tandis que le routeur interne résout le chemin original côté client.

Un exemple de configuration est fourni dans le fichier `.env` (ignoré par Git) :

```
# Exemple de clé AES-256-GCM encodée en Base64 URL-safe pour les URLs sécurisées
VITE_AES_GCM_KEY=nPB0h7q3M-0U8c5QO9gdC5cd4u3_KD6PtMnbo2FA7WE
```

Avant la mise en production, remplacez la valeur ci-dessus par votre propre clé secrète.

Pour générer une nouvelle clé partagée de 32 octets (256 bits) encodée en Base64 URL-safe :

```bash
# Exemple de génération d'une clé aléatoire depuis Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))" >> .env.local
```

Ajoutez ensuite la ligne suivante dans votre fichier `.env.local` :

```
VITE_AES_GCM_KEY=<valeur_générée>
```

En développement, le serveur mock se charge automatiquement de déchiffrer les URLs reçues afin de conserver la même API qu'auparavant.

## 🔑 Authentification OAuth pour les appels API

Les appels vers l'API `callDatabase` nécessitent désormais un jeton OAuth 2.0 obtenu en deux étapes :

1. `/OAuth/authorize` retourne un `code_exchange`.
2. Ce code est échangé contre un `access_token` (et un `refresh_token`) via `/OAuth/token`.

Configurez les variables d'environnement suivantes dans votre `.env.local` :

```
VITE_OAUTH_CLIENT_ID=<client_id_fourni>
VITE_OAUTH_CLIENT_SECRET=<client_secret_fourni>
VITE_OAUTH_SCOPE=<scope>                    # optionnel selon la configuration du serveur
VITE_OAUTH_AUDIENCE=<audience>              # optionnel
VITE_OAUTH_AUTHORIZE_ENDPOINT=https://api-dev.groupe-glenat.com/Api/v1.0/OAuth/authorize
VITE_OAUTH_TOKEN_ENDPOINT=https://api-dev.groupe-glenat.com/Api/v1.0/OAuth/token
VITE_OAUTH_AUTHORIZE_GRANT_TYPE=client_credentials  # optionnel, dépend du serveur
VITE_OAUTH_TOKEN_GRANT_TYPE=authorization_code      # valeur par défaut
VITE_OAUTH_REFRESH_GRANT_TYPE=refresh_token         # valeur par défaut
VITE_OAUTH_REFRESH_LEEWAY=30                        # marge (en secondes) avant expiration pour rafraîchir le token
VITE_OAUTH_FALLBACK_TTL=3600                        # durée de vie par défaut (en secondes) si l'API ne fournit pas expires_in
VITE_OAUTH_STORAGE_KEY=<cle_base64url_32_octets>    # clé AES-256 pour chiffrer le cache local
VITE_SECURE_API_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"  # clé publique RSA/OAEP du serveur
VITE_SECURE_API_MODE=optional                                 # disabled | optional | required
VITE_SECURE_API_SEND_ENCRYPTION_HEADER=false                  # true pour ajouter l'en-tête X-Content-Encryption
```

Seuls `VITE_OAUTH_CLIENT_ID` et `VITE_OAUTH_CLIENT_SECRET` sont indispensables ; les autres paramètres peuvent être adaptés à l'implémentation du fournisseur OAuth.

Le `code_exchange` est enregistré côté client le temps d'obtenir l'`access_token`, puis c'est cet `access_token` qui est systématiquement envoyé dans l'en-tête `Authorization: Bearer <access_token>` pour les appels `callDatabase`. Les jetons sont désormais chiffrés en AES-256-GCM avant d'être persistés dans le `localStorage`, ce qui évite toute lecture directe via les outils de développement. Ils sont automatiquement rafraîchis grâce au `refresh_token` tant qu'il reste valide.

### Chiffrement hybride des payloads API

Toutes les requêtes POST adressées aux proxys internes (`callDatabase`, catalogue, annuaire, modules administratifs) peuvent être encapsulées dans une enveloppe JSON chiffrée en AES-256-GCM dont la clé est protégée via RSA-OAEP. La clé publique exposée par l'API doit être fournie dans `VITE_SECURE_API_PUBLIC_KEY`, tandis que `VITE_OAUTH_STORAGE_KEY` sert à chiffrer le cache local des jetons OAuth. Le mode d'envoi est contrôlé par `VITE_SECURE_API_MODE` :

* `disabled` : les payloads sont envoyés en clair. C'est le mode par défaut lorsque aucune clé publique n'est fournie.
* `optional` : le client tente de chiffrer les payloads ; en cas d'erreur locale, il revient automatiquement au clair.
* `required` : le chiffrement est imposé et toute erreur de configuration bloque l'appel.

Chaque message chiffré transporte également un timestamp et un nonce aléatoire pour faciliter les contrôles anti-rejeu côté serveur.

Quel que soit le mode, le corps POST suit la structure `{ "encrypt": <bool>, "data": <payload> }` afin que le serveur puisse cibler la section `data`. L'en-tête optionnel `X-Content-Encryption: hybrid-aes256gcm+rsa` n'est ajouté que si `VITE_SECURE_API_SEND_ENCRYPTION_HEADER=true` **et** que le champ `data` transporte un bloc chiffré, ce qui évite les rejets CORS sur la requête de preflight lorsque le backend n'autorise pas cet en-tête personnalisé.

## 🧠 Technologies principales
- **React** pour la construction des interfaces.
- **TypeScript** pour un typage statique robuste.
- **Vite** comme outil de bundling et de développement rapide.
- **TailwindCSS** pour le style via des classes utilitaires.
- **Redux Toolkit** pour l'état global (panier par exemple).
- **React Query** pour gérer les appels réseau et le cache.
- **MSAL** pour l'authentification avec Azure Active Directory.

## 📁 Structure du projet
```
src/
├── components/   # Composants réutilisables (Sidebar, Topbar, etc.)
├── pages/        # Pages de l'application
├── store/        # Configuration Redux
├── hooks/        # Hooks personnalisés
└── main.tsx      # Point d'entrée
```

## 📜 Scripts disponibles
- `npm run dev` : démarre l'environnement de développement.
- `npm run build` : génère la version de production.
- `npm run lint` : vérifie la qualité du code avec ESLint.
- `npm run preview` : prévisualise la build de production.

## 📚 Documentation détaillée
Un guide bas niveau du fonctionnement interne est disponible dans [`docs/fonctionnement.md`](docs/fonctionnement.md).

