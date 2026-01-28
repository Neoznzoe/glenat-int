import { PanelLeft } from 'lucide-react';
import { useState, useEffect, useMemo, useRef, type FocusEvent, type KeyboardEvent } from 'react';
import Logo from '../assets/logos/glenat/glenat_white.svg';
import LogoCompact from '../assets/logos/glenat/glenat_G.svg';
import { useCurrentUser, useAdminGroups, useCmsModules } from '@/hooks/useAdminData';
import { useSidebarModules } from '@/hooks/useModules';
import { computeEffectivePermissions } from '@/lib/mockDb';
import type { PermissionKey } from '@/lib/access-control';
import { createModuleFingerprint } from '@/lib/moduleFingerprint';
import { useDecryptedLocation } from '@/lib/secureRouting';
import { useAuth } from '@/context/AuthContext';
import { toNonEmptyString, toNumberValue, resolveBoolean, toNumericId, extractInternalUserId, extractModulePath, resolveBadgeValue, resolveLucideIcon, isAdministrationModule, type SidebarModuleEntry } from '@/lib/sidebarUtils';
import { SidebarMenuItem } from '@/components/SidebarMenuItem';

interface SidebarProps {
  jobCount?: number;
  onExpandChange?: (expanded: boolean) => void;
}

type ModuleMetadata = Record<string, unknown>;

