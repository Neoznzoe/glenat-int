import {
  House,
  Calendar,
  People,
  FileText,
  Gear,
  BarChart,
  Building,
  PinFill,
  Pin
} from 'react-bootstrap-icons';
import { useState } from 'react';

const menuItems = [
  { icon: House, label: 'Accueil', active: true },
  { icon: Calendar, label: 'Calendrier', active: false },
  { icon: People, label: 'Équipe', active: false },
  { icon: FileText, label: 'Documents', active: false },
  { icon: BarChart, label: 'Statistiques', active: false },
  { icon: Gear, label: 'Paramètres', active: false },
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
      {/* Logo */}
      <div className="p-4 border-b border-red-400/20 flex items-center justify-between min-h-[64px]">
        <div className="flex items-center space-x-3">
          <Building className="h-8 w-8 flex-shrink-0" />
          <h1 className={`text-xl font-bold transition-all duration-300 ${
            isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'
          }`}>
            Dashboard
          </h1>
        </div>
        
        {/* Bouton de verrouillage */}
        <button
          onClick={() => setIsPinned(!isPinned)}
          className={`p-1 rounded hover:bg-white/20 transition-all duration-300 ${
            isExpanded ? 'opacity-100' : 'opacity-0'
          }`}
          title={isPinned ? 'Déverrouiller la sidebar' : 'Verrouiller la sidebar'}
        >
          {isPinned ? (
            <PinFill className="h-4 w-4" />
          ) : (
            <Pin className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-2">
        <ul className="space-y-1">
          {menuItems.map((item, index) => (
            <li key={index}>
              <a
                href="#"
                className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-300 group ${
                  item.active
                    ? 'bg-white/20 text-white'
                    : 'text-red-100 hover:bg-white/10 hover:text-white'
                }`}
                title={!isExpanded ? item.label : ''}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span className={`font-medium transition-all duration-300 whitespace-nowrap ${
                  isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'
                }`}>
                  {item.label}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-red-400/20">
        <div className={`text-xs text-red-100 transition-all duration-300 ${
          isExpanded ? 'opacity-100' : 'opacity-0'
        }`}>
          Version 1.0.0
        </div>
      </div>

      {/* Indicateur de survol quand collapsed */}
      {!isPinned && !isHovered && (
        <div className="absolute right-0 top-1/2 transform translate-x-1 -translate-y-1/2">
          <div className="w-1 h-8 bg-white/30 rounded-r"></div>
        </div>
      )}
    </div>
  );
}