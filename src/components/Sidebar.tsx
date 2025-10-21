import * as LucideIcons from 'lucide-react';
import { PanelLeft } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
  useState,
  useEffect,
  useMemo,
  useRef,
  type FocusEvent,
  type KeyboardEvent,
} from 'react';
import Logo from '../assets/logos/glenat/glenat_white.svg';
import LogoCompact from '../assets/logos/glenat/glenat_G.svg';
import { useCurrentUser, useAdminGroups } from '@/hooks/useAdminData';
import { useSidebarModules } from '@/hooks/useModules';
import { computeEffectivePermissions } from '@/lib/mockDb';
import type { PermissionDefinition, PermissionKey } from '@/lib/access-control';
import { useDecryptedLocation } from '@/lib/secureRouting';
import { SecureNavLink } from '@/components/routing/SecureLink';
import { useAuth } from '@/context/AuthContext';
import type { DatabaseUserLookupResponse } from '@/lib/internalUserLookup';

interface SidebarProps {
  jobCount?: number;
  onExpandChange?: (expanded: boolean) => void;
}

interface SidebarModuleEntry {
  id: string;
  label: string;
  path: string;
  permission: PermissionKey;
  icon: LucideIcon | null;
  badge?: number | string;
  order: number;
  section?: string;
}

type ModuleMetadata = Record<string, unknown>;

function toNonEmptyString(value: unknown): string | undefined {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed ? trimmed : undefined;
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value.toString();
  }
  return undefined;
}

function toNumberValue(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) {
      return undefined;
    }
    const parsed = Number.parseFloat(trimmed);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }
  return undefined;
}

function resolveBoolean(value: unknown, fallback = true): boolean {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'number') {
    return value !== 0;
  }
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (!normalized) {
      return fallback;
    }
    if (['0', 'false', 'non', 'no', 'off'].includes(normalized)) {
      return false;
    }
    if (['1', 'true', 'oui', 'yes', 'on'].includes(normalized)) {
      return true;
    }
  }
  return fallback;
}

function createModuleFingerprint(modules: PermissionDefinition[]): string {
  const relevantMetadataKeys = [
    'id',
    'slug',
    'path',
    'externalPath',
    'permissionKey',
    'isActive',
    'section',
    'order',
    'version',
    'updatedAt',
  ];

  const normalized = modules
    .filter((definition) => definition.type === 'module' || definition.type === undefined)
    .map((definition) => {
      const metadata =
        definition.metadata && typeof definition.metadata === 'object'
          ? (definition.metadata as Record<string, unknown>)
          : undefined;

      const sanitizedMetadata = metadata
        ? relevantMetadataKeys.reduce((accumulator, key) => {
            if (key in metadata) {
              const value = metadata[key];
              if (value !== undefined) {
                accumulator[key] = value;
              }
            }
            return accumulator;
          }, {} as Record<string, unknown>)
        : undefined;

      return {
        key: definition.key ?? null,
        type: definition.type ?? null,
        parentKey: definition.parentKey ?? null,
        label: definition.label ?? null,
        metadata: sanitizedMetadata,
      };
    })
    .sort((left, right) => {
      const leftKey = toNonEmptyString(left.key) ?? '';
      const rightKey = toNonEmptyString(right.key) ?? '';
      return leftKey.localeCompare(rightKey, 'fr', { sensitivity: 'base' });
    });

  return JSON.stringify(normalized);
}

function toNumericId(value?: string): number | undefined {
  if (!value) {
    return undefined;
  }
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function collectInternalUserRecords(value: unknown): Record<string, unknown>[] {
  if (!value) {
    return [];
  }
  if (Array.isArray(value)) {
    return value.filter(
      (entry): entry is Record<string, unknown> => typeof entry === 'object' && entry !== null,
    );
  }
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const nested: Record<string, unknown>[] = [];
    for (const key of [
      'result',
      'Result',
      'Recordset',
      'recordset',
      'records',
      'rows',
      'data',
    ]) {
      if (key in record) {
        nested.push(...collectInternalUserRecords(record[key]));
      }
    }
    if (nested.length > 0) {
      return nested;
    }
    return [record];
  }
  return [];
}

