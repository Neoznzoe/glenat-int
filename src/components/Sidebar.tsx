import {
  Home,
  Calendar,
  Users,
  Files,
  Settings,
  Pin,
  PinOff,
  UserRoundSearch,
  Info,
  BriefcaseBusiness,
  CalendarDays,
  Signature,
  CalendarClock,
  SquareUserRound,
  PersonStanding,
  Hammer,
  LibraryBig,
  Newspaper,
  Store,
  LayoutGrid,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useState, useEffect, useMemo, useCallback } from 'react';
import Logo from '../assets/logos/glenat/glenat_white.svg';
import LogoG from '../assets/logos/glenat/glenat_G.svg';
import { useCurrentUser, usePermissionDefinitions } from '@/hooks/useAdminData';
import type { PermissionDefinition, PermissionKey } from '@/lib/access-control';
import { useDecryptedLocation } from '@/lib/secureRouting';
import { SecureNavLink } from '@/components/routing/SecureLink';

interface SidebarProps {
  jobCount?: number;
  onExpandChange?: (expanded: boolean) => void;
}

interface SidebarMenuItem {
  id: string;
  icon: LucideIcon;
  label: string;
  path: string;
  permission: PermissionKey;
  badge?: number;
  section: 'main' | 'admin';
}

interface ModuleConfig {
  id?: string;
  label?: string;
  path?: string;
  icon?: LucideIcon;
  section?: 'main' | 'admin';
  permissionOverride?: PermissionKey;
  getBadge?: (context: { jobCount?: number }) => number | undefined;
}

const DEFAULT_ICON: LucideIcon = LayoutGrid;

const MODULE_CONFIGS: Record<string, ModuleConfig> = {
  home: { id: 'home', label: 'Accueil', path: '/', icon: Home },
  qui: { id: 'qui', label: 'Qui fait quoi', path: '/qui', icon: UserRoundSearch },
  catalogue: {
    id: 'catalogue',
    label: 'Catalogue',
    path: '/catalogue/offices',
    icon: LibraryBig,
  },
  kiosque: {
    id: 'kiosque',
    label: 'Kiosque',
    path: '/catalogue/kiosque',
    icon: Store,
    permissionOverride: 'catalogue',
  },
  doc: { id: 'doc', label: "Glénat'Doc", path: '/doc', icon: Files },
  fee: { id: 'fee', label: "Glénat'Fée", path: '/fee', icon: Users },
  agenda: { id: 'agenda', label: 'Agenda', path: '/agenda', icon: Calendar },
  planning: { id: 'planning', label: 'Planning', path: '/planning', icon: CalendarDays },
  contrats: { id: 'contrats', label: 'Contrats', path: '/contrats', icon: Signature },
  rh: { id: 'rh', label: 'Ressources humaines', path: '/rh', icon: PersonStanding },
  temps: {
    id: 'temps',
    label: 'Saisie des temps',
    path: '/temps',
    icon: CalendarClock,
  },
  atelier: { id: 'atelier', label: 'Travaux atelier', path: '/atelier', icon: Hammer },
  espace: { id: 'espace', label: 'Mon espace', path: '/espace', icon: SquareUserRound },
  emploi: {
    id: 'emploi',
    label: 'Emploi',
    path: '/emploi',
    icon: BriefcaseBusiness,
    getBadge: ({ jobCount }) => jobCount,
  },
  annonces: {
    id: 'annonces',
    label: 'Petites annonces',
    path: '/annonces',
    icon: Newspaper,
  },
  services: { id: 'services', label: 'Services', path: '/services', icon: Info },
  administration: {
    id: 'administration',
    label: 'Administration',
    path: '/administration',
    icon: Settings,
    section: 'admin',
  },
};

const MODULE_ORDER = [
  'home',
  'qui',
  'catalogue',
  'kiosque',
  'doc',
  'fee',
  'agenda',
  'planning',
  'contrats',
  'rh',
  'temps',
  'atelier',
  'espace',
  'emploi',
  'annonces',
  'services',
  'administration',
];

function humanizeKey(value: string): string {
  if (!value) {
    return value;
  }
  const cleaned = value.replace(/^page:/, '').replace(/[_:-]+/g, ' ');
  return cleaned
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function isTruthy(value: unknown): boolean {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'number') {
    return value !== 0;
  }
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (!normalized) {
      return false;
    }
    return ['1', 'true', 'oui', 'yes', 'on', 'actif', 'active'].includes(normalized);
  }
  return false;
}

function normalizePermissionKey(value: PermissionKey | undefined): PermissionKey | null {
  if (!value) {
    return null;
  }
  return value.trim().toLowerCase() as PermissionKey;
}

