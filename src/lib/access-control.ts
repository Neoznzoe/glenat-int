export type PermissionKey = string;

export interface PermissionDefinition {
  key: PermissionKey;
  label: string;
  description: string;
  category?: string;
  /**
   * Indicates whether the definition represents an intranet module or an individual page.
   * When omitted, the definition is treated as a top-level module for backwards compatibility.
   */
  type?: 'module' | 'page';
  /**
   * References the parent module permission key for page level permissions.
   */
  parentKey?: PermissionKey | null;
  /**
   * Extra data forwarded from the API (module/page identifiers, slugs, etc.).
   */
  metadata?: Record<string, unknown>;
}

export interface GroupDefinition {
  id: string;
  name: string;
  description: string;
  defaultPermissions: PermissionKey[];
  accentColor: string;
}

export const PERMISSION_DEFINITIONS: PermissionDefinition[] = [
  {
    key: 'home',
    label: 'Accueil',
    description: "Accès à la page d'accueil de l'intranet.",
    category: 'Général',
    type: 'module',
    parentKey: null,
  },
  {
    key: 'qui',
    label: 'Qui fait quoi',
    description: 'Annuaire interne et organigrammes.',
    category: 'Général',
    type: 'module',
    parentKey: null,
  },
  {
    key: 'catalogue',
    label: 'Catalogue',
    description: 'Consultation des catalogues et publications.',
    category: 'Catalogue',
    type: 'module',
    parentKey: null,
  },
  {
    key: 'kiosque',
    label: 'Kiosque',
    description: 'Accès au kiosque de lecture des publications numériques.',
    category: 'Catalogue',
    type: 'module',
    parentKey: null,
  },
  {
    key: 'doc',
    label: "Glénat'Doc",
    description: 'Accès à la documentation interne et aux procédures.',
    category: 'Ressources',
    type: 'module',
    parentKey: null,
  },
  {
    key: 'fee',
    label: "Glénat'Fée",
    description: 'Accès aux outils bureautiques et formulaires internes.',
    category: 'Ressources',
    type: 'module',
    parentKey: null,
  },
  {
    key: 'agenda',
    label: 'Agenda',
    description: "Consultation de l'agenda des événements de l'entreprise.",
    category: 'Communication',
    type: 'module',
    parentKey: null,
  },
  {
    key: 'planning',
    label: 'Planning',
    description: 'Visualisation des plannings des équipes et projets.',
    category: 'Communication',
    type: 'module',
    parentKey: null,
  },
  {
    key: 'contrats',
    label: 'Contrats',
    description: 'Gestion et suivi des contrats.',
    category: 'RH',
    type: 'module',
    parentKey: null,
  },
  {
    key: 'rh',
    label: 'Ressources humaines',
    description: 'Informations et services liés aux ressources humaines.',
    category: 'RH',
    type: 'module',
    parentKey: null,
  },
  {
    key: 'temps',
    label: 'Saisie des temps',
    description: 'Saisie et validation des temps de production.',
    category: 'Production',
    type: 'module',
    parentKey: null,
  },
  {
    key: 'atelier',
    label: 'Travaux atelier',
    description: 'Accès aux suivis de travaux de l’atelier.',
    category: 'Production',
    type: 'module',
    parentKey: null,
  },
  {
    key: 'espace',
    label: 'Mon espace',
    description: 'Espace personnel de chaque collaborateur.',
    category: 'Général',
    type: 'module',
    parentKey: null,
  },
  {
    key: 'emploi',
    label: 'Emploi',
    description: 'Offres internes et mobilités.',
    category: 'RH',
    type: 'module',
    parentKey: null,
  },
  {
    key: 'annonces',
    label: 'Petites annonces',
    description: 'Publication et consultation des annonces internes.',
    category: 'Communication',
    type: 'module',
    parentKey: null,
  },
  {
    key: 'services',
    label: 'Services',
    description: 'Accès aux services transverses de support.',
    category: 'Support',
    type: 'module',
    parentKey: null,
  },
  {
    key: 'administration',
    label: 'Administration',
    description: "Outils d'administration de l'intranet.",
    category: 'Administration',
    type: 'module',
    parentKey: null,
  },
];

export const BASE_PERMISSIONS: PermissionKey[] = ['home', 'qui', 'espace'];

export const GROUP_DEFINITIONS: GroupDefinition[] = [
  {
    id: 'editions-glenat',
    name: 'Éditions Glénat',
    description:
      "Equipe éditoriale principale. Accès étendu aux catalogues et outils de suivi.",
    defaultPermissions: ['catalogue', 'doc', 'planning', 'services', 'emploi'],
    accentColor: 'bg-rose-500/10 text-rose-600 border-rose-200',
  },
  {
    id: 'ged',
    name: 'GED',
    description:
      'Gestion électronique des documents. Axée sur les ressources et procédures.',
    defaultPermissions: ['doc', 'fee', 'services'],
    accentColor: 'bg-sky-500/10 text-sky-600 border-sky-200',
  },
  {
    id: 'glenat-prod',
    name: 'Glénat Prod',
    description:
      'Production et logistique. Nécessite les accès aux temps et aux travaux atelier.',
    defaultPermissions: ['planning', 'temps', 'atelier', 'services'],
    accentColor: 'bg-amber-500/10 text-amber-600 border-amber-200',
  },
  {
    id: 'prestataire-externes',
    name: 'Prestataire externes',
    description:
      'Accès limité pour les partenaires externes aux modules essentiels uniquement.',
    defaultPermissions: ['services', 'atelier'],
    accentColor: 'bg-slate-500/10 text-slate-600 border-slate-200',
  },
  {
    id: 'glenat-diffusion',
    name: 'Glénat diffusion',
    description:
      'Réseau de diffusion commerciale. Nécessite les outils catalogue et communication.',
    defaultPermissions: ['catalogue', 'annonces', 'services', 'planning'],
    accentColor: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
  },
  {
    id: 'hugo-digital',
    name: 'Hugo digital',
    description: 'Pôle digital. Accès aux services, plannings et mobilité interne.',
    defaultPermissions: ['services', 'planning', 'emploi'],
    accentColor: 'bg-violet-500/10 text-violet-600 border-violet-200',
  },
  {
    id: 'hugo-publishing',
    name: 'Hugo publishing',
    description: 'Pôle publishing avec accès renforcé au catalogue et aux services support.',
    defaultPermissions: ['catalogue', 'services', 'emploi', 'doc'],
    accentColor: 'bg-indigo-500/10 text-indigo-600 border-indigo-200',
  },
];

export const PERMISSION_KEY_SET = new Set(
  PERMISSION_DEFINITIONS.map((definition) => definition.key),
);

export function isPermissionKey(value: string): value is PermissionKey {
  return PERMISSION_KEY_SET.has(value as PermissionKey);
}
