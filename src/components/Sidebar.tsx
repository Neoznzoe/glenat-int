import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import clsx from "clsx";
import { Pin, PinOff } from "lucide-react";
import { SidebarSkeleton } from "@/components/SidebarSkeleton";
import { useVisibleModules } from "@/hooks/useVisibleModules";
import { resolveLucideIcon } from "@/lib/icons";
import type { VisibleModule } from "@/types/sidebar";

const ADMIN_SECTION_KEY = "administration";

export type SidebarProps = {
  jobCount?: number;
  onExpandChange?: (expanded: boolean) => void;
};

export function Sidebar({ jobCount, onExpandChange }: SidebarProps): JSX.Element {
  const location = useLocation();
  const [isPinned, setIsPinned] = useState<boolean>(true);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const { data, loading, error } = useVisibleModules();

  const isExpanded = isPinned || isHovered;

  useEffect(() => {
    onExpandChange?.(isExpanded);
  }, [isExpanded, onExpandChange]);

  const [principalModules, administrationModules] = useMemo(() => {
    if (!data) {
      return [[], []] as [VisibleModule[], VisibleModule[]];
    }

    const administration: VisibleModule[] = [];
    const principal: VisibleModule[] = [];

    for (const module of data) {
      if ((module.section ?? "").toLowerCase() === ADMIN_SECTION_KEY) {
        administration.push(module);
      } else {
        principal.push(module);
      }
    }

    return [principal, administration] as [VisibleModule[], VisibleModule[]];
  }, [data]);

  return (
    <aside
      className={clsx(
        "group/sidebar relative flex h-full flex-col border-r border-border bg-background transition-all duration-200",
        isExpanded ? "w-64" : "w-16"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <header className="flex items-center justify-between px-2 py-3">
        <span
          className={clsx(
            "flex items-center gap-2 text-sm font-semibold",
            !isExpanded && "sr-only"
          )}
        >
          Navigation
          {typeof jobCount === "number" ? (
            <span className="inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-primary/10 px-1.5 text-[10px] font-semibold text-primary">
              {jobCount}
            </span>
          ) : null}
        </span>
        <button
          type="button"
          className={clsx(
            "inline-flex items-center gap-1 rounded-md border border-transparent px-2 py-1 text-xs font-medium",
            "text-muted-foreground transition hover:bg-muted",
            !isExpanded && "mx-auto"
          )}
          onClick={() => setIsPinned((value) => !value)}
          aria-pressed={isPinned}
        >
          {isPinned ? <PinOff className="h-4 w-4" aria-hidden /> : <Pin className="h-4 w-4" aria-hidden />}
          {isExpanded ? <span>{isPinned ? "Détacher" : "Épingler"}</span> : null}
        </button>
      </header>

      <nav className="flex-1 space-y-6 overflow-y-auto px-2 pb-6" aria-label="Navigation principale">
        {loading ? (
          <SidebarSkeleton count={6} isExpanded={isExpanded} />
        ) : (
          <>
            {error ? (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {error}
              </p>
            ) : null}

            <SidebarSection
              title="Principal"
              modules={principalModules}
              isExpanded={isExpanded}
              currentPath={location.pathname}
            />

            {administrationModules.length > 0 ? (
              <SidebarSection
                title="Administration"
                modules={administrationModules}
                isExpanded={isExpanded}
                currentPath={location.pathname}
              />
            ) : null}
          </>
        )}
      </nav>
    </aside>
  );
}

type SidebarSectionProps = {
  title: string;
  modules: VisibleModule[];
  isExpanded: boolean;
  currentPath: string;
};

function SidebarSection({ title, modules, isExpanded, currentPath }: SidebarSectionProps): JSX.Element | null {
  if (modules.length === 0) {
    return null;
  }

  return (
    <section>
      <h2 className={clsx("mb-2 px-2 text-xs font-semibold uppercase text-muted-foreground", !isExpanded && "sr-only")}>
        {title}
      </h2>
      <ul className="space-y-1">
        {modules.map((module) => (
          <SidebarItem
            key={module.id}
            module={module}
            isExpanded={isExpanded}
            currentPath={currentPath}
          />
        ))}
      </ul>
    </section>
  );
}

type SidebarItemProps = {
  module: VisibleModule;
  isExpanded: boolean;
  currentPath: string;
};

function SidebarItem({ module, isExpanded, currentPath }: SidebarItemProps): JSX.Element {
  const Icon = resolveLucideIcon(module.icon);
  const isActive = currentPath.startsWith(module.path);

  return (
    <li>
      <Link
        to={module.path}
        className={clsx(
          "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition",
          isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
        )}
        aria-current={isActive ? "page" : undefined}
        title={module.name}
      >
        {Icon ? (
          <Icon className="h-4 w-4" aria-hidden />
        ) : (
          <span className="flex h-6 w-6 items-center justify-center rounded bg-muted text-xs font-semibold uppercase">
            {module.name ? module.name.charAt(0).toUpperCase() : "?"}
          </span>
        )}
        {isExpanded ? <span className="truncate">{module.name}</span> : null}
      </Link>
    </li>
  );
}

export default Sidebar;
