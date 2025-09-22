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
2. Lancer le serveur de développement en HTTPS (écoute sur toutes les interfaces en port 3000) :
   ```bash
   npm run dev -- --host 0.0.0.0 --https --port 3000
   ```
   > Lors du premier accès via l'adresse IP (par exemple https://192.168.x.x:3000), votre navigateur affichera un avertissement concernant le certificat auto-signé. Validez l'exception de sécurité pour faire confiance au certificat `certs/dev.crt` généré localement.

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

