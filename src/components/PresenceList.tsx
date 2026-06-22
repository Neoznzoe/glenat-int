import type { ReactNode } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react';

export interface PresenceListColumn<T> {
  key: keyof T;
  label: string;
}

export type SortDirection = 'asc' | 'desc';

export interface SortState<T> {
  key: keyof T;
  direction: SortDirection;
}

export interface PresenceListProps<T extends Record<string, ReactNode>> {
  title: string;
  columns: PresenceListColumn<T>[];
  rows: T[];
  count?: number;
  searchable?: boolean;
  sortable?: boolean;
  /** Optional list of keys allowed for sorting; defaults to all columns. */
  sortKeys?: (keyof T)[];
  /** Current sort applied to the rows, used to render the header indicators. */
  sortState?: SortState<T> | null;
  /** Optional function to style each row. */
  rowClassName?: (row: T, index: number) => string | undefined;
  showMore?: boolean;
  showLess?: boolean;
  emptyMessage?: string;
  /**
   * When set to 'embedded', the list renders without its own Card wrapper so it
   * can be placed inside an existing Card.
   */
  variant?: 'card' | 'embedded';
  onSearch?: (value: string) => void;
  /** Called with the column key when the user clicks a sortable header. */
  onSort?: (value: keyof T) => void;
  onShowMore?: () => void;
  onShowLess?: () => void;
}

export function PresenceList<T extends Record<string, ReactNode>>({
  title,
  columns,
  rows,
  count,
  searchable,
  sortable,
  sortKeys,
  sortState,
  rowClassName,
  showMore,
  showLess,
  emptyMessage,
  variant = 'card',
  onSearch,
  onSort,
  onShowMore,
  onShowLess,
}: PresenceListProps<T>) {
  const displayCount = count ?? rows.length;
  const isTwoColumn = columns.length === 2;
  const hasRows = rows.length > 0;

  // Colonnes triables : restreintes par `sortKeys` si fourni, sinon toutes.
  const isSortable = (key: keyof T) =>
    Boolean(sortable) && (sortKeys ? sortKeys.includes(key) : true);

  const controls =
    searchable && (
      <div className="flex items-center gap-2 mb-4">
        <Input
          className="flex-1"
          placeholder="Rechercher..."
          onChange={(e) => onSearch?.(e.target.value)}
        />
      </div>
    );

  const table =
    hasRows && (
      <div className="rounded-md border">
        <Table className={isTwoColumn ? 'table-fixed' : undefined}>
          <TableHeader>
            <TableRow>
              {columns.map((col) => {
                const sortableColumn = isSortable(col.key);
                const isActive = sortState?.key === col.key;
                return (
                  <TableHead
                    key={String(col.key)}
                    className={isTwoColumn ? 'w-1/2' : undefined}
                    aria-sort={
                      isActive
                        ? sortState?.direction === 'asc'
                          ? 'ascending'
                          : 'descending'
                        : undefined
                    }
                  >
                    {sortableColumn ? (
                      <button
                        type="button"
                        onClick={() => onSort?.(col.key)}
                        className="-ml-1 inline-flex items-center gap-1 rounded px-1 py-0.5 font-medium hover:text-foreground focus:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      >
                        {col.label}
                        {isActive ? (
                          sortState?.direction === 'asc' ? (
                            <ArrowUp className="h-3.5 w-3.5" />
                          ) : (
                            <ArrowDown className="h-3.5 w-3.5" />
                          )
                        ) : (
                          <ChevronsUpDown className="h-3.5 w-3.5 opacity-40" />
                        )}
                      </button>
                    ) : (
                      col.label
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* [PERF] rendering-conditional-render: Utiliser des clés stables basées sur les données */}
            {rows.map((row, idx) => {
              // Générer une clé stable basée sur les valeurs de la ligne
              const rowKey = columns.map(col => String(row[col.key] ?? '')).join('-') || `row-${idx}`;
              return (
                <TableRow key={rowKey} className={rowClassName?.(row, idx)}>
                  {columns.map((col) => (
                    <TableCell
                      key={String(col.key)}
                      className={isTwoColumn ? 'w-1/2' : undefined}
                    >
                      {row[col.key]}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    );

  const emptyState =
    !hasRows && emptyMessage ? (
      <p className="text-sm text-muted-foreground">{emptyMessage}</p>
    ) : null;

  const footer =
    hasRows && (showMore || showLess) && (
      <div className="flex justify-end mt-auto pt-4">
        <Button
          variant="default"
          size="sm"
          onClick={() => (showMore ? onShowMore?.() : onShowLess?.())}
        >
          {showMore ? 'Voir plus' : 'Voir moins'}
        </Button>
      </div>
    );

  if (variant === 'embedded') {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold leading-none">
            {title}
          </h2>
          <span className="text-2xl font-semibold">{displayCount}</span>
        </div>
        <div className="flex flex-col flex-1">
          {controls}
          {table}
          {emptyState}
          {footer}
        </div>
      </div>
    );
  }

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>{title}</CardTitle>
        <span className="text-2xl font-semibold">{displayCount}</span>
      </CardHeader>
      <CardContent className="flex flex-col flex-1">
        {controls}
        {table}
        {emptyState}
        {footer}
      </CardContent>
    </Card>
  );
}

export default PresenceList;
