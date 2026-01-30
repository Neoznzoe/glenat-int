import { useState, useCallback, useMemo } from 'react';

/**
 * [PERF] rerender-functional-setstate: Hook pour gérer l'état expand/collapse de plusieurs listes
 * Utilise des callbacks stables pour éviter les re-renders inutiles
 */
export interface ExpandableListState<T extends string> {
  expanded: Record<T, boolean>;
  isExpanded: (key: T) => boolean;
  expand: (key: T) => void;
  collapse: (key: T) => void;
  toggle: (key: T) => void;
}

export function useExpandableList<T extends string>(
  keys: readonly T[],
  initialExpanded: Partial<Record<T, boolean>> = {}
): ExpandableListState<T> {
  const [expanded, setExpanded] = useState<Record<T, boolean>>(() => {
    const initial = {} as Record<T, boolean>;
    for (const key of keys) {
      initial[key] = initialExpanded[key] ?? false;
    }
    return initial;
  });

  const isExpanded = useCallback((key: T) => expanded[key] ?? false, [expanded]);

  const expand = useCallback((key: T) => {
    setExpanded(prev => ({ ...prev, [key]: true }));
  }, []);

  const collapse = useCallback((key: T) => {
    setExpanded(prev => ({ ...prev, [key]: false }));
  }, []);

  const toggle = useCallback((key: T) => {
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  return useMemo(() => ({
    expanded,
    isExpanded,
    expand,
    collapse,
    toggle,
  }), [expanded, isExpanded, expand, collapse, toggle]);
}
