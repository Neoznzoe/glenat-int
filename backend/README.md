# Intranet Sidebar Permissions

## Prérequis
- .NET SDK 8.0
- SQL Server (LocalDB, Docker ou instance existante)
- Node.js 18+

## 1. Base de données
```bash
cd backend/Intranet.Api
# Applique la migration initiale et seed (adapter la chaîne de connexion si besoin)
dotnet ef database update
```

Les données seed créent 5 modules, 3 utilisateurs (dont un super admin) et plusieurs interdictions `canView=0` pour illustrer le mode deny-list.

## 2. API ASP.NET Core
```bash
cd backend/Intranet.Api
# Variables d'environnement possibles :
# ASPNETCORE_ENVIRONMENT=Development
# ConnectionStrings__DefaultConnection="Server=...;Database=IntranetDb;..."
dotnet run
```

Pour passer en mode allow-list (ne montrer que les entrées explicites `canView=1`), modifier `SidebarVisibility:UseDenyListMode` dans `appsettings.json` ou via la configuration (`UseDenyListMode=false`).

Pour remplacer `FakeAuthMiddleware`, brancher votre middleware/handler d'authentification (JWT, cookies…) qui remplit les claims `NameIdentifier` et `isSuperAdmin`. Le `FakeAuth` lit un header `X-User-Id` pour émuler un login.

## 3. Frontend React
```bash
npm install
npm run dev
```

Configurer l'URL de l'API via `VITE_API_BASE_URL` (par défaut même origine).

## 4. Notes de sécurité
- La liste des modules est filtrée **exclusivement** côté serveur : ne jamais exposer de modules interdits dans une réponse HTTP.
- Réutiliser `AuthorizeModuleAccessAttribute` (ou le service) sur vos autres contrôleurs pour appliquer les mêmes règles d'accès que la sidebar.
- Invalidater le cache des modules (MemoryCache) lors de toute mise à jour des droits.
