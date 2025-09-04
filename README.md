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

