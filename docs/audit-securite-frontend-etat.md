# Rapport — Audit Sécurité Frontend vs état actuel du projet

- **Document audité :** `Audit-Securite-Frontend.docx` — Stéphane Chermette (Direction Informatique), 26 mai 2026
- **Application :** Intranet Glénat (Refresh 2024) — React + Vite + TypeScript, Docker (nginx 1.27-alpine) derrière Traefik
- **Vérifié le :** 3 juin 2026, sur la branche `main` locale
- **Mis à jour le :** 8 juin 2026 — les 5 findings sont désormais traités (voir statuts ci-dessous)

---

## Vue d'ensemble

| # | Finding audit | Criticité | État réel aujourd'hui |
|---|---|---|---|
| §4 | En-têtes de sécurité nginx manquants | Critique | ✅ **Corrigé** (config réécrite, voir plus bas) |
| §5 | 2× `dangerouslySetInnerHTML` non sanitisés | Critique | ✅ **Corrigé** (DOMPurify appliqué le 8 juin) |
| §6 | Chiffrement localStorage cosmétique | Élevé | ✅ **Corrigé** — option A retenue : couche supprimée le 8 juin |
| §7 | Dockerfile expose les variables (`echo`) | Moyen | ✅ **Corrigé** (checks de présence + fail-fast le 8 juin) |
| §8 | Fallback `api-dev` dans `oauth.ts` | Moyen | ✅ **Corrigé** (`apiConfig.ts` créé, `oauth.ts` migré) |

Les 5 findings de l'audit sont traités. Reste de l'observation/coordination : session CSP Report-Only en recette avant de basculer en mode bloquant (§4).

---

## 🔴 §4 — En-têtes nginx — CORRIGÉ (était cassé)

### Constat à la vérification
Le bloc de l'audit avait été collé dans `docker/nginx/default.conf`, mais en **dupliquant tout le bloc `server {}` et en l'imbriquant** dans le premier :

- deux `server {` imbriqués (interdit en nginx) ;
- accolade fermante en double.

**Conséquence : `nginx -t` échoue → le conteneur ne démarre pas.** En l'état, un déploiement faisait tomber l'intranet entier. De plus, les headers étaient placés *après* les `location`, donc absents des routes ayant leur propre `add_header`.

### Correctif appliqué (3 juin 2026)
`docker/nginx/default.conf` réécrit en **un seul bloc `server`** valide, avec les `add_header … always` placés en tête (juste après `index index.html;`) :

