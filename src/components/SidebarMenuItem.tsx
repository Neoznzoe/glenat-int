import type { LucideIcon } from 'lucide-react';
import { SecureNavLink } from '@/components/routing/SecureLink';

interface SidebarMenuItemProps {
  id: string;
  label: string;
  path: string;
  icon: LucideIcon | null;
  badge?: number | string;
  isActive: boolean;
  isExpanded: boolean;
  variant?: 'link' | 'home' | 'admin-button';
  onClick?: () => void;
}

export function SidebarMenuItem({ label, path, icon: Icon, badge, isActive, isExpanded, variant = 'link', onClick }: SidebarMenuItemProps) {
  const baseClass = `flex items-center w-full px-2 py-2 rounded-lg transition-all duration-300 group ${isExpanded ? 'space-x-3' : 'justify-center'}`;
  const activeClass = isActive ? 'bg-white/20 text-white' : 'text-red-100 hover:bg-white/10 hover:text-white';
  const className = variant === 'admin-button' ? `${baseClass} text-red-100 hover:bg-white/10 hover:text-white` : `${baseClass} ${activeClass}`;

  const iconElement = Icon ? (
    <Icon className="h-5 w-5 flex-shrink-0" />
  ) : (
    <span className="h-5 w-5 flex-shrink-0 flex items-center justify-center rounded-full bg-white/20 text-xs font-semibold uppercase">
      {label.charAt(0)}
    </span>
  );

  const labelElement = (
    <span className={`font-medium transition-all duration-300 whitespace-nowrap ${isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'}`}>
      {label}
    </span>
  );

  const badgeElement = badge !== undefined ? (
    <span className="absolute -top-[6px] -right-[6px] bg-white text-primary text-xs font-bold rounded-full px-1 min-h-[20px] min-w-[20px] flex items-center justify-center">
      {badge}
    </span>
  ) : null;

  if (variant === 'home') {
    return (
      <li>
        <a href={window.location.origin} className={`relative ${className}`} title={!isExpanded ? label : ''}>
          {iconElement}
          {labelElement}
          {badgeElement}
        </a>
      </li>
    );
  }

  if (variant === 'admin-button') {
    return (
      <li>
        <button onClick={onClick} className={className} title={!isExpanded ? label : ''}>
          {iconElement}
          {labelElement}
        </button>
      </li>
    );
  }

  return (
    <li>
      <SecureNavLink to={path} className={`relative ${className}`} title={!isExpanded ? label : ''}>
        {iconElement}
        {labelElement}
        {badgeElement}
      </SecureNavLink>
    </li>
  );
}
