import { useCallback, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { SortState } from '@/components/PresenceList';

const FR_DATE_RE = /^(\d{2})\/(\d{2})\/(\d{4})$/;

/** Convertit une date `jj/mm/aaaa` en timestamp ; NaN si le format ne correspond pas. */
function parseFrDate(value: string): number {
  const match = value.match(FR_DATE_RE);
  if (!match) return Number.NaN;
  return new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1])).getTime();
}

interface UseTableSortOptions {
  /** Clés dont la valeur est une date `jj/mm/aaaa` (triées chronologiquement). */
  dateKeys?: string[];
}

/**
 * Gère le tri d'un tableau de lignes par colonne, déclenché au clic sur l'en-tête.
 * Le cycle de tri est : aucun → ascendant → descendant → aucun.
 */
export function useTableSort<T extends Record<string, ReactNode>>(
  rows: T[],
  options?: UseTableSortOptions,
) {
  const [sortState, setSortState] = useState<SortState<T> | null>(null);
  const dateKeys = options?.dateKeys;

  const toggleSort = useCallback((key: keyof T) => {
    setSortState((prev) => {
      if (!prev || prev.key !== key) return { key, direction: 'asc' };
      if (prev.direction === 'asc') return { key, direction: 'desc' };
      return null;
    });
  }, []);

  const sortedRows = useMemo(() => {
    if (!sortState) return rows;
    const { key, direction } = sortState;
    const factor = direction === 'asc' ? 1 : -1;
    const isDate = dateKeys?.includes(String(key)) ?? false;

    return [...rows].sort((a, b) => {
      const av = String(a[key] ?? '');
      const bv = String(b[key] ?? '');

      if (isDate) {
        const at = parseFrDate(av);
        const bt = parseFrDate(bv);
        const aInvalid = Number.isNaN(at);
        const bInvalid = Number.isNaN(bt);
        // Valeurs vides ou invalides toujours reléguées en fin de liste.
        if (aInvalid && bInvalid) return 0;
        if (aInvalid) return 1;
        if (bInvalid) return -1;
        return (at - bt) * factor;
      }

      return av.localeCompare(bv, 'fr', { sensitivity: 'base' }) * factor;
    });
  }, [rows, sortState, dateKeys]);

  return { sortState, toggleSort, sortedRows };
}
