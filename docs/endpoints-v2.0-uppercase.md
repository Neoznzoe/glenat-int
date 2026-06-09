# Endpoints `/Api/v2.0/X...` (segment initial en majuscule)

Recensement de tous les endpoints qui utilisent le motif `/Api/v2.0/<Majuscule>...` dans le code source.

Les endpoints du type `/Api/v2.0/planning`, `/Api/v2.0/users`, `/Api/v2.0/groups`, `/Api/v2.0/cms/blocks`, `/Api/v2.0/cms/elements`, `/Api/v2.0/imagino/set`, `/Api/v2.0/oAuth/...` (segment initial en minuscule) sont **volontairement exclus**.

---

## Configuration / Infrastructure

| Endpoint | Fichier | Description |
|---|---|---|
| `/Api/v2.0/OAuth` | `.env.example:8` | Base URL OAuth configurable via `VITE_OAUTH_BASE_URL`. Le code construit ensuite `/authorize` et `/token` à partir de cette base. |
| `/Api/v2.0/Intranet` | `vite.config.ts:18` | Cible du proxy de dev Vite : toute requête locale `/intranet/...` est réécrite vers `/Api/v2.0/Intranet/...`. |

---

## Kelio (RH — absences et télétravail)

| Méthode | Endpoint | Fonction | Fichier |
|---|---|---|---|
| `GET` | `/Api/v2.0/Kelio/absences` | `fetchAbsences()` | `src/lib/absencesApi.ts:129` |
| `GET` | `/Api/v2.0/Kelio/remoteWorking` | `fetchRemoteWorking()` | `src/lib/absencesApi.ts:249` |

---

## CMS — Modules

| Méthode | Endpoint | Fonction | Fichier |
|---|---|---|---|
| `GET` | `/Api/v2.0/Cms/module` | `fetchModules()` | `src/lib/modulesApi.ts:90` |
| `GET` | `/Api/v2.0/Cms/module/{moduleId}` | `fetchModule()` | `src/lib/modulesApi.ts:105` |
| `POST` | `/Api/v2.0/Cms/module` | `createModule()` | `src/lib/modulesApi.ts:119` |
| `PUT` | `/Api/v2.0/Cms/module/{moduleId}` | `updateModule()` | `src/lib/modulesApi.ts:152` |
| `DELETE` | `/Api/v2.0/Cms/module/{moduleId}` | `deleteModule()` | `src/lib/modulesApi.ts:182` |
| _(constante)_ | `/Api/v2.0/Cms/module` | `CMS_MODULE_ENDPOINT` | `src/lib/adminApi.ts:21` |

---

## CMS — Pages

| Méthode | Endpoint | Fonction | Fichier |
|---|---|---|---|
| `GET` | `/Api/v2.0/Cms/page` | `fetchPages()` | `src/lib/pagesApi.ts:102` |
| `GET` | `/Api/v2.0/Cms/page/{pageId}` | `fetchPage()` | `src/lib/pagesApi.ts:129` |
| `POST` | `/Api/v2.0/Cms/page` | `createPage()` | `src/lib/pagesApi.ts:143` |
| `PUT` | `/Api/v2.0/Cms/page/{pageId}` | `updatePage()` | `src/lib/pagesApi.ts:177` |
| `DELETE` | `/Api/v2.0/Cms/page/{pageId}` | `deletePage()` | `src/lib/pagesApi.ts:211` |
| _(constante)_ | `/Api/v2.0/Cms/page` | `CMS_PAGE_ENDPOINT` | `src/lib/adminApi.ts:22` |

---

## CMS — Zones

| Méthode | Endpoint | Fonction | Fichier |
|---|---|---|---|
| `GET` | `/Api/v2.0/Cms/zone` | `fetchZones()` | `src/lib/zonesApi.ts:105` |
| `GET` | `/Api/v2.0/Cms/zone/{zoneId}` | `fetchZone()` | `src/lib/zonesApi.ts:120` |
| `POST` | `/Api/v2.0/Cms/zone` | `createZone()` | `src/lib/zonesApi.ts:134` |
| `PUT` | `/Api/v2.0/Cms/zone/{zoneId}` | `updateZone()` | `src/lib/zonesApi.ts:165` |
| `DELETE` | `/Api/v2.0/Cms/zone/{zoneId}` | `deleteZone()` | `src/lib/zonesApi.ts:196` |

---

## DocuSign — Enveloppes

| Méthode | Endpoint | Fonction | Fichier |
|---|---|---|---|
| `POST` | `/Api/v2.0/Docusign/envelope` | `createEnvelope()` | `src/lib/docusignApi.ts:97` |
| `GET` | `/Api/v2.0/Docusign/envelope/{envelopeId}` | `getEnvelopeStatus()` | `src/lib/docusignApi.ts:113` |
| `PUT` | `/Api/v2.0/Docusign/envelope/{envelopeId}` | `voidEnvelope()` | `src/lib/docusignApi.ts:128` |
| `DELETE` | `/Api/v2.0/Docusign/envelope/{envelopeId}` | `deleteEnvelope()` | `src/lib/docusignApi.ts:147` |
| `GET` | `/Api/v2.0/Docusign/envelope/{envelopeId}/download` | `downloadEnvelopeDocuments()` | `src/lib/docusignApi.ts:167` |
| `GET` | `/Api/v2.0/Docusign/envelope/{envelopeId}/signers` | `getEnvelopeSigners()` | `src/lib/docusignApi.ts:186` |
| `GET` | `/Api/v2.0/Docusign/envelope/{envelopeId}/signer/{signerIdentifier}` | `getEnvelopeSigner()` | `src/lib/docusignApi.ts:202` |

---

## Imagino (CRM contacts)

| Méthode | Endpoint | Fonction | Fichier |
|---|---|---|---|
| `GET` | `/Api/v2.0/Imagino/contact/{email}` | `getImaginoContact()` | `src/lib/imaginoApi.ts:79` |
| `POST` | `/Api/v2.0/Imagino/contact` | `upsertImaginoContact()` | `src/lib/imaginoApi.ts:95` |

---

## Jobs (Business Central — jobs SQL)

| Méthode | Endpoint | Fonction | Fichier |
|---|---|---|---|
| `POST` | `/Api/v2.0/Job/job` | `executeJob()` | `src/lib/jobsApi.ts:54` |
| `GET` | `/Api/v2.0/Job/job/status/{jobId}/{instanceId}` | `getJobStatus()` | `src/lib/jobsApi.ts:73` |

---

## Projects

| Méthode | Endpoint | Fonction | Fichier |
|---|---|---|---|
| `GET` | `/Api/v2.0/Project/project` | `fetchProjects()` | `src/lib/projectsApi.ts:90` |
| `GET` | `/Api/v2.0/Project/project/{projectId}` | `fetchProject()` | `src/lib/projectsApi.ts:105` |
| `POST` | `/Api/v2.0/Project/project` | `createProject()` | `src/lib/projectsApi.ts:119` |
| `PUT` | `/Api/v2.0/Project/project/{projectId}` | `updateProject()` | `src/lib/projectsApi.ts:152` |
| `DELETE` | `/Api/v2.0/Project/project/{projectId}` | `deleteProject()` | `src/lib/projectsApi.ts:182` |

---

## Récapitulatif

- **11 fichiers** contiennent ce motif.
- **37 occurrences** au total (URLs construites, constantes et configurations comprises).
- **8 segments racines** distincts en majuscule : `OAuth`, `Intranet`, `Kelio`, `Cms`, `Docusign`, `Imagino`, `Job`, `Project`.
