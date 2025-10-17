# Audit des bonnes pratiques sécurité (Front React)

Ce document récapitule les constats effectués sur les points A → G et indique où ils sont couverts dans le code actuel, ainsi que les améliorations à planifier.

> 🧭 **Hypothèse cible rappelée** : à terme, toutes les données manipulées par le front seront servies par une API dédiée qui seule aura accès à la base de données. Les recommandations ci-dessous précisent donc, pour chaque point, ce qui devra être traité côté front et ce qui relèvera de cette API.

## A — Construction sûre des URLs côté React

### Implémentation actuelle
- Les composants qui construisent des query-strings encodent les paramètres avec `encodeURIComponent`, par exemple dans le lien vers la fiche livre (`BookCard`). 【F:src/components/BookCard.tsx†L68-L78】
- Les appels réseau qui manipulent un EAN veillent aussi à encoder la valeur avant de l'insérer dans l'URL (`catalogue.ts`, `CouvertureAParaitre`). 【F:src/lib/catalogue.ts†L666-L683】【F:src/pages/catalogue/CouvertureAParaitre.tsx†L70-L90】

### À surveiller
- Conserver ce réflexe pour toute nouvelle interpolation de valeurs utilisateur dans une URL. L'usage de `URLSearchParams` est également recommandé pour les requêtes complexes.

## B — Prévention XSS dans React

### Implémentation actuelle
- React échappe par défaut les valeurs interpolées dans le JSX. La majorité des vues se reposent sur ce comportement.
- **Point à risque :** le composant `JobOffer` injecte du HTML issu du back-office via `dangerouslySetInnerHTML` sans sanitation préalable. 【F:src/components/JobOffer.tsx†L198-L214】
- Le composant `ChartStyle` génère un bloc `<style>` via `dangerouslySetInnerHTML`, mais le HTML produit provient d'une configuration interne (couleurs/variables de thème) et non de contenu utilisateur. 【F:src/components/ui/chart.tsx†L96-L131】

### Actions recommandées
- **Architecture cible (backend propriétaire) :** s'assurer que l'API qui fournit ces contenus applique un nettoyage systématique avant de renvoyer du HTML au front.
- **Défense en profondeur côté front :** conserver la possibilité d'introduire `dompurify` (ou équivalent) si une surface d'attaque persiste ou si le backend ne peut garantir la sanitation sur 100 % des champs.

## C — Appels réseau et exposition de données sensibles

### Implémentation actuelle
- Les requêtes qui transportent des données métier (ex. synchronisation interne, recherches catalogue) utilisent `fetch` avec une méthode POST et un corps JSON, évitant ainsi de placer les données sensibles dans l'URL (`lookupInternalUserByEmail`). 【F:src/lib/internalUserLookup.ts†L1-L43】

### À surveiller
- Continuer à privilégier `POST` + `JSON` pour toute soumission de données personnelles ou d'authentification.

## D — Prévention des injections SQL côté backend

### Implémentation actuelle
- Le front compose des requêtes SQL en interpolant les valeurs utilisateurs après un échappement manuel (`escapeSqlLiteral`) avant d'appeler l'API interne (`adminApi`, `internalUserLookup`). 【F:src/lib/adminApi.ts†L381-L421】【F:src/lib/internalUserLookup.ts†L1-L43】

### Limites et plan d'amélioration
- Cette approche reste fragile : un oubli d'échappement ou une colonne non textuelle peuvent rouvrir une faille.
- **Architecture cible (backend propriétaire) :** confier l'accès SQL exclusivement au serveur afin qu'il applique des requêtes paramétrées (`pg`, `mysql2`, ORM…) et ne reçoive du front que des paramètres déjà validés.

## E — Validation côté serveur

### Constats
- Aucun middleware de validation (`express-validator`, `zod`, etc.) n'est présent dans ce dépôt : la responsabilité incombe aux API consommées.

### Recommandations
- Dans l'architecture future, implémenter cette validation côté API (ex. `express-validator`, `zod`, schémas Prisma) avant tout accès aux ressources sensibles.

## F — Headers de sécurité HTTP

### Constats
- Ce projet Vite/React ne sert pas directement de backend Express, il n'y a donc pas d'intégration de `helmet` ici.

### Recommandations
- Dans l'architecture où toutes les données transitent par un backend maison, activer `helmet` (ou l'équivalent sur l'infrastructure existante) pour gérer CSP, `X-Content-Type-Options`, `Strict-Transport-Security`, etc.
- Si l'application est servie via un CDN ou un reverse proxy, documenter les en-têtes déjà injectés pour éviter les doublons et vérifier qu'ils couvrent les besoins.

## G — Protection contre les open redirects

### Implémentation actuelle
- Les chemins chiffrés (`useEncryptedPath`) ne révèlent que des routes internes.
- Le composant `SecureLink` laisse passer les URLs externes telles quelles ; aucune liste blanche n'est appliquée lorsqu'un `href` provient d'une source dynamique.

### Actions recommandées
- Dans la cible où la redirection est orchestrée par l'API, prévoir un utilitaire côté serveur qui vérifie le domaine et le chemin contre une liste blanche avant de répondre avec une redirection HTTP.
- Si une redirection devait être exécutée directement dans le front avec un paramètre utilisateur, appliquer la même logique (liste blanche) ou rejeter la redirection.

---

## Priorités de mise en conformité

1. **Court terme**
   - Garantir que l'API renvoie du HTML déjà assaini pour les offres d'emploi (et prévoir `DOMPurify` côté front si besoin de doublon).
   - Inventorier les modules backend qui devront encapsuler les accès SQL et mettre en place des requêtes paramétrées.

2. **Moyen terme**
   - Ajout d'une validation systématique des payloads côté serveur.
   - Mise sous contrôle des redirections potentielles via une liste blanche.

3. **Long terme / gouvernance**
   - Vérification et documentation des en-têtes de sécurité au niveau de l'infrastructure (reverse proxy, CDN, serveur API).
   - Mise en place d'audits réguliers pour garantir que les nouveaux développements respectent les pratiques décrites ci-dessus et que la séparation front/API reste hermétique.
