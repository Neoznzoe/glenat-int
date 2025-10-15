import type { FC } from 'react';
import { useSidebarModules, type ModuleDto } from '../hooks/useSidebarModules';

const ICONS: Record<string, string> = {
  home: '🏠',
  book: '📚',
  calendar: '🗓️',
  briefcase: '🧰',
  settings: '⚙️',
};

const getIcon = (icon?: string | null) => {
  if (!icon) {
    return '•';
  }
  return ICONS[icon] ?? '•';
};

const SidebarSection: FC<{ title: string; items: ModuleDto[] }> = ({ title, items }) => (
  <section className="mb-6">
    <h2 className="text-xs font-semibold uppercase text-slate-500 mb-2">{title}</h2>
    <ul className="space-y-1">
      {items.map((module) => (
        <li key={module.id}>
          <a href={module.path} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-slate-100">
            <span aria-hidden>{getIcon(module.icon)}</span>
            <span>{module.name}</span>
          </a>
        </li>
      ))}
    </ul>
  </section>
);

/**
 * Minimal sidebar component powered by the visibility API.
 */
export const Sidebar: FC = () => {
  const { modules, isLoading, error } = useSidebarModules();

  if (isLoading) {
    return <aside className="w-64 p-4">Chargement…</aside>;
  }

  if (error) {
    return (
      <aside className="w-64 p-4 text-sm text-red-600">
        Impossible de charger la navigation.
      </aside>
    );
  }

  const adminModules = modules.filter((module) => module.section?.toLowerCase() === 'administration');
  const mainModules = modules.filter((module) => module.section?.toLowerCase() !== 'administration');

  return (
    <aside className="w-64 p-4 border-r border-slate-200">
      <SidebarSection title="Navigation" items={mainModules} />
      {adminModules.length > 0 && <SidebarSection title="Administration" items={adminModules} />}
      {/* La vérification reste côté serveur ; garder le rendu côté client simple évite d'exposer des modules interdits. */}
    </aside>
  );
};
