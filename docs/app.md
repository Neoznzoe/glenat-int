# App.tsx

Point d'entrée visuel. Gère l'état d'ouverture de la barre latérale via `useState` et expose la valeur via `SidebarContext`.

Le rendu contient :
- `<Sidebar>` avec le nombre d'offres d'emploi et un callback pour modifier l'état.
- `<Topbar>` toujours visible.
- `<AppRoutes>` qui affiche les pages selon l'URL.
- `<Toaster>` pour les notifications.

Tout est enveloppé dans `SidebarContext.Provider` pour partager l'état de la sidebar avec les composants descendants.
