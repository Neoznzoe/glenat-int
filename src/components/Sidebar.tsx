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

const menuItems = [
  { icon: Home, label: 'Accueil', active: true },
  { icon: UserRoundSearch, label: 'Qui fait quoi', active: false },
  { icon: LibraryBig, label: "Catalogue", active: false },
  { icon: Files, label: "Glénat'Doc", active: false },
  { icon: Users, label: "Glénat'Fée", active: false },
  { icon: Calendar, label: 'Agenda', active: false },
  { icon: CalendarDays, label: 'Planning', active: false },
  { icon: Signature, label: 'Contrats', active: false },
  { icon: PersonStanding, label: 'Ressources humaines', active: false },
  { icon: CalendarClock, label: 'Saisie des temps', active: false },
  { icon: Hammer, label: 'Travaux atelier', active: false },
  { icon: SquareUserRound, label: 'Mon espace', active: false },
  { icon: BriefcaseBusiness, label: 'Emploi', active: false },
  { icon: Newspaper, label: 'Petites annonces', active: false },
  { icon: Info, label: 'Services', active: false },

  { icon: Settings, label: 'Administration', active: false },
];

export function Sidebar() {
  const [isPinned, setIsPinned] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const isExpanded = isPinned || isHovered;

  return (
    <div 
      className={`bg-[#ff3b30] text-white flex flex-col transition-all duration-300 ease-in-out relative ${
        isExpanded ? 'w-64' : 'w-16'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      <div className="p-4 border-b border-red-400/50 flex items-center justify-between min-h-[64px]">
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
      <div className="flex-1 flex flex-col">
        {/* Menu principal */}
        <nav className="p-2">
          <ul className="space-y-1">
            {menuItems
              .filter(item => item.label !== 'Administration') // tout sauf Administration
              .map((item, index) => (
                <li key={index}>
                  <a
                    href="#"
                    className={`flex items-center px-2 py-2 rounded-lg transition-all duration-300 group ${
                      item.active
                        ? 'bg-white/20 text-white'
                        : 'text-red-100 hover:bg-white/10 hover:text-white'
                    } ${isExpanded ? '' : 'justify-center'}`}
                    title={!isExpanded ? item.label : ''}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    <span
                      className={`font-medium transition-all duration-300 whitespace-nowrap ${
                        isExpanded
                          ? 'opacity-100 ml-3'
                          : 'opacity-0 w-0 overflow-hidden'
                      }`}
                    >
                      {item.label}
                    </span>
                  </a>
                </li>
              ))}
          </ul>
        </nav>

        {/* Bloc Administration */}
        <nav className="p-2 mt-auto">
          <ul>
            {menuItems
              .filter(item => item.label === 'Administration') // uniquement Administration
              .map((item, index) => (
                <li key={index}>
                  <a
                    href="#"
                    className={`flex items-center px-2 py-2 rounded-lg transition-all duration-300 group ${
                      item.active
                        ? 'bg-white/20 text-white'
                        : 'text-red-100 hover:bg-white/10 hover:text-white'
                    } ${isExpanded ? '' : 'justify-center'}`}
                    title={!isExpanded ? item.label : ''}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    <span
                      className={`font-medium transition-all duration-300 whitespace-nowrap ${
                        isExpanded
                          ? 'opacity-100 ml-3'
                          : 'opacity-0 w-0 overflow-hidden'
                      }`}
                    >
                      {item.label}
                    </span>
                  </a>
                </li>
              ))}
          </ul>
        </nav>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-red-400/50">
        <div className={`text-xs text-red-100 transition-all duration-300 ${
          isExpanded ? 'opacity-100' : 'opacity-0'
        }`}>
          Version 1.0.0
        </div>
      </div>
    </div>
  );
}
