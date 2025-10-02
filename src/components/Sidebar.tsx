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
import { useState, useEffect, useMemo } from 'react';
import Logo from '../assets/logos/glenat/glenat_white.svg';
import LogoG from '../assets/logos/glenat/glenat_G.svg';
import { useCurrentUser, useAdminGroups } from '@/hooks/useAdminData';
import { computeEffectivePermissions } from '@/lib/mockDb';
import type { PermissionKey } from '@/lib/access-control';
import { useDecryptedLocation } from '@/lib/secureRouting';
import { SecureNavLink } from '@/components/routing/SecureLink';

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
  const { data: groups = [] } = useAdminGroups();

  const accessiblePermissions = useMemo(() => {
    if (!currentUser) {
      return new Set<PermissionKey>();
    }
    return new Set(computeEffectivePermissions(currentUser, groups));
  }, [currentUser, groups]);

  const showSkeleton = loadingCurrentUser || !currentUser;

  const menuItems: Array<{
    id: string;
    icon: typeof Home;
    label: string;
    path: string;
    permission: PermissionKey;
    badge?: number;
  }> = [
    { id: 'home', icon: Home, label: 'Accueil', path: '/', permission: 'home' },
    {
      id: 'qui',
      icon: UserRoundSearch,
      label: 'Qui fait quoi',
      path: '/qui',
      permission: 'qui',
    },
    {
      id: 'catalogue',
      icon: LibraryBig,
      label: 'Catalogue',
      path: '/catalogue/offices',
      permission: 'catalogue',
    },
    {
      id: 'kiosque',
      icon: Store,
      label: 'Kiosque',
      path: '/catalogue/kiosque',
      permission: 'catalogue',
    },
    { id: 'doc', icon: Files, label: "Glénat'Doc", path: '/doc', permission: 'doc' },
    { id: 'fee', icon: Users, label: "Glénat'Fée", path: '/fee', permission: 'fee' },
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
    { id: 'rh', icon: PersonStanding, label: 'Ressources humaines', path: '/rh', permission: 'rh' },
    {
      id: 'temps',
      icon: CalendarClock,
      label: 'Saisie des temps',
      path: '/temps',
      permission: 'temps',
    },
    {
      id: 'atelier',
      icon: Hammer,
      label: 'Travaux atelier',
      path: '/atelier',
      permission: 'atelier',
    },
    {
      id: 'espace',
      icon: SquareUserRound,
      label: 'Mon espace',
      path: '/espace',
      permission: 'espace',
    },
    {
      id: 'emploi',
      icon: BriefcaseBusiness,
      label: 'Emploi',
      path: '/emploi',
      permission: 'emploi',
      badge: jobCount,
    },
    {
      id: 'annonces',
      icon: Newspaper,
      label: 'Petites annonces',
      path: '/annonces',
      permission: 'annonces',
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

  const userCanAccess = (permission: PermissionKey) => {
    if (currentUser?.isSuperAdmin) {
      return true;
    }
    return accessiblePermissions.has(permission);
  };

  const location = useDecryptedLocation();

  const mainMenuItems = currentUser
    ? menuItems.filter(
        (item) => item.id !== 'administration' && userCanAccess(item.permission),
      )
    : [];
  const adminMenuItems = currentUser
    ? menuItems.filter((item) => item.id === 'administration' && userCanAccess(item.permission))
    : [];

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
        {showSkeleton ? (
          <SidebarSkeleton isExpanded={isExpanded} />
        ) : (
          <>
            {/* Menu principal */}
            <nav className="p-2">
              <ul className="space-y-1">
                {mainMenuItems.map((item) => {
                  const isActive =
                    item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path);
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
                  const isActive =
                    item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path);
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
          </>
        )}
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

function SidebarSkeleton({ isExpanded }: { isExpanded: boolean }) {
  const itemClass = `h-10 rounded-lg bg-white/10 ${isExpanded ? 'w-full' : 'w-10 mx-auto'} animate-pulse`;

  return (
    <>
      <div className="p-2 space-y-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={`main-placeholder-${index}`} className={itemClass} />
        ))}
      </div>
      <div className="p-2 space-y-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={`admin-placeholder-${index}`} className={itemClass} />
        ))}
      </div>
    </>
  );
}