function extractInternalUserId(
  internalUser?: DatabaseUserLookupResponse | null,
): number | undefined {
  if (!internalUser) {
    return undefined;
  }

  const record = internalUser as Record<string, unknown>;
  const resultBuckets: Record<string, unknown>[] = [];

  if ('result' in record) {
    resultBuckets.push(...collectInternalUserRecords(record['result']));
  }
  if ('Result' in record) {
    resultBuckets.push(...collectInternalUserRecords(record['Result']));
  }

  const candidates = resultBuckets.length
    ? resultBuckets
    : collectInternalUserRecords(record);

  if (!candidates.length) {
    for (const key of ['Recordset', 'recordset', 'records', 'rows', 'data']) {
      if (key in record) {
        candidates.push(...collectInternalUserRecords(record[key]));
      }
      if (candidates.length) {
        break;
      }
    }
  }

  for (const candidate of candidates) {
    const possibleId =
      candidate['userId'] ??
      candidate['UserId'] ??
      candidate['userID'] ??
      candidate['USERID'] ??
      candidate['id'] ??
      candidate['ID'];
    const numericId = toNumberValue(possibleId);
    if (numericId !== undefined) {
      return numericId;
    }
  }

  return undefined;
}

function normalizeRoute(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return trimmed;
  }
  if (/^[a-z]+:\/\//i.test(trimmed)) {
    return trimmed;
  }
  if (trimmed === '/') {
    return '/';
  }
  const normalized = trimmed.replace(/^\/+/, '');
  return `/${normalized}`;
}

function extractModulePath(metadata: ModuleMetadata, key: string): string | null {
  const candidates = [
    toNonEmptyString(metadata.path),
    toNonEmptyString(metadata.url),
    toNonEmptyString(metadata.href),
    toNonEmptyString(metadata.route),
    toNonEmptyString(metadata.externalPath),
    toNonEmptyString(metadata.slug),
    key,
  ];

  for (const candidate of candidates) {
    if (!candidate) {
      continue;
    }
    const normalized = normalizeRoute(candidate);
    if (normalized) {
      return normalized;
    }
  }

  if (key && key.trim().toLowerCase() === 'home') {
    return '/';
  }

  return null;
}

function resolveBadgeValue(badge: unknown, jobCount?: number): number | string | undefined {
  const normalizedJobCount =
    typeof jobCount === 'number' && Number.isFinite(jobCount) && jobCount > 0
      ? Math.trunc(jobCount)
      : undefined;

  const resolvePrimitive = (value: unknown): number | string | undefined => {
    if (typeof value === 'number' && Number.isFinite(value)) {
      if (value <= 0) {
        return undefined;
      }
      if (value === 1 && normalizedJobCount !== undefined) {
        return normalizedJobCount;
      }
      return Math.trunc(value);
    }
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (!trimmed) {
        return undefined;
      }
      const numeric = Number.parseFloat(trimmed);
      if (!Number.isNaN(numeric)) {
        if (numeric <= 0) {
          return undefined;
        }
        if (numeric === 1 && normalizedJobCount !== undefined) {
          return normalizedJobCount;
        }
        return Math.trunc(numeric);
      }
      if (normalizedJobCount !== undefined && trimmed.toLowerCase() === 'jobcount') {
        return normalizedJobCount;
      }
      return trimmed;
    }
    return undefined;
  };

  if (badge === null || badge === undefined) {
    return undefined;
  }

  const primitiveValue = resolvePrimitive(badge);
  if (primitiveValue !== undefined) {
    return primitiveValue;
  }

  if (typeof badge === 'object') {
    const badgeRecord = badge as Record<string, unknown>;

    if (normalizedJobCount !== undefined) {
      const typeValue = toNonEmptyString(badgeRecord.type)?.toLowerCase();
      if (typeValue && ['jobcount', 'count', 'job-count'].includes(typeValue)) {
        return normalizedJobCount;
      }
    }

    if ('value' in badgeRecord) {
      return resolvePrimitive(badgeRecord.value);
    }
  }

  return undefined;
}

