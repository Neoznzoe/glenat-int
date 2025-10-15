import * as LucideIcons from 'lucide-react';
import { Pin, PinOff } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import Logo from '../assets/logos/glenat/glenat_white.svg';
import LogoG from '../assets/logos/glenat/glenat_G.svg';
import { useCurrentUser, useAdminGroups } from '@/hooks/useAdminData';
import { useSidebarModules } from '@/hooks/useModules';
import { computeEffectivePermissions } from '@/lib/mockDb';
import type { PermissionKey } from '@/lib/access-control';
import { useDecryptedLocation } from '@/lib/secureRouting';
import { SecureNavLink } from '@/components/routing/SecureLink';

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
  if (typeof badge === 'number' && Number.isFinite(badge)) {
    return badge;
  }
  if (typeof badge === 'string') {
    const trimmed = badge.trim();
    if (!trimmed) {
      return undefined;
    }
    const numeric = Number.parseInt(trimmed, 10);
    if (!Number.isNaN(numeric)) {
      return numeric;
    }
    if (jobCount !== undefined && trimmed.toLowerCase() === 'jobcount') {
      return jobCount;
    }
    return trimmed;
  }
  if (typeof badge === 'object' && badge !== null) {
    const badgeRecord = badge as Record<string, unknown>;
    if (badgeRecord.type && jobCount !== undefined) {
      const typeValue = toNonEmptyString(badgeRecord.type);
      if (typeValue && typeValue.toLowerCase() === 'jobcount') {
        return jobCount;
      }
    }
    if (badgeRecord.value !== undefined) {
      if (typeof badgeRecord.value === 'number' && Number.isFinite(badgeRecord.value)) {
        return badgeRecord.value;
      }
      if (typeof badgeRecord.value === 'string') {
        const trimmed = badgeRecord.value.trim();
        if (trimmed) {
          return trimmed;
        }
      }
    }
  }
  return undefined;
}

function resolveLucideIcon(name?: string): LucideIcon | null {
  if (!name) {
    return null;
  }
  const normalized = name.trim();
  if (!normalized) {
    return null;
  }

  const base = normalized.replace(/icon$/i, '');
  const variants = new Set<string>([
    normalized,
    base,
    base.toLowerCase(),
    base.charAt(0).toUpperCase() + base.slice(1),
    base
      .split(/[\s_-]+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(''),
  ]);

  for (const candidate of variants) {
    if (!candidate) {
      continue;
    }
    const iconCandidate = LucideIcons[candidate as keyof typeof LucideIcons];
    if (typeof iconCandidate === 'function') {
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
  const [isPinned, setIsPinned] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const isExpanded = isPinned || isHovered;

  useEffect(() => {
    onExpandChange?.(isExpanded);
  }, [isExpanded, onExpandChange]);

  const { data: currentUser, isLoading: loadingCurrentUser } = useCurrentUser();
  const { data: groups = [], isLoading: loadingGroups } = useAdminGroups();
  const {
    data: moduleDefinitions,
    isLoading: loadingModules,
    isError: hasModuleError,
    error: moduleError,
  } = useSidebarModules();

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
      const icon = resolveLucideIcon(iconName);

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

  const showAllMenus = loadingCurrentUser || loadingGroups || !currentUser;

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
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      <div className="h-16 p-4 border-b border-red-400/50 flex items-center justify-between min-h-[64px]">
        {isExpanded ? (
          <img src={Logo} alt="Logo Glénat" className="h-8 w-auto flex-shrink-0" />
        ) : (
          <img src={LogoG} alt="Logo Glénat" className="h-8 w-auto flex-shrink-0" />
        )}
        
        <button
          onClick={() => setIsPinned(!isPinned)}
          className={`p-1 rounded hover:bg-white/20 transition-all duration-300 ${
            isExpanded ? 'opacity-100' : 'opacity-0'
          }`}
          title={isPinned ? 'Déverrouiller la sidebar' : 'Verrouiller la sidebar'}
        >
          {isPinned ? <Pin className="h-4 w-4" /> : <PinOff className="h-4 w-4" />}
        </button>
      </div>

      {/* Contenu principal = menu du haut + administration séparée */}
      <div className="flex-1 min-h-0 flex flex-col justify-between">
        {/* Menu principal */}
        <nav className="p-2">
          {loadingModules ? (
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
          {loadingModules ? (
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
