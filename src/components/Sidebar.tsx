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
} from 'lucide-react';
import { useState, useEffect, useMemo, useCallback } from 'react';
import Logo from '../assets/logos/glenat/glenat_white.svg';
import LogoG from '../assets/logos/glenat/glenat_G.svg';
import {
  useCurrentUser,
  useAdminGroups,
  usePermissionDefinitions,
  useUserModuleOverrides,
} from '@/hooks/useAdminData';
import { computeEffectivePermissions } from '@/lib/mockDb';
import { BASE_PERMISSIONS, PERMISSION_DEFINITIONS } from '@/lib/access-control';
import type { PermissionKey } from '@/lib/access-control';
import { useDecryptedLocation } from '@/lib/secureRouting';
import { SecureNavLink } from '@/components/routing/SecureLink';

type SidebarMenuItemConfig = {
  id: string;
  icon: typeof Home;
  label: string;
  path: string;
  permission: PermissionKey;
  aliases?: Array<string | number>;
  usesJobCountBadge?: boolean;
};

type SidebarMenuItem = SidebarMenuItemConfig & { badge?: number; moduleId?: string };

const MENU_ITEM_CONFIG: SidebarMenuItemConfig[] = [
  { id: 'home', icon: Home, label: 'Accueil', path: '/', permission: 'home', aliases: ['accueil'] },
  {
    id: 'qui',
    icon: UserRoundSearch,
    label: 'Qui fait quoi',
    path: '/qui',
    permission: 'qui',
    aliases: ['qui fait quoi', 'annuaire', 'qui-fait-quoi'],
  },
  {
    id: 'catalogue',
    icon: LibraryBig,
    label: 'Catalogue',
    path: '/catalogue/offices',
    permission: 'catalogue',
    aliases: ['catalogue'],
  },
  {
    id: 'kiosque',
    icon: Store,
    label: 'Kiosque',
    path: '/catalogue/kiosque',
    permission: 'catalogue',
    aliases: ['kiosque'],
  },
  {
    id: 'doc',
    icon: Files,
    label: "Glénat'Doc",
    path: '/doc',
    permission: 'doc',
    aliases: ["glenatdoc", "glenat-doc", "glénatdoc"],
  },
  {
    id: 'fee',
    icon: Users,
    label: "Glénat'Fée",
    path: '/fee',
    permission: 'fee',
    aliases: ["glenatfee", "glenat-fee", "glénatfée"],
  },
  { id: 'agenda', icon: Calendar, label: 'Agenda', path: '/agenda', permission: 'agenda' },
  {
    id: 'planning',
    icon: CalendarDays,
    label: 'Planning',
    path: '/planning',
    permission: 'planning',
  },
  {
    id: 'contrats',
    icon: Signature,
    label: 'Contrats',
    path: '/contrats',
    permission: 'contrats',
  },
  {
    id: 'rh',
    icon: PersonStanding,
    label: 'Ressources humaines',
    path: '/rh',
    permission: 'rh',
    aliases: ['ressources humaines', 'rh'],
  },
  {
    id: 'temps',
    icon: CalendarClock,
    label: 'Saisie des temps',
    path: '/temps',
    permission: 'temps',
    aliases: ['saisie des temps'],
  },
  {
    id: 'atelier',
    icon: Hammer,
    label: 'Travaux atelier',
    path: '/atelier',
    permission: 'atelier',
    aliases: ['travaux atelier'],
  },
  {
    id: 'espace',
    icon: SquareUserRound,
    label: 'Mon espace',
    path: '/espace',
    permission: 'espace',
    aliases: ['mon espace'],
  },
  {
    id: 'emploi',
    icon: BriefcaseBusiness,
    label: 'Emploi',
    path: '/emploi',
    permission: 'emploi',
    aliases: ['emploi'],
    usesJobCountBadge: true,
  },
  {
    id: 'annonces',
    icon: Newspaper,
    label: 'Petites annonces',
    path: '/annonces',
    permission: 'annonces',
    aliases: ['petites annonces', 'annonces'],
  },
  { id: 'services', icon: Info, label: 'Services', path: '/services', permission: 'services' },
  {
    id: 'administration',
    icon: Settings,
    label: 'Administration',
    path: '/administration',
    permission: 'administration',
  },
];