const ICON_ALIAS_MAP: Record<string, keyof typeof LucideIcons> = {
  home: 'Home',
  accueil: 'Home',
  dashboard: 'LayoutDashboard',
  annuaire: 'Users',
  collaborateurs: 'Users',
  'qui-fait-quoi': 'Users',
  catalogue: 'BookOpen',
  kiosque: 'Newspaper',
  kiosk: 'Newspaper',
  actualites: 'Newspaper',
  news: 'Newspaper',
  agenda: 'CalendarDays',
  planning: 'CalendarCheck',
  evenement: 'CalendarCheck',
  events: 'CalendarCheck',
  emploi: 'BriefcaseBusiness',
  jobs: 'BriefcaseBusiness',
  recrutement: 'BriefcaseBusiness',
  ressources: 'Boxes',
  ressourceshumaines: 'UserCog',
  rh: 'UserCog',
  formations: 'GraduationCap',
  communication: 'Megaphone',
  contact: 'AtSign',
  annonce: 'Megaphone',
  outils: 'Wrench',
  documentation: 'Files',
  documents: 'Files',
  doc: 'Files',
  support: 'LifeBuoy',
  admin: 'Settings',
  administration: 'Settings',
  parametres: 'Settings',
  configuration: 'SlidersHorizontal',
  statistiques: 'BarChart3',
  rapports: 'BarChart3',
  rapport: 'BarChart3',
  glenart: 'Palette',
  kiosquedoc: 'Newspaper',
  service: 'Building2',
  services: 'Building2',
  operations: 'Workflow',
  procedure: 'Workflow',
  processus: 'Workflow',
  facturation: 'Receipt',
  finance: 'PieChart',
  partenaires: 'Handshake',
};

function normalizeIconKey(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function resolveLucideIcon(name?: string): LucideIcon | null {
  if (!name) {
    return null;
  }
  const normalized = name.trim();
  if (!normalized) {
    return null;
  }

  const sanitized = normalized
    .replace(/^lucide[:\s_-]*/i, '')
    .replace(/^icon[:\s_-]*/i, '')
    .replace(/^uil[:\s_-]*/i, '')
    .replace(/^fa[:\s_-]*/i, '')
    .replace(/icon$/i, '')
    .replace(/[-_\s]+icon$/i, '')
    .replace(/^[^a-z0-9]+/i, '')
    .replace(/[^a-z0-9]+$/i, '');

  const base = sanitized || normalized;
  const segments = base
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean);
  const pascal = segments
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join('');
  const camel = pascal ? pascal.charAt(0).toLowerCase() + pascal.slice(1) : '';
  const upper = base.toUpperCase();
  const lower = base.toLowerCase();
  const kebab = segments.map((part) => part.toLowerCase()).join('-');

  const aliasCandidates = [normalized, sanitized, base, kebab];
  for (const candidate of aliasCandidates) {
    if (!candidate) {
      continue;
    }
    const alias = ICON_ALIAS_MAP[normalizeIconKey(candidate)];
    if (alias) {
      const iconCandidate = LucideIcons[alias as keyof typeof LucideIcons];
      if (iconCandidate) {
        return iconCandidate as LucideIcon;
      }
    }
  }

  const variants = new Set<string>([
    normalized,
    sanitized,
    base,
    pascal,
    camel,
    lower,
    upper,
    kebab,
  ]);

  if (pascal) {
    variants.add(pascal.replace(/\d+$/, (match) => match));
  }

  if (segments.length > 1) {
    variants.add(segments.join(''));
  }

  for (const candidate of variants) {
    if (!candidate) {
      continue;
    }
    const iconCandidate = LucideIcons[candidate as keyof typeof LucideIcons];
    if (iconCandidate) {
      return iconCandidate as LucideIcon;
    }
  }

  return null;
}

function isAdministrationModule(module: SidebarModuleEntry): boolean {
  if (module.section) {
    const normalized = module.section.toLowerCase();
    if (normalized === 'administration' || normalized === 'admin') {
      return true;
    }
  }
  return module.permission.toLowerCase() === 'administration';
}

function SidebarSkeletonList({ count, isExpanded }: { count: number; isExpanded: boolean }) {
  return (
    <ul className="space-y-1" aria-hidden>
      {Array.from({ length: count }).map((_, index) => (
        <li key={`sidebar-skeleton-${index}`}>
          <div
            className={`flex items-center w-full px-2 py-2 rounded-lg bg-white/10 animate-pulse ${
              isExpanded ? 'space-x-3' : 'justify-center'
            }`}
          >
            <div className="h-5 w-5 rounded-full bg-white/30" />
            {isExpanded ? <div className="h-3 flex-1 rounded bg-white/30" /> : null}
          </div>
        </li>
      ))}
    </ul>
  );
}

