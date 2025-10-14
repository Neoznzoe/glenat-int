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
import type { LucideIcon } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import Logo from '../assets/logos/glenat/glenat_white.svg';
import LogoG from '../assets/logos/glenat/glenat_G.svg';
import { useCurrentUser, useAdminGroups } from '@/hooks/useAdminData';
import { useModules, type ModuleRecord } from '@/hooks/useModules';
import { useUserModulePermissions } from '@/hooks/useUserModulePermissions';
import { computeEffectivePermissions } from '@/lib/mockDb';
import type { PermissionKey } from '@/lib/access-control';
import { useDecryptedLocation } from '@/lib/secureRouting';
import { SecureNavLink } from '@/components/routing/SecureLink';

interface SidebarProps {
  jobCount?: number;
  onExpandChange?: (expanded: boolean) => void;
}

type SidebarSection = 'main' | 'admin';

interface SidebarModuleConfig {
  key: string;
  icon: LucideIcon;
  label: string;
  path: string;
  permission: PermissionKey;
  section: SidebarSection;
  moduleKeys?: string[];
  alwaysVisible?: boolean;
  getBadge?: (context: { jobCount?: number }) => number | undefined;
}

const SIDEBAR_MODULE_CONFIGS: SidebarModuleConfig[] = [
  {
    key: 'home',
    icon: Home,
    label: 'Accueil',
    path: '/',
    permission: 'home',
    section: 'main',
    alwaysVisible: true,
  },
  {
    key: 'qui',
    icon: UserRoundSearch,
    label: 'Qui fait quoi',
    path: '/qui',
    permission: 'qui',
    section: 'main',
    moduleKeys: ['qui', 'col'],
  },
  {
    key: 'catalogue',
    icon: LibraryBig,
    label: 'Catalogue',
    path: '/catalogue/offices',
    permission: 'catalogue',
    section: 'main',
  },
  {
    key: 'kiosque',
    icon: Store,
    label: 'Kiosque',
    path: '/catalogue/kiosque',
    permission: 'catalogue',
    section: 'main',
    moduleKeys: ['kiosque', 'catalogue'],
  },
  {
    key: 'doc',
    icon: Files,
    label: "Glénat'Doc",
    path: '/doc',
    permission: 'doc',
    section: 'main',
  },
  {
    key: 'fee',
    icon: Users,
    label: "Glénat'Fée",
    path: '/fee',
    permission: 'fee',
    section: 'main',
  },
  {
    key: 'agenda',
    icon: Calendar,
    label: 'Agenda',
    path: '/agenda',
    permission: 'agenda',
    section: 'main',
  },
  {
    key: 'planning',
    icon: CalendarDays,
    label: 'Planning',
    path: '/planning',
    permission: 'planning',
    section: 'main',
  },
  {
    key: 'contrats',
    icon: Signature,
    label: 'Contrats',
    path: '/contrats',
    permission: 'contrats',
    section: 'main',
  },
  {
    key: 'rh',
    icon: PersonStanding,
    label: 'Ressources humaines',
    path: '/rh',
    permission: 'rh',
    section: 'main',
  },
  {
    key: 'temps',
    icon: CalendarClock,
    label: 'Saisie des temps',
    path: '/temps',
    permission: 'temps',
    section: 'main',
  },
  {
    key: 'atelier',
    icon: Hammer,
    label: 'Travaux atelier',
    path: '/atelier',
    permission: 'atelier',
    section: 'main',
  },
  {
    key: 'espace',
    icon: SquareUserRound,
    label: 'Mon espace',
    path: '/espace',
    permission: 'espace',
    section: 'main',
  },
  {
    key: 'emploi',
    icon: BriefcaseBusiness,
    label: 'Emploi',
    path: '/emploi',
    permission: 'emploi',
    section: 'main',
    getBadge: ({ jobCount }) => jobCount,
  },
  {
    key: 'annonces',
    icon: Newspaper,
    label: 'Petites annonces',
    path: '/annonces',
    permission: 'annonces',
    section: 'main',
  },
  {
    key: 'services',
    icon: Info,
    label: 'Services',
    path: '/services',
    permission: 'services',
    section: 'main',
  },
  {
    key: 'administration',
    icon: Settings,
    label: 'Administration',
    path: '/administration',
    permission: 'administration',
    section: 'admin',
    moduleKeys: ['administration', 'admin'],
  },
];

function normalizeModuleKey(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

function normalizeRecordIdentifier(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
}

function toDatabaseUserIdCandidate(value: unknown): string | undefined {
  if (typeof value === 'number') {
    if (Number.isFinite(value) && Number.isInteger(value) && value >= 0) {
      return String(value);
    }
    return undefined;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) {
      return undefined;
    }
    if (/^[0-9]+$/.test(trimmed)) {
      const parsed = Number.parseInt(trimmed, 10);
      if (Number.isSafeInteger(parsed)) {
        return String(parsed);
      }
    }
  }
  return undefined;
}

