import * as LucideIcons from 'lucide-react';
import { PanelLeft } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useState, useEffect, useRef, type FocusEvent, type KeyboardEvent } from 'react';
import Logo from '../assets/logos/glenat/glenat_white.svg';
import LogoCompact from '../assets/logos/glenat/glenat_G.svg';

interface AdminSidebarProps {
  onExpandChange?: (expanded: boolean) => void;
}

interface AdminMenuItem {
  id: string;
  label: string;
  path: string;
  icon: keyof typeof LucideIcons;
  section?: 'main' | 'sections' | 'features';
}

const ADMIN_MENU_ITEMS: AdminMenuItem[] = [
  // Administration des Sections
  { id: 'projects', label: 'Projets', path: '/admin/projects', icon: 'FolderKanban', section: 'sections' },
  { id: 'dashboard', label: 'Tableau de bord', path: '/admin', icon: 'LayoutDashboard', section: 'main' },
  { id: 'zones', label: 'Zones', path: '/admin/zones', icon: 'Globe', section: 'sections' },
  { id: 'modules', label: 'Modules', path: '/admin/modules', icon: 'Puzzle', section: 'sections' },
  { id: 'pages', label: 'Pages', path: '/admin/pages', icon: 'FileText', section: 'sections' },
  { id: 'blocs', label: 'Blocs', path: '/admin/blocs', icon: 'SquareStack', section: 'sections' },
  { id: 'elements', label: 'Éléments', path: '/admin/elements', icon: 'Component', section: 'sections' },

  // Administration des utilisateurs
  { id: 'users', label: 'Utilisateurs', path: '/admin/users', icon: 'Users', section: 'main' },
  { id: 'groups', label: 'Groupes', path: '/admin/groups', icon: 'UsersRound', section: 'main' },

  // Administration de PHPulse
  { id: 'phpulse', label: 'PHPulse', path: '/admin/phpulse', icon: 'Zap', section: 'features' },
  { id: 'qui-fait-quoi', label: 'Qui fait quoi ?', path: '/admin/qui-fait-quoi', icon: 'Users', section: 'features' },
  { id: 'glenatee', label: "Glénat'ée", path: '/admin/glenatee', icon: 'Palette', section: 'features' },
  { id: 'glenatdoc', label: "Glénat'Doc", path: '/admin/glenatdoc', icon: 'Newspaper', section: 'features' },
  { id: 'parking', label: 'Plans de parking', path: '/admin/parking', icon: 'ParkingCircle', section: 'features' },
  { id: 'temps', label: 'Gestion des temps', path: '/admin/temps', icon: 'Clock', section: 'features' },
  { id: 'agenda', label: 'Agenda', path: '/admin/agenda', icon: 'CalendarDays', section: 'features' },
  { id: 'emplois', label: 'Emplois', path: '/admin/emplois', icon: 'BriefcaseBusiness', section: 'features' },
  { id: 'alertes', label: 'Alertes', path: '/admin/alertes', icon: 'Bell', section: 'features' },
  { id: 'credit-livre', label: 'Crédit livre', path: '/admin/credit-livre', icon: 'BookOpen', section: 'features' },
  { id: 'newsletter', label: 'Désabonnement newsletter', path: '/admin/newsletter', icon: 'MailMinus', section: 'features' },
  { id: 'ecran-service', label: 'Écran de service', path: '/admin/ecran-service', icon: 'Monitor', section: 'features' },
];