export function Sidebar({ jobCount, onExpandChange }: SidebarProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isManuallyCollapsed, setIsManuallyCollapsed] = useState(false);
  const collapsedTriggerRef = useRef<HTMLDivElement | null>(null);

  const isExpanded = !isManuallyCollapsed || isHovered;

  const handleSidebarMouseEnter = () => {
    setIsHovered(true);
  };

  const handleSidebarMouseLeave = () => {
    setIsHovered(false);
  };

  const handleCollapsedTriggerHover = () => {
    if (isManuallyCollapsed) {
      setIsHovered(true);
    }
  };

  const handleCollapsedHeaderHover = () => {
    if (isManuallyCollapsed) {
      setIsHovered(true);
    }
  };

  const handleCollapsedTriggerKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!isManuallyCollapsed) {
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setIsHovered(true);
    }
  };

  const handleSidebarBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!isManuallyCollapsed) {
      return;
    }

    const nextFocused = event.relatedTarget;
    if (!nextFocused) {
      setIsHovered(false);
      return;
    }

    if (!(nextFocused instanceof Node)) {
      setIsHovered(false);
      return;
    }

    if (!event.currentTarget.contains(nextFocused)) {
      setIsHovered(false);
    }
  };

  useEffect(() => {
    const triggerNode = collapsedTriggerRef.current;
    if (!triggerNode) {
      return;
    }

    const handlePointerEnter = () => {
      if (isManuallyCollapsed) {
        setIsHovered(true);
      }
    };

    triggerNode.addEventListener('mouseenter', handlePointerEnter);
    triggerNode.addEventListener('focusin', handlePointerEnter);

    return () => {
      triggerNode.removeEventListener('mouseenter', handlePointerEnter);
      triggerNode.removeEventListener('focusin', handlePointerEnter);
    };
  }, [isManuallyCollapsed]);

  useEffect(() => {
    onExpandChange?.(isExpanded);
  }, [isExpanded, onExpandChange]);

  const { user: authUser } = useAuth();
  const { data: currentUser, isLoading: loadingCurrentUser } = useCurrentUser();
  const { data: groups = [], isLoading: loadingGroups } = useAdminGroups();
  const internalUserId = useMemo(
    () => extractInternalUserId(authUser?.internalUser),
    [authUser?.internalUser],
  );
  const currentUserId = toNumericId(currentUser?.id);
  const sidebarUserId = internalUserId ?? currentUserId;
  const lastModuleFingerprintRef = useRef<string | null>(null);
  useEffect(() => {
    if (internalUserId !== undefined) {
      console.log('Identifiant utilisateur interne détecté :', internalUserId);
    }
  }, [internalUserId]);
  useEffect(() => {
    if (internalUserId === undefined && currentUserId !== undefined) {
      console.log(
        "Identifiant utilisateur récupéré depuis l'API d'administration :",
        currentUserId,
      );
    }
  }, [currentUserId, internalUserId]);
  const {
    data: moduleDefinitions,
    isLoading: loadingModules,
    isFetching: fetchingModules,
    isError: hasModuleError,
    error: moduleError,
  } = useSidebarModules(sidebarUserId);
  const waitingForModules = loadingModules || fetchingModules || sidebarUserId === undefined;
  useEffect(() => {
    lastModuleFingerprintRef.current = null;
  }, [sidebarUserId]);
  useEffect(() => {
    if (!moduleDefinitions || waitingForModules || hasModuleError) {
      return;
    }

    const fingerprint = createModuleFingerprint(moduleDefinitions);

    if (lastModuleFingerprintRef.current === null) {
      lastModuleFingerprintRef.current = fingerprint;
      return;
    }

    if (lastModuleFingerprintRef.current !== fingerprint) {
      console.info(
        "Changement détecté dans les modules — rechargement de la page pour refléter l'état de la base de données.",
      );
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    }
  }, [moduleDefinitions, waitingForModules, hasModuleError]);

  const accessiblePermissions = useMemo(() => {
    if (!currentUser) {
      return new Set<PermissionKey>();
    }
    return new Set(computeEffectivePermissions(currentUser, groups));
  }, [currentUser, groups]);

  const processedModules = useMemo(() => {
    if (!moduleDefinitions) {
      return [];
    }

    const items: SidebarModuleEntry[] = [];

    moduleDefinitions.forEach((definition, index) => {
      if (definition.type !== 'module') {
        return;
      }

      const metadata = (definition.metadata ?? {}) as ModuleMetadata;

      if (!resolveBoolean(metadata.isActive, true)) {
        return;
      }

      const path = extractModulePath(metadata, definition.key);
      if (!path) {
        return;
      }

      const id =
        toNonEmptyString(metadata.id) ??
        toNonEmptyString(metadata.slug) ??
        definition.key ??
        `module-${index + 1}`;

      const label = definition.label ?? id;

      const permissionKey = (toNonEmptyString(metadata.permissionKey) ?? definition.key) as PermissionKey;
      const normalizedPermission = permissionKey.trim().toLowerCase() as PermissionKey;

      const iconName = toNonEmptyString(metadata.icon);
      let icon = resolveLucideIcon(iconName);

      if (!icon) {
        const fallbackIconCandidates = [
          toNonEmptyString(metadata.slug),
          toNonEmptyString(metadata.path),
          definition.label,
          definition.key,
        ];

        for (const candidate of fallbackIconCandidates) {
          icon = resolveLucideIcon(candidate ?? undefined);
          if (icon) {
            break;
          }
        }
      }

      const badge = resolveBadgeValue(metadata.badge, jobCount);
      const order = toNumberValue(metadata.order) ?? index;
      const section = toNonEmptyString(metadata.section)?.toLowerCase();

      const entry: SidebarModuleEntry = {
        id,
        label,
        path,
        permission: normalizedPermission,
        icon,
        badge,
        order,
        section,
      };

      items.push(entry);
    });

    return items.sort((left, right) => {
      if (left.order !== right.order) {
        return left.order - right.order;
      }
      return left.label.localeCompare(right.label, 'fr', { sensitivity: 'base' });
    });
  }, [moduleDefinitions, jobCount]);

  const showAllMenus = loadingCurrentUser || loadingGroups || waitingForModules || !currentUser;

  const userCanAccess = (permission: PermissionKey) => {
    if (showAllMenus) {
      return true;
    }
    if (currentUser?.isSuperAdmin) {
      return true;
    }
    return accessiblePermissions.has(permission);
  };

  const location = useDecryptedLocation();

  const mainMenuItems = processedModules.filter(
    (item) => !isAdministrationModule(item) && userCanAccess(item.permission),
  );
  const adminMenuItems = processedModules.filter(
    (item) => isAdministrationModule(item) && userCanAccess(item.permission),
  );

  const moduleErrorMessage =
    hasModuleError && moduleError
      ? moduleError instanceof Error
        ? moduleError.message
        : String(moduleError)
      : null;

  return (
    <div
      className={`bg-primary text-primary-foreground flex flex-col h-screen transition-all duration-300 ease-in-out relative ${
        isExpanded ? 'w-64' : 'w-16'
      }`}
      onMouseEnter={handleSidebarMouseEnter}
      onMouseLeave={handleSidebarMouseLeave}
      onBlurCapture={handleSidebarBlur}
    >
      {/* Header */}
      <div
        className={`h-16 px-4 border-b border-red-400/50 flex items-center ${
          isExpanded ? 'justify-between' : 'justify-center'
        } min-h-[64px]`}
        onMouseEnter={handleCollapsedHeaderHover}
        onFocus={handleCollapsedHeaderHover}
      >
        <div
          ref={collapsedTriggerRef}
          className={`flex items-center gap-2 overflow-hidden ${
            isManuallyCollapsed ? 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/60 rounded-md' : ''
          }`}
          onMouseEnter={handleCollapsedTriggerHover}
          onFocus={handleCollapsedTriggerHover}
          onKeyDown={handleCollapsedTriggerKeyDown}
          role={isManuallyCollapsed ? 'button' : undefined}
          tabIndex={isManuallyCollapsed ? 0 : -1}
          aria-label={
            isManuallyCollapsed ? 'Afficher temporairement la barre latérale' : undefined
          }
        >
          {isExpanded ? (
            <img
              src={Logo}
              alt="Logo Glénat"
              className="h-8 w-auto flex-shrink-0 transition-opacity duration-200"
            />
          ) : (
            <img
              src={LogoCompact}
              alt="Monogramme Glénat"
              className="h-10 w-10 flex-shrink-0 transition-transform duration-200"
            />
          )}
        </div>

        {isExpanded ? (
          <button
            onClick={() => {
              setIsManuallyCollapsed((previous) => !previous);
              setIsHovered(false);
            }}
            className="p-1 rounded transition-all duration-300 hover:bg-white/20"
            title={isManuallyCollapsed ? 'Déplier la sidebar' : 'Replier la sidebar'}
          >
            <PanelLeft className={`h-4 w-4 transition-transform ${isManuallyCollapsed ? 'rotate-180' : ''}`} />
          </button>
        ) : null}
      </div>

      {/* Contenu principal = menu du haut + administration séparée */}
      <div className="flex-1 min-h-0 flex flex-col justify-between">
        {/* Menu principal */}
        <nav className="p-2">
          {waitingForModules ? (
            <SidebarSkeletonList count={6} isExpanded={isExpanded} />
          ) : (
            <ul className="space-y-1">
              {mainMenuItems.map((item) => {
                const isInternalLink = item.path.startsWith('/');
                const isActive = isInternalLink
                  ? item.path === '/'
                    ? location.pathname === '/'
                    : location.pathname.startsWith(item.path)
                  : false;

                return (
                  <li key={item.id}>
                    <SecureNavLink
                      to={item.path}
                      className={`relative flex items-center w-full px-2 py-2 rounded-lg transition-all duration-300 group ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'text-red-100 hover:bg-white/10 hover:text-white'
                      } ${isExpanded ? 'space-x-3' : 'justify-center'}`}
                      title={!isExpanded ? item.label : ''}
                    >
                      {item.icon ? (
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                      ) : (
                        <span className="h-5 w-5 flex-shrink-0 flex items-center justify-center rounded-full bg-white/20 text-xs font-semibold uppercase">
                          {item.label.charAt(0)}
                        </span>
                      )}
                      <span
                        className={`font-medium transition-all duration-300 whitespace-nowrap ${
                          isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'
                        }`}
                      >
                        {item.label}
                      </span>
                      {item.badge !== undefined ? (
                        <span className="absolute -top-[6px] -right-[6px] bg-white text-primary text-xs font-bold rounded-full px-1 min-h-[20px] min-w-[20px] flex items-center justify-center">
                          {item.badge}
                        </span>
                      ) : null}
                    </SecureNavLink>
                  </li>
                );
              })}
            </ul>
          )}
          {hasModuleError && moduleErrorMessage ? (
            <div className="mt-3 text-xs text-red-100/80 bg-black/20 rounded-lg px-3 py-2">
              Impossible de charger le menu ({moduleErrorMessage}).
            </div>
          ) : null}
        </nav>

        {/* Bloc Administration */}
        <nav className="p-2">
          {waitingForModules ? (
            <SidebarSkeletonList count={2} isExpanded={isExpanded} />
          ) : (
            <ul>
              {adminMenuItems.map((item) => {
                const isInternalLink = item.path.startsWith('/');
                const isActive = isInternalLink
                  ? item.path === '/'
                    ? location.pathname === '/'
                    : location.pathname.startsWith(item.path)
                  : false;

                return (
                  <li key={item.id}>
                    <SecureNavLink
                      to={item.path}
                      className={`flex items-center w-full px-2 py-2 rounded-lg transition-all duration-300 group ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'text-red-100 hover:bg-white/10 hover:text-white'
                      } ${isExpanded ? 'space-x-3' : 'justify-center'}`}
                      title={!isExpanded ? item.label : ''}
                    >
                      {item.icon ? (
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                      ) : (
                        <span className="h-5 w-5 flex-shrink-0 flex items-center justify-center rounded-full bg-white/20 text-xs font-semibold uppercase">
                          {item.label.charAt(0)}
                        </span>
                      )}
                      <span
                        className={`font-medium transition-all duration-300 whitespace-nowrap ${
                          isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'
                        }`}
                      >
                        {item.label}
                      </span>
                    </SecureNavLink>
                  </li>
                );
              })}
            </ul>
          )}
        </nav>
      </div>

      {/* Footer */}
      <div className="h-12 flex-none border-t border-red-400/50 flex items-center px-4">
        <div className={`text-xs text-red-100 transition-all duration-300 ${
          isExpanded ? 'opacity-100' : 'opacity-0'
        }`}>
          Version 1.0.0
        </div>
      </div>
    </div>
  );
}
