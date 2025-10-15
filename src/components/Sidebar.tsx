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
  type LucideIcon,
} from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import Logo from '../assets/logos/glenat/glenat_white.svg';
import LogoG from '../assets/logos/glenat/glenat_G.svg';
import { useCurrentUser, useAdminGroups, usePermissionDefinitions } from '@/hooks/useAdminData';
import { computeEffectivePermissions } from '@/lib/mockDb';
import type { PermissionDefinition, PermissionKey } from '@/lib/access-control';
import { useDecryptedLocation } from '@/lib/secureRouting';
import { SecureNavLink } from '@/components/routing/SecureLink';

interface SidebarProps {
  jobCount?: number;
  onExpandChange?: (expanded: boolean) => void;
}

interface SidebarMenuItem {
  id: string;
  label: string;
  path: string;
  permission: PermissionKey;
  icon?: LucideIcon;
  logoUrl?: string;
  badge?: number;
}

const DEFAULT_ICON: LucideIcon = LayoutGrid;

const ICON_REGISTRY: Record<string, LucideIcon> = {
  home: Home,
  accueil: Home,
  house: Home,
  qui: UserRoundSearch,
  annuaire: UserRoundSearch,
  'user-round-search': UserRoundSearch,
  users: Users,
  fee: Users,
  personnes: Users,
  people: Users,
  groupe: Users,
  files: Files,
  file: Files,
  documents: Files,
  document: Files,
  doc: Files,
  library: LibraryBig,
  catalogue: LibraryBig,
  catalog: LibraryBig,
  livre: LibraryBig,
  book: LibraryBig,
  store: Store,
  kiosque: Store,
  shop: Store,
  boutique: Store,
  info: Info,
  information: Info,
  services: Info,
  service: Info,
  agenda: Calendar,
  calendar: Calendar,
  calendrier: Calendar,
  planning: CalendarDays,
  'calendar-days': CalendarDays,
  contrats: Signature,
  contrat: Signature,
  signature: Signature,
  temps: CalendarClock,
  time: CalendarClock,
  'calendar-clock': CalendarClock,
  rh: PersonStanding,
  humain: PersonStanding,
  personnel: PersonStanding,
  atelier: Hammer,
  hammer: Hammer,
  espace: SquareUserRound,
  profil: SquareUserRound,
  'square-user-round': SquareUserRound,
  annonces: Newspaper,
  'petites-annonces': Newspaper,
  newspaper: Newspaper,
  emploi: BriefcaseBusiness,
  job: BriefcaseBusiness,
  briefcase: BriefcaseBusiness,
  administration: Settings,
  parametres: Settings,
  settings: Settings,
};

const FALLBACK_PATHS: Record<string, string> = {
  home: '/',
  catalogue: '/catalogue',
  kiosque: '/catalogue/kiosque',
  emploi: '/emploi',
  services: '/services',
  administration: '/administration',
};

function resolveIconByName(name: string | undefined): LucideIcon | undefined {
  if (!name || typeof name !== 'string') {
    return undefined;
  }
  const trimmed = name.trim();
  if (!trimmed) {
    return undefined;
  }
  const lower = trimmed.toLowerCase();
  if (ICON_REGISTRY[lower]) {
    return ICON_REGISTRY[lower];
  }
  const withoutPrefix = lower.startsWith('lucide:') ? lower.slice(7) : lower;
  if (ICON_REGISTRY[withoutPrefix]) {
    return ICON_REGISTRY[withoutPrefix];
  }
  const cleaned = withoutPrefix
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  if (cleaned && ICON_REGISTRY[cleaned]) {
    return ICON_REGISTRY[cleaned];
  }
  const noDash = cleaned.replace(/-/g, '');
  if (noDash && ICON_REGISTRY[noDash]) {
    return ICON_REGISTRY[noDash];
  }
  return undefined;
}

function getMetadataString(definition: PermissionDefinition, keys: string[]): string | undefined {
  if (!definition.metadata) {
    return undefined;
  }
  for (const key of keys) {
    const value = definition.metadata[key];
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed) {
        return trimmed;
      }
    }
  }
  return undefined;
}