function findNestedDatabaseUserId(
  value: unknown,
  visited: Set<unknown> = new Set<unknown>(),
): string | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }

  if (typeof value === 'number' || typeof value === 'string') {
    return toDatabaseUserIdCandidate(value);
  }

  if (visited.has(value)) {
    return undefined;
  }
  visited.add(value);

  if (Array.isArray(value)) {
    for (const item of value) {
      const candidate = findNestedDatabaseUserId(item, visited);
      if (candidate) {
        return candidate;
      }
    }
    return undefined;
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>);

    for (const [key, nested] of entries) {
      if (key.toLowerCase() === 'userid' || key.toLowerCase() === 'user_id') {
        const candidate = toDatabaseUserIdCandidate(nested);
        if (candidate) {
          return candidate;
        }
      }
    }

    for (const [, nested] of entries) {
      const candidate = findNestedDatabaseUserId(nested, visited);
      if (candidate) {
        return candidate;
      }
    }
  }

  return undefined;
}

function deriveDatabaseUserId(user: unknown): string | undefined {
  if (!user || typeof user !== 'object') {
    return undefined;
  }

  const directId = toDatabaseUserIdCandidate((user as { id?: unknown }).id);
  if (directId) {
    return directId;
  }

  const metadata = (user as { metadata?: unknown }).metadata;
  const fromMetadata = findNestedDatabaseUserId(metadata);
  if (fromMetadata) {
    return fromMetadata;
  }

  const data = (user as { data?: unknown }).data;
  const fromData = findNestedDatabaseUserId(data);
  if (fromData) {
    return fromData;
  }

  return findNestedDatabaseUserId(user);
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
  const { data: modules } = useModules();
  const databaseUserId = useMemo(() => deriveDatabaseUserId(currentUser), [currentUser]);
  const { data: userPermissionsData, isLoading: loadingUserPermissions } =
    useUserModulePermissions(databaseUserId);
  const userPermissions = useMemo(() => userPermissionsData ?? [], [userPermissionsData]);

  const deniedModuleIds = useMemo(() => {
    if (!userPermissions.length) {
      return new Set<string>();
    }

    const denied = new Set<string>();

    userPermissions.forEach((permission) => {
      if (permission.canView !== false || !permission.moduleId) {
        return;
      }

      const normalizedModuleId = normalizeRecordIdentifier(permission.moduleId);
      if (!normalizedModuleId) {
        return;
      }

      denied.add(normalizedModuleId);
    });

    return denied;
  }, [userPermissions]);

  const effectiveModules = useMemo(() => {
    if (!modules) {
      return undefined;
    }

    if (!deniedModuleIds.size) {
      return modules;
    }

    return modules.map((module) => {
      const moduleId = normalizeRecordIdentifier(module.id);
      if (moduleId && deniedModuleIds.has(moduleId)) {
        return {
          ...module,
          isActive: false,
        };
      }

      return module;
    });
  }, [modules, deniedModuleIds]);

  const accessiblePermissions = useMemo(() => {
    if (!currentUser) {
      return new Set<PermissionKey>();
    }
    return new Set(computeEffectivePermissions(currentUser, groups));
  }, [currentUser, groups]);

  const moduleMaps = useMemo(() => {
    if (!effectiveModules) {
      return null;
    }
    const byKey = new Map<string, ModuleRecord>();
    const byId = new Map<string, ModuleRecord>();
    effectiveModules.forEach((module) => {
      if (module.isActive === false) {
        return;
      }
      const normalizedId = normalizeRecordIdentifier(module.id);
      if (normalizedId) {
        byId.set(normalizedId, module);
      }
      const rawNameValue = module.metadata?.rawName;
      const rawName = typeof rawNameValue === 'string' ? rawNameValue : undefined;
      const keys = new Set<string>([module.key, module.slug, rawName ?? '', normalizedId ?? '']);
      keys.forEach((key) => {
        if (!key) {
          return;
        }
        byKey.set(normalizeModuleKey(key), module);
      });
    });
    return { byKey, byId };
  }, [effectiveModules]);

  const permissionsReady = !databaseUserId || !loadingUserPermissions;

  const menuItems = useMemo(() => {
    if (!permissionsReady) {
      return [] as Array<SidebarModuleConfig & { label: string; badge?: number }>;
    }

    return SIDEBAR_MODULE_CONFIGS.filter((config) => {
      if (!moduleMaps) {
        return config.alwaysVisible ?? true;
      }

      const normalizedKeys = config.moduleKeys ?? [config.key];
      return normalizedKeys.some((key) => moduleMaps.byKey.has(normalizeModuleKey(key)));
    }).map((config) => {
      const module = moduleMaps
        ? (config.moduleKeys ?? [config.key])
            .map((key) => moduleMaps.byKey.get(normalizeModuleKey(key)))
            .find(Boolean)
        : undefined;
      return {
        ...config,
        label: module?.description ?? module?.displayName ?? config.label,
        badge: config.getBadge?.({ jobCount }),
      };
    });
  }, [permissionsReady, moduleMaps, jobCount]);

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
                  <li key={item.key}>
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
                  <li key={item.key}>
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