- `Strict-Transport-Security`, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`
- `Content-Security-Policy-Report-Only` (mode observation, ne bloque rien)
- `server_tokens off;`

> **Limite connue (nginx) :** `add_header` ne cascade pas dans une `location` qui définit son propre `add_header`. Les routes `/health`, `/version.json`, `/index.html` (qui ont un `Cache-Control`) ne reçoivent donc pas ces en-têtes. Sans impact sécurité : le document applicatif est servi par `location /` (sans `add_header`), il hérite donc bien de la CSP et des headers.

### Reste à faire
1. `docker compose build && nginx -t` (ou démarrer le conteneur) pour valider la config.
2. Session de clic complète en recette, console ouverte, pour collecter les violations `CSP Report-Only`.
3. Ajuster les directives, puis renommer `Content-Security-Policy-Report-Only` → `Content-Security-Policy` (mode bloquant) une fois zéro violation.

---

## 🔴 §5 — `dangerouslySetInnerHTML` non sanitisés — CORRIGÉ (8 juin)

| Fichier | Ligne | Source | État |
|---|---|---|---|
| `src/pages/catalogue/AuteurDetail.tsx` | 256 | Biographie auteur (API) | ✅ `DOMPurify.sanitize(biography)` |
| `src/components/JobOffer.tsx` | 200 | Contenu offre d'emploi (API) | ✅ `DOMPurify.sanitize(content)` (dans `renderHtmlContent`) |

- `dompurify` (v3, types embarqués → pas besoin de `@types/dompurify`) installé via `npm i dompurify`, importé dans les deux fichiers. Config par défaut de DOMPurify (liste blanche raisonnable, bloque `<script>`, `onerror`/`onclick`, `javascript:`).
- **3ᵉ occurrence non citée par l'audit** : `src/components/ui/chart.tsx:78` — injecte du CSS statique généré depuis la config (pattern shadcn/ui), **pas** du contenu API → risque faible, laissée en l'état.
- Rappel : défense en profondeur côté front. Le backend doit aussi assainir ces champs.

---

## 🟠 §6 — Chiffrement localStorage cosmétique — CORRIGÉ — Option A (8 juin)

Arbitrage : **option A** (pragmatique) retenue. La couche de chiffrement donnait un faux sentiment de sécurité (clé embarquée dans le bundle, lisible par tout XSS), elle a été retirée :

- `src/lib/storageEncryption.ts` **supprimé**.
- `src/lib/oauth.ts` : persistance/hydratation des jetons via `JSON.stringify`/`JSON.parse` directs (plus d'`encryptForStorage`/`decryptFromStorage`).
- `VITE_OAUTH_STORAGE_KEY` retiré de `.env.example` ; mentions nettoyées dans `README.md` et `docs/formation/plan-formation-frontend.md`.

La vraie protection des jetons repose désormais sur la CSP (§4) + la sanitisation HTML (§5).

> **Option B (robuste, non retenue pour l'instant)** : tokens en cookies `HttpOnly + Secure + SameSite=Strict` émis par le backend → le JS n'accède plus aux tokens. Reste la cible de référence si le backend expose un jour ce mécanisme (chantier 2-3 j).

---

## 🟡 §7 — Dockerfile expose les variables — CORRIGÉ (8 juin)

Les `echo` qui affichaient les valeurs en clair ont été remplacés par des checks de présence (ne dévoilent que `set`/`MISSING` et **font échouer le build si une variable manque**) :

```dockerfile
&& echo "Build env check:" \
&& { [ -n "$VITE_OAUTH_BASE_URL" ] && echo "  VITE_OAUTH_BASE_URL: set" || { echo "  VITE_OAUTH_BASE_URL: MISSING"; exit 1; }; } \
&& { [ -n "$VITE_OAUTH_CLIENT_ID" ] && echo "  VITE_OAUTH_CLIENT_ID: set" || { echo "  VITE_OAUTH_CLIENT_ID: MISSING"; exit 1; }; } \
&& { [ -n "$VITE_API_BASE_URL" ] && echo "  VITE_API_BASE_URL: set" || { echo "  VITE_API_BASE_URL: MISSING"; exit 1; }; } \
```

**Bénéfice double :** plus de valeurs en clair dans les logs Azure Pipelines, et build fail-fast si une variable manque (plus de fallback silencieux côté Docker).

> Reste côté Azure DevOps (hors code) : purger les anciens runs contenant les valeurs en clair et marquer les variables sensibles comme « secret ».

---

## 🟡 §8 — Fallback `api-dev` dans `oauth.ts` — CORRIGÉ

`src/lib/apiConfig.ts` existe désormais : source de vérité unique qui dérive la base de l'API du hostname du front (`-recette`/`-dev`/prod), sans fallback `api-dev` en dur côté code applicatif. `src/lib/oauth.ts` importe `API_BASE_URL` depuis `apiConfig.ts` (plus de constante locale codée en dur).

---

## ✅ Points positifs de l'audit — toujours valables

- `rel="noopener noreferrer"` systématique sur les `target="_blank"`.
- Aucun `eval()` / `new Function()` / `setTimeout(string)`.
- `HEALTHCHECK` + endpoint `/health` séparé de `version.json`.
- Crypto AES-256-GCM correcte sur le plan algorithmique (IV aléatoire 12 octets, clé 256 bits) — seul le **stockage de la clé** pose problème (§6).
- MSAL v3 PKCE natif (couche Azure AD) — rien à corriger.
- Compression gzip nginx correcte.

Aucun de ces points n'a régressé.

---

## Plan d'action priorisé (mis à jour)

| # | Action | Section | Effort | Statut |
|---|---|---|---|---|
| 1 | Réparer la config nginx (un seul bloc, headers en tête) | §4 | 10 min | ✅ Fait (3 juin) |
| 2 | Valider `nginx -t` + session CSP Report-Only en recette | §4 | 1 sem. obs. | ⏳ À faire (observation) |
| 3 | Dockerfile : `echo` → checks de présence (fail-fast) | §7 | 10 min | ✅ Fait (8 juin) |
| 4 | DOMPurify sur les 2 `dangerouslySetInnerHTML` | §5 | 1 h | ✅ Fait (8 juin) |
| 5 | Créer `apiConfig.ts` (fail-fast) + migrer `oauth.ts` | §8 | 30 min | ✅ Fait |
| 6 | Arbitrer storageEncryption (option A ou B) | §6 | Discussion | ✅ Option A retenue (8 juin) |
| 7 | Implémenter le choix retenu (§6) | §6 | 30 min → 2 j | ✅ Fait — couche supprimée (8 juin) |

Toutes les actions code sont faites. Reste **l'action 2** : session de clic en recette avec la CSP en `Report-Only`, collecter les violations console, ajuster les directives, puis renommer `Content-Security-Policy-Report-Only` → `Content-Security-Policy` (mode bloquant) une fois zéro violation observée.