const BASE_PERMISSION_ALIAS_GROUPS: Record<PermissionKey, Array<string | number>> = {
  home: ['accueil'],
  qui: ['qui fait quoi', 'annuaire'],
  espace: ['mon espace'],
};

function normalizePermissionAlias(value: unknown): string | null {
  if (typeof value === 'number') {
    return value.toString();
  }
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  return trimmed
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’']/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

interface SidebarProps {
  jobCount?: number;
  onExpandChange?: (expanded: boolean) => void;
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
  const { data: permissionDefinitions = [], isLoading: loadingPermissions } = usePermissionDefinitions();
  const userIdForOverrides = currentUser?.id;
  const { data: moduleOverrideData, isLoading: loadingModuleOverrides } = useUserModuleOverrides(
    userIdForOverrides,
  );

  const moduleOverrides = useMemo(
    () => moduleOverrideData?.overrides ?? [],
    [moduleOverrideData],
  );
  const deniedModuleIdList = useMemo(
    () => moduleOverrideData?.deniedModuleIds ?? [],
    [moduleOverrideData],
  );

  const resolvedPermissionDefinitions = useMemo(
    () => (permissionDefinitions.length ? permissionDefinitions : PERMISSION_DEFINITIONS),
    [permissionDefinitions],
  );

  const modulePermissionMap = useMemo(() => {
    const map = new Map<string, PermissionKey>();

    const register = (value: unknown, key: PermissionKey, force = false) => {
      const normalized = normalizePermissionAlias(value);
      if (!normalized) {
        return;
      }
      if (!force && map.has(normalized)) {
        return;
      }
      map.set(normalized, key);
    };

    for (const legacy of PERMISSION_DEFINITIONS) {
      if (legacy.type && legacy.type !== 'module') {
        continue;
      }
      register(legacy.key, legacy.key);
      register(legacy.label, legacy.key);
    }

    for (const definition of resolvedPermissionDefinitions) {
      if (definition.type && definition.type !== 'module') {
        continue;
      }
      register(definition.key, definition.key, true);
      register(definition.label, definition.key, true);
      if (definition.metadata) {
        const { id, slug } = definition.metadata;
        if (slug) {
          register(slug, definition.key, true);
        }
        if (typeof id === 'number' || typeof id === 'string') {
          register(id, definition.key, true);
        }
      }
    }

    for (const legacy of PERMISSION_DEFINITIONS) {
      if (legacy.type && legacy.type !== 'module') {
        continue;
      }
      const normalizedLabel = normalizePermissionAlias(legacy.label);
      if (!normalizedLabel) {
        continue;
      }
      const resolvedKey = map.get(normalizedLabel);
      if (resolvedKey) {
        register(legacy.key, resolvedKey, true);
      }
    }

    return map;
  }, [resolvedPermissionDefinitions]);

  const permissionKeyToModuleId = useMemo(() => {
    const map = new Map<PermissionKey, string>();
    for (const definition of resolvedPermissionDefinitions) {
      if (definition.type && definition.type !== 'module') {
        continue;
      }
      const metadataId = definition.metadata?.id;
      if (typeof metadataId === 'string' || typeof metadataId === 'number') {
        map.set(definition.key as PermissionKey, metadataId.toString());
      }
    }
    return map;
  }, [resolvedPermissionDefinitions]);

  const resolvePermissionKey = useCallback(
    (fallbackKey: PermissionKey, aliases: Array<string | number | undefined> = []) => {
      const candidates: Array<string | number | undefined> = [fallbackKey, ...aliases];
      for (const candidate of candidates) {
        const normalized = normalizePermissionAlias(candidate);
        if (!normalized) {
          continue;
        }
        const resolved = modulePermissionMap.get(normalized);
        if (resolved) {
          return resolved;
        }
      }
      return fallbackKey;
    },
    [modulePermissionMap],
  );

  const resolvedBasePermissions = useMemo(() => {
    const resolved = Object.entries(BASE_PERMISSION_ALIAS_GROUPS).map(([fallback, aliases]) =>
      resolvePermissionKey(fallback as PermissionKey, aliases),
    );
    const unique = Array.from(new Set(resolved));
    return unique.length ? unique : BASE_PERMISSIONS;
  }, [resolvePermissionKey]);

  const resolvedMenuItems = useMemo<SidebarMenuItem[]>(() => {
    return MENU_ITEM_CONFIG.map((item) => {
      const aliases = [item.label, item.id, ...(item.aliases ?? [])];
      const permission = resolvePermissionKey(item.permission, aliases);
      return {
        ...item,
        permission,
        badge: item.usesJobCountBadge ? jobCount : undefined,
        moduleId: permissionKeyToModuleId.get(permission),
      };
    });
  }, [jobCount, resolvePermissionKey, permissionKeyToModuleId]);

  const isAccessControlLoading =
    loadingCurrentUser || loadingGroups || loadingPermissions || loadingModuleOverrides;
  const isAccessDataReady = !isAccessControlLoading && Boolean(currentUser);
  const shouldShowMenuSkeleton = !isAccessDataReady && isAccessControlLoading;

  const deniedPermissions = useMemo(() => {
    if (!moduleOverrides.length) {
      return new Set<PermissionKey>();
    }
    return new Set(
      moduleOverrides
        .filter((override) => override.mode === 'deny')
        .map((override) => resolvePermissionKey(override.key as PermissionKey, [override.key])),
    );
  }, [moduleOverrides, resolvePermissionKey]);

  const deniedModuleIds = useMemo(() => {
    if (!deniedModuleIdList.length) {
      return new Set<string>();
    }
    return new Set(
      deniedModuleIdList
        .map((identifier) => (typeof identifier === 'string' ? identifier.trim() : String(identifier)))
        .filter((identifier) => identifier.length > 0),
    );
  }, [deniedModuleIdList]);

  const accessiblePermissions = useMemo(() => {
    if (!isAccessDataReady || !currentUser) {
      return new Set<PermissionKey>();
    }
    const computed = new Set(
      computeEffectivePermissions(currentUser, groups, resolvedPermissionDefinitions, resolvedBasePermissions),
    );
    for (const denied of deniedPermissions) {
      computed.delete(denied);
    }
    return computed;
  }, [
    currentUser,
    groups,
    isAccessDataReady,
    resolvedPermissionDefinitions,
    resolvedBasePermissions,
    deniedPermissions,
  ]);

  const userCanAccess = (permission: PermissionKey) => {
    if (!isAccessDataReady || !currentUser) {
      return false;
    }
    if (currentUser.isSuperAdmin) {
      return true;
    }
    if (deniedPermissions.has(permission)) {
      return false;
    }
    return accessiblePermissions.has(permission);
  };

  const location = useDecryptedLocation();

  const mainMenuItems = isAccessDataReady
    ? resolvedMenuItems.filter((item) => {
        if (item.id === 'administration') {
          return false;
        }
        if (item.moduleId && deniedModuleIds.has(item.moduleId)) {
          return false;
        }
        return userCanAccess(item.permission);
      })
    : [];
  const adminMenuItems = isAccessDataReady
    ? resolvedMenuItems.filter((item) => {
        if (item.id !== 'administration') {
          return false;
        }
        if (item.moduleId && deniedModuleIds.has(item.moduleId)) {
          return false;
        }
        return userCanAccess(item.permission);
      })
    : [];

  const renderMenuSkeleton = (count: number) => (
    <ul className="space-y-1">
      {Array.from({ length: count }).map((_, index) => (
        <li key={`sidebar-skeleton-${index}`}>
          <div
            className={`rounded-lg bg-white/10 animate-pulse ${
              isExpanded ? 'h-10 w-full' : 'h-10 w-10 mx-auto'
            }`}
          />
        </li>
      ))}
    </ul>
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
          {shouldShowMenuSkeleton ? (
            renderMenuSkeleton(8)
          ) : (
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
          )}
        </nav>

        {/* Bloc Administration */}
        <nav className="p-2">
          {shouldShowMenuSkeleton ? (
            renderMenuSkeleton(1)
          ) : adminMenuItems.length > 0 ? (
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
          ) : null}
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