function SidebarSkeletonList({ count, isExpanded }: { count: number; isExpanded: boolean }) {
  return (
    <ul className="space-y-1" aria-hidden>
      {Array.from({ length: count }).map((_, index) => (
        <li key={`sidebar-skeleton-${index}`}>
          <div className={`flex items-center w-full px-2 py-2 rounded-lg bg-white/10 animate-pulse ${isExpanded ? 'space-x-3' : 'justify-center'}`}>
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
  const internalUserId = useMemo(() => extractInternalUserId(authUser?.internalUser), [authUser?.internalUser]);
  const currentUserId = toNumericId(currentUser?.id);
  const sidebarUserId = internalUserId ?? currentUserId;
  const lastModuleFingerprintRef = useRef<string | null>(null);

  const authUserEmail = authUser?.mail || authUser?.userPrincipalName;
  const { data: cmsModules } = useCmsModules(authUserEmail);

  const { data: moduleDefinitions, isLoading: loadingModules, isFetching: fetchingModules, isError: hasModuleError, error: moduleError } = useSidebarModules(sidebarUserId);
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

  const processedCmsModules = useMemo(() => {
    if (!cmsModules) {
      return [];
    }

    const items: SidebarModuleEntry[] = [];

    cmsModules.forEach((module, index) => {
      if (!module.isActive) {
        return;
      }

      const normalizedCode = module.moduleCode.toLowerCase().replace(/\s+/g, '-');
      const path = `/${normalizedCode}`;
      const id = module.moduleId.toString();
      const label = module.moduleName;
      const permissionKey = `module:${module.moduleId}`;
      const icon = resolveLucideIcon(module.moduleCode);

      let badge: number | string | undefined;
      if (normalizedCode === 'emploi' && jobCount !== undefined && jobCount > 0) {
        badge = jobCount;
      }

      items.push({ id, label, path, permission: permissionKey, icon, badge, order: index, section: undefined });
    });

    return items;
  }, [cmsModules, jobCount]);

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

      const id = toNonEmptyString(metadata.id) ?? toNonEmptyString(metadata.slug) ?? definition.key ?? `module-${index + 1}`;
      const label = definition.label ?? id;
      const permissionKey = (toNonEmptyString(metadata.permissionKey) ?? definition.key).trim().toLowerCase();
      const iconName = toNonEmptyString(metadata.icon);
      let icon = resolveLucideIcon(iconName);

      if (!icon) {
        const fallbackIconCandidates = [toNonEmptyString(metadata.slug), toNonEmptyString(metadata.path), definition.label, definition.key];
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

      items.push({ id, label, path, permission: permissionKey, icon, badge, order, section });
    });

    return items.sort((left, right) => {
      if (left.order !== right.order) {
        return left.order - right.order;
      }
      return left.label.localeCompare(right.label, 'fr', { sensitivity: 'base' });
    });
  }, [moduleDefinitions, jobCount]);

  const showAllMenus = loadingCurrentUser || loadingGroups || waitingForModules || !currentUser;

  const userCanAccess = (permission: string) => {
    if (showAllMenus) {
      return true;
    }
    if (currentUser?.isSuperAdmin) {
      return true;
    }
    return accessiblePermissions.has(permission as PermissionKey);
  };

  const location = useDecryptedLocation();

  const modulesToUse = cmsModules && cmsModules.length > 0 ? processedCmsModules : processedModules;
  const useCmsFiltering = cmsModules && cmsModules.length > 0;

  const mainMenuItems = useCmsFiltering
    ? modulesToUse.filter((item) => !isAdministrationModule(item))
    : modulesToUse.filter((item) => !isAdministrationModule(item) && userCanAccess(item.permission));

  const adminMenuItems = useCmsFiltering
    ? modulesToUse.filter((item) => isAdministrationModule(item))
    : modulesToUse.filter((item) => isAdministrationModule(item) && userCanAccess(item.permission));

  const moduleErrorMessage = hasModuleError && moduleError
    ? moduleError instanceof Error ? moduleError.message : String(moduleError)
    : null;

  const isItemActive = (item: SidebarModuleEntry) => {
    const isInternalLink = item.path.startsWith('/');
    if (!isInternalLink) return false;
    if (item.path === '/') return location.pathname === '/' || location.pathname === '';
    return location.pathname.startsWith(item.path);
  };

  return (
    <div
      className={`bg-primary text-primary-foreground flex flex-col h-screen transition-all duration-300 ease-in-out relative ${isExpanded ? 'w-64' : 'w-16'}`}
      onMouseEnter={handleSidebarMouseEnter}
      onMouseLeave={handleSidebarMouseLeave}
      onBlurCapture={handleSidebarBlur}
    >
      {/* Header */}
      <div
        className={`h-16 px-4 border-b border-red-400/50 flex items-center ${isExpanded ? 'justify-between' : 'justify-center'} min-h-[64px]`}
        onMouseEnter={handleCollapsedHeaderHover}
        onFocus={handleCollapsedHeaderHover}
      >
        <div
          ref={collapsedTriggerRef}
          className={`flex items-center gap-2 overflow-hidden ${isManuallyCollapsed ? 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/60 rounded-md' : ''}`}
          onMouseEnter={handleCollapsedTriggerHover}
          onFocus={handleCollapsedTriggerHover}
          onKeyDown={handleCollapsedTriggerKeyDown}
          role={isManuallyCollapsed ? 'button' : undefined}
          tabIndex={isManuallyCollapsed ? 0 : -1}
          aria-label={isManuallyCollapsed ? 'Afficher temporairement la barre latérale' : undefined}
        >
          {isExpanded ? (
            <img src={Logo} alt="Logo Glénat" className="h-8 w-auto flex-shrink-0 transition-opacity duration-200" />
          ) : (
            <img src={LogoCompact} alt="Monogramme Glénat" className="h-10 w-10 flex-shrink-0 transition-transform duration-200" />
          )}
        </div>

        {isExpanded ? (
          <button
            onClick={() => { setIsManuallyCollapsed((previous) => !previous); setIsHovered(false); }}
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
                const isHomePage = item.path === '/' || item.path === '/accueil';
                return (
                  <SidebarMenuItem
                    key={item.id}
                    id={item.id}
                    label={item.label}
                    path={item.path}
                    icon={item.icon}
                    badge={item.badge}
                    isActive={isItemActive(item)}
                    isExpanded={isExpanded}
                    variant={isHomePage ? 'home' : 'link'}
                  />
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
                if (item.permission.toLowerCase() === 'administration') {
                  return (
                    <SidebarMenuItem
                      key={item.id}
                      id={item.id}
                      label={item.label}
                      path={item.path}
                      icon={item.icon}
                      isActive={false}
                      isExpanded={isExpanded}
                      variant="admin-button"
                      onClick={() => {
                        const baseUrl = window.location.origin;
                        window.open(`${baseUrl}/#/admin`, '_blank', 'noopener,noreferrer');
                      }}
                    />
                  );
                }

                return (
                  <SidebarMenuItem
                    key={item.id}
                    id={item.id}
                    label={item.label}
                    path={item.path}
                    icon={item.icon}
                    isActive={isItemActive(item)}
                    isExpanded={isExpanded}
                  />
                );
              })}
            </ul>
          )}
        </nav>
      </div>

      {/* Footer */}
      <div className="h-12 flex-none border-t border-red-400/50 flex items-center px-4">
        <div className={`text-xs text-red-100 transition-all duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
          Version 1.0.0
        </div>
      </div>
    </div>
  );
}