function createMenuItem(
  key: string,
  definition: PermissionDefinition | undefined,
  context: { jobCount?: number },
): SidebarMenuItem | null {
  const slug =
    definition && typeof definition.metadata?.slug === 'string'
      ? (definition.metadata.slug as string)
      : undefined;
  const normalizedSlug = slug?.toLowerCase();
  const config =
    MODULE_CONFIGS[key] ??
    (slug ? MODULE_CONFIGS[slug] : undefined) ??
    (normalizedSlug ? MODULE_CONFIGS[normalizedSlug] : undefined);
  if (!definition && !config) {
    return null;
  }

  if (definition?.metadata && 'isActive' in definition.metadata) {
    const rawActive = definition.metadata.isActive;
    if (!isTruthy(rawActive)) {
      return null;
    }
  }

  const resolvedKey = (definition?.key ?? key) as PermissionKey;
  const permission = config?.permissionOverride ?? resolvedKey;
  const id = config?.id ?? definition?.key ?? key;
  const icon = config?.icon ?? DEFAULT_ICON;
  const label = definition?.label ?? config?.label ?? humanizeKey(key);
  const basePath = config?.path ?? (definition ? `/${definition.key}` : undefined);
  if (!basePath) {
    return null;
  }

  const badge = config?.getBadge?.(context);

  return {
    id,
    icon,
    label,
    path: basePath,
    permission,
    badge,
    section: config?.section ?? 'main',
  };
}

function buildMenuItems(
  definitions: PermissionDefinition[] | undefined,
  context: { jobCount?: number },
): SidebarMenuItem[] {
  const moduleDefinitions = (definitions ?? []).filter(
    (definition) => definition.type !== 'page' && (definition.parentKey === null || definition.parentKey === undefined),
  );

  const definitionByKey = new Map(moduleDefinitions.map((definition) => [definition.key, definition]));
  const items: SidebarMenuItem[] = [];
  const seen = new Set<string>();

  const addItem = (key: string, definition?: PermissionDefinition) => {
    const item = createMenuItem(key, definition, context);
    if (item) {
      items.push(item);
      seen.add(key);
    }
  };

  for (const key of MODULE_ORDER) {
    addItem(key, definitionByKey.get(key));
  }

  for (const definition of moduleDefinitions) {
    if (seen.has(definition.key)) {
      continue;
    }
    addItem(definition.key, definition);
  }

  return items;
}

export function Sidebar({ jobCount, onExpandChange }: SidebarProps) {
  const [isPinned, setIsPinned] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const isExpanded = isPinned || isHovered;

  useEffect(() => {
    onExpandChange?.(isExpanded);
  }, [isExpanded, onExpandChange]);

  const { data: currentUser, isLoading: loadingCurrentUser } = useCurrentUser();
  const { data: permissionDefinitions, isLoading: loadingPermissions } = usePermissionDefinitions();

  const isLoadingData = loadingCurrentUser || loadingPermissions;

  const { allowedPermissions, deniedPermissions } = useMemo(() => {
    const overrides = currentUser?.permissionOverrides ?? [];
    const allowed = new Set<PermissionKey>();
    const denied = new Set<PermissionKey>();

    for (const override of overrides) {
      const normalized = normalizePermissionKey(override.key);
      if (!normalized) {
        continue;
      }
      if (override.mode === 'allow') {
        allowed.add(normalized);
      } else if (override.mode === 'deny') {
        denied.add(normalized);
      }
    }

    return { allowedPermissions: allowed, deniedPermissions: denied };
  }, [currentUser?.permissionOverrides]);

  const menuItems = useMemo(
    () => buildMenuItems(permissionDefinitions, { jobCount }),
    [permissionDefinitions, jobCount],
  );

  const userCanAccess = useCallback(
    (permission: PermissionKey) => {
      if (isLoadingData || !currentUser) {
        return false;
      }

      if (currentUser.isSuperAdmin) {
        return true;
      }

      const normalized = normalizePermissionKey(permission);
      if (!normalized) {
        return false;
      }

      if (deniedPermissions.has(normalized)) {
        return false;
      }

      if (allowedPermissions.size > 0) {
        return allowedPermissions.has(normalized);
      }

      return true;
    },
    [allowedPermissions, deniedPermissions, currentUser, isLoadingData],
  );

  const location = useDecryptedLocation();

  const mainMenuItems = menuItems.filter(
    (item) => item.section === 'main' && userCanAccess(item.permission),
  );
  const adminMenuItems = menuItems.filter(
    (item) => item.section === 'admin' && userCanAccess(item.permission),
  );

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
          <ul className="space-y-1">
            {mainMenuItems.map((item) => {
                const isActive = item.path === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(item.path);
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
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      <span
                        className={`font-medium transition-all duration-300 whitespace-nowrap ${
                          isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'
                        }`}
                      >
                        {item.label}
                      </span>
                      {item.badge !== undefined ? (
                        <span className="absolute -top-[5px] -right-[5px] bg-white text-primary text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                          {item.badge}
                        </span>
                      ) : null}
                    </SecureNavLink>
                  </li>
                );
              })}
          </ul>
        </nav>

        {/* Bloc Administration */}
        <nav className="p-2">
          <ul>
            {adminMenuItems.map((item) => {
                const isActive = item.path === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(item.path);
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
                      <item.icon className="h-5 w-5 flex-shrink-0" />
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
