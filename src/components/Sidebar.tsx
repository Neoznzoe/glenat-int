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
} from 'lucide-react';
import { useState } from 'react';
import Logo from '../assets/logos/glenat/glenat_white.svg';
import LogoG from '../assets/logos/glenat/glenat_G.svg';

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
  jobCount: number;
}

export function Sidebar({ activePage, onNavigate, jobCount }: SidebarProps) {
  const [isPinned, setIsPinned] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const isExpanded = isPinned || isHovered;

  const menuItems = [
    { id: 'home', icon: Home, label: 'Accueil' },
    { id: 'qui', icon: UserRoundSearch, label: 'Qui fait quoi' },
    { id: 'catalogue', icon: LibraryBig, label: "Catalogue" },
    { id: 'doc', icon: Files, label: "Glénat'Doc" },
    { id: 'fee', icon: Users, label: "Glénat'Fée" },
    { id: 'agenda', icon: Calendar, label: 'Agenda' },
    { id: 'planning', icon: CalendarDays, label: 'Planning' },
    { id: 'contrats', icon: Signature, label: 'Contrats' },
    { id: 'rh', icon: PersonStanding, label: 'Ressources humaines' },
    { id: 'temps', icon: CalendarClock, label: 'Saisie des temps' },
    { id: 'atelier', icon: Hammer, label: 'Travaux atelier' },
    { id: 'espace', icon: SquareUserRound, label: 'Mon espace' },
    { id: 'emploi', icon: BriefcaseBusiness, label: 'Emploi', badge: jobCount },
    { id: 'annonces', icon: Newspaper, label: 'Petites annonces' },
    { id: 'services', icon: Info, label: 'Services' },
    { id: 'administration', icon: Settings, label: 'Administration' },
  ];

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
            {menuItems
              .filter(item => item.id !== 'administration')
              .map(item => {
                const isActive = item.id === activePage;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => onNavigate(item.id)}
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
                      {item.badge ? (
                        <span className="absolute -top-[5px] -right-[5px] bg-white text-primary text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                          {item.badge}
                        </span>
                      ) : null}
                    </button>
                  </li>
                );
              })}
          </ul>
        </nav>

        {/* Bloc Administration */}
        <nav className="p-2">
          <ul>
            {menuItems
              .filter(item => item.id === 'administration')
              .map(item => {
                const isActive = item.id === activePage;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => onNavigate(item.id)}
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
                    </button>
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
