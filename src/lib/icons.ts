import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";

const ALIASES: Record<string, string> = {
  accueil: "Home",
  home: "Home",
  dashboard: "LayoutDashboard",
  tableau: "LayoutDashboard",
  utilisateurs: "Users",
  users: "Users",
  comptes: "UserCircle",
  profil: "User",
  settings: "Settings",
  configuration: "Settings",
  admin: "Shield",
  administration: "Shield",
  reports: "FileText",
  rapports: "FileText",
  analytics: "BarChart3",
  statistiques: "BarChart3",
  billing: "CreditCard",
  paiement: "CreditCard",
  documents: "Folder",
  catalogue: "Book",
};

export function resolveLucideIcon(name?: string | null): LucideIcon | null {
  if (!name) {
    return null;
  }

  const normalized = name.trim().toLowerCase();
  if (normalized.length === 0) {
    return null;
  }

  const mappedName = ALIASES[normalized] ?? toPascalCase(normalized);
  const iconRegistry = LucideIcons as Record<string, unknown>;
  const iconCandidate = iconRegistry[mappedName];

  if (typeof iconCandidate === "function") {
    return iconCandidate as LucideIcon;
  }

  return null;
}

function toPascalCase(value: string): string {
  return value
    .replace(/[-_]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join("");
}