export function AdminSidebar({ onExpandChange }: AdminSidebarProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isManuallyCollapsed, setIsManuallyCollapsed] = useState(false);
  const [, forceUpdate] = useState({});
  const collapsedTriggerRef = useRef<HTMLDivElement | null>(null);

  const isExpanded = !isManuallyCollapsed || isHovered;

  // Forcer le re-render quand le hash change pour mettre à jour isActive
  useEffect(() => {
    const handleHashChange = () => forceUpdate({});
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

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

  const sectionsItems = ADMIN_MENU_ITEMS.filter(item => item.section === 'sections');
  const usersItems = ADMIN_MENU_ITEMS.filter(item => item.id === 'users' || item.id === 'groups');
  const featuresItems = ADMIN_MENU_ITEMS.filter(item => item.section === 'features');
  const dashboardItem = ADMIN_MENU_ITEMS.find(item => item.id === 'dashboard');

  const renderMenuItem = (item: AdminMenuItem) => {
    const IconComponent = LucideIcons[item.icon] as LucideIcon;

    // Vérifier si on est sur cette route via le hash
    const currentHash = window.location.hash;
    const hashPath = item.path === '/admin' ? '#/admin' : `#${item.path}`;
    const isActive = currentHash === hashPath || (item.path !== '/admin' && currentHash.startsWith(hashPath + '/'));

    return (
      <li key={item.id}>
        <a
          href={hashPath}
          className={`flex items-center w-full px-2 py-2 rounded-lg transition-all duration-300 group ${
            isActive
              ? 'bg-white/20 text-white'
              : 'text-red-100 hover:bg-white/10 hover:text-white'
          } ${isExpanded ? 'space-x-3' : 'justify-center'}`}
          title={!isExpanded ? item.label : ''}
        >
          {IconComponent ? (
            <IconComponent className="h-5 w-5 flex-shrink-0" />
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
        </a>
      </li>
    );
  };

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
            <div className="flex items-center gap-2">
              <img
                src={Logo}
                alt="Logo Glénat"
                className="h-8 w-auto flex-shrink-0 transition-opacity duration-200"
              />
              <span className="text-sm font-medium text-red-100">Admin</span>
            </div>
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

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide">
        <nav className="p-2 space-y-6">
          {/* Tableau de bord */}
          {dashboardItem && (
            <div>
              <ul className="space-y-1">
                {renderMenuItem(dashboardItem)}
              </ul>
            </div>
          )}

          {/* Administration des Sections */}
          {isExpanded && (
            <div>
              <h3 className="px-2 text-xs font-semibold text-red-200 uppercase tracking-wider mb-2">
                Administration des Sections
              </h3>
              <ul className="space-y-1">
                {sectionsItems.map(renderMenuItem)}
              </ul>
            </div>
          )}
          {!isExpanded && (
            <ul className="space-y-1">
              {sectionsItems.map(renderMenuItem)}
            </ul>
          )}

          {/* Administration des utilisateurs */}
          {isExpanded && (
            <div>
              <h3 className="px-2 text-xs font-semibold text-red-200 uppercase tracking-wider mb-2">
                Administration des utilisateurs
              </h3>
              <ul className="space-y-1">
                {usersItems.map(renderMenuItem)}
              </ul>
            </div>
          )}
          {!isExpanded && (
            <ul className="space-y-1">
              {usersItems.map(renderMenuItem)}
            </ul>
          )}

          {/* Administration de PHPulse */}
          {isExpanded && (
            <div>
              <h3 className="px-2 text-xs font-semibold text-red-200 uppercase tracking-wider mb-2">
                Administration de PHPulse
              </h3>
              <ul className="space-y-1">
                {featuresItems.map(renderMenuItem)}
              </ul>
            </div>
          )}
          {!isExpanded && (
            <ul className="space-y-1">
              {featuresItems.map(renderMenuItem)}
            </ul>
          )}
        </nav>
      </div>

      {/* Footer */}
      <div className="h-12 flex-none border-t border-red-400/50 flex items-center px-4">
        <a
          href="/"
          className={`text-xs text-red-100 hover:text-white transition-all duration-300 flex items-center gap-2 ${
            isExpanded ? 'opacity-100' : 'opacity-0'
          }`}
          title="Retour vers l'intranet"
        >
          <LucideIcons.ArrowLeft className="h-3 w-3" />
          Retour vers l'intranet
        </a>
      </div>
    </div>
  );
}