function normalizeModulePath(value: string | undefined): string | null {
  if (!value) {
    return null;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  if (/^https?:\/\//i.test(trimmed)) {
    return null;
  }
  if (trimmed === '/') {
    return '/';
  }
  const withLeadingSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  const collapsed = withLeadingSlash.replace(/\/+/g, '/');
  if (collapsed.length > 1 && collapsed.endsWith('/')) {
    return collapsed.replace(/\/+$/, '');
  }
  return collapsed;
}

function normalizeAssetUrl(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('data:')) {
    return trimmed;
  }
  const normalized = trimmed.replace(/\\/g, '/');
  if (normalized.startsWith('/')) {
    return normalized.replace(/\/+/g, '/');
  }
  return `/${normalized.replace(/^\/+/, '').replace(/\/+/g, '/')}`;
}

function resolveModulePath(definition: PermissionDefinition): string | null {
  const directPath = normalizeModulePath(
    getMetadataString(definition, ['path', 'route', 'url', 'href', 'link']),
  );
  if (directPath) {
    return directPath;
  }

  const fallbackPath = normalizeModulePath(
    getMetadataString(definition, ['defaultPath', 'defaultRoute', 'defaultPage', 'defaultPagePath']),
  );
  if (fallbackPath) {
    return fallbackPath;
  }

  const slugPath = normalizeModulePath(getMetadataString(definition, ['slug']));
  if (slugPath) {
    if (slugPath === '/home' || slugPath === '/accueil') {
      return '/';
    }
    return slugPath;
  }

  if (definition.key === 'home') {
    return '/';
  }

  if (FALLBACK_PATHS[definition.key]) {
    return FALLBACK_PATHS[definition.key];
  }

  const keyPath = normalizeModulePath(definition.key);
  if (keyPath === '/home' || keyPath === '/accueil') {
    return '/';
  }
  return keyPath ?? '/';
}

function resolveModuleVisual(definition: PermissionDefinition): {
  icon?: LucideIcon;
  logoUrl?: string;
} {
  const iconSource = getMetadataString(definition, ['icon', 'iconName']);
  const logoSource = getMetadataString(definition, [
    'logo',
    'logoUrl',
    'logoPath',
    'iconUrl',
    'iconPath',
  ]);

  const iconFromMetadata = resolveIconByName(iconSource);
  if (iconFromMetadata) {
    return { icon: iconFromMetadata };
  }

  const iconAsset = normalizeAssetUrl(iconSource);
  if (iconAsset) {
    return { logoUrl: iconAsset };
  }

  const iconFromLogo = resolveIconByName(logoSource);
  if (iconFromLogo) {
    return { icon: iconFromLogo };
  }

  const normalizedLogo = normalizeAssetUrl(logoSource);
  if (normalizedLogo) {
    return { logoUrl: normalizedLogo };
  }

  return {};
}

function isModuleActive(definition: PermissionDefinition): boolean {
  const value = definition.metadata?.isActive;
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'number') {
    return value !== 0;
  }
  if (typeof value === 'string') {
    const normalised = value.trim().toLowerCase();
    if (!normalised) {
      return true;
    }
    if (['0', 'false', 'no', 'non', 'off'].includes(normalised)) {
      return false;
    }
    if (['1', 'true', 'yes', 'oui', 'on'].includes(normalised)) {
      return true;
    }
  }
  return true;
}

function getModuleOrder(definition: PermissionDefinition, fallbackIndex: number): number {
  const value = definition.metadata?.order;
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = Number.parseInt(value.trim(), 10);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }
  const idValue = definition.metadata?.id;
  if (typeof idValue === 'number' && Number.isFinite(idValue)) {
    return idValue;
  }
  if (typeof idValue === 'string') {
    const parsedId = Number.parseInt(idValue.trim(), 10);
    if (!Number.isNaN(parsedId)) {
      return parsedId;
    }
  }
  return fallbackIndex;
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

  const accessiblePermissions = useMemo(() => {
    if (!currentUser) {
      return new Set<PermissionKey>();
    }
    return new Set(computeEffectivePermissions(currentUser, groups));
  }, [currentUser, groups]);

  const moduleDefinitions = useMemo(() => {
    return permissionDefinitions
      .map((definition, index) => ({ definition, index }))
      .filter(({ definition }) => {
        const type = definition.type ?? 'module';
        if (type !== 'module') {
          return false;
        }
        return isModuleActive(definition);
      })
      .sort((left, right) =>
        getModuleOrder(left.definition, left.index) - getModuleOrder(right.definition, right.index),
      )
      .map(({ definition }) => definition);
  }, [permissionDefinitions]);

  const moduleItems = useMemo<SidebarMenuItem[]>(() => {
    return moduleDefinitions
      .map((definition, index) => {
        const path = resolveModulePath(definition);
        if (!path) {
          return null;
        }

        const { icon, logoUrl } = resolveModuleVisual(definition);
        let iconComponent = icon ?? resolveIconByName(definition.key);
        if (!iconComponent && !logoUrl) {
          iconComponent = DEFAULT_ICON;
        }

        const rawId = definition.metadata?.id;
        const identifier =
          typeof rawId === 'string'
            ? rawId
            : typeof rawId === 'number'
              ? rawId.toString()
              : definition.key || `module-${index + 1}`;

        const badge =
          definition.key === 'emploi' && typeof jobCount === 'number'
            ? jobCount
            : undefined;

        return {
          id: identifier,
          label: definition.label,
          path,
          permission: definition.key,
          icon: iconComponent,
          logoUrl,
          badge,
        } satisfies SidebarMenuItem;
      })
      .filter((item): item is SidebarMenuItem => item !== null);
  }, [moduleDefinitions, jobCount]);

  const showAllMenus = loadingCurrentUser || loadingGroups || loadingPermissions || !currentUser;

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

  const mainMenuItems = moduleItems.filter((item) => item.permission !== 'administration');
  const adminMenuItems = moduleItems.filter((item) => item.permission === 'administration');
  const visibleMainMenuItems = mainMenuItems.filter((item) => userCanAccess(item.permission));
  const visibleAdminMenuItems = adminMenuItems.filter((item) => userCanAccess(item.permission));
  const isLoadingMenus = loadingPermissions && moduleItems.length === 0;

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
            {isLoadingMenus && visibleMainMenuItems.length === 0
              ? Array.from({ length: 6 }).map((_, index) => (
                  <li key={`main-skeleton-${index}`}>
                    <div
                      className={`h-9 rounded-lg bg-white/10 animate-pulse ${
                        isExpanded ? 'w-full' : 'w-10 mx-auto'
                      }`}
                    />
                  </li>
                ))
              : visibleMainMenuItems.map((item) => {
                  const isActive = item.path === '/'
                    ? location.pathname === '/'
                    : location.pathname.startsWith(item.path);
                  const IconComponent = item.icon ?? DEFAULT_ICON;
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
                        {item.logoUrl ? (
                          <img
                            src={item.logoUrl}
                            alt=""
                            aria-hidden="true"
                            className="h-5 w-5 flex-shrink-0 object-contain"
                          />
                        ) : (
                          <IconComponent className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                        )}
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
            {isLoadingMenus && visibleAdminMenuItems.length === 0
              ? Array.from({ length: 1 }).map((_, index) => (
                  <li key={`admin-skeleton-${index}`}>
                    <div
                      className={`h-9 rounded-lg bg-white/10 animate-pulse ${
                        isExpanded ? 'w-full' : 'w-10 mx-auto'
                      }`}
                    />
                  </li>
                ))
              : visibleAdminMenuItems.map((item) => {
                  const isActive = item.path === '/'
                    ? location.pathname === '/'
                    : location.pathname.startsWith(item.path);
                  const IconComponent = item.icon ?? DEFAULT_ICON;
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
                        {item.logoUrl ? (
                          <img
                            src={item.logoUrl}
                            alt=""
                            aria-hidden="true"
                            className="h-5 w-5 flex-shrink-0 object-contain"
                          />
                        ) : (
                          <IconComponent className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
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
