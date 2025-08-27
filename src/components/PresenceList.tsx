import type { ReactNode } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';

export interface PresenceListColumn<T> {
  key: keyof T;
  label: string;
}

export interface PresenceListProps<T extends Record<string, ReactNode>> {
  title: string;
  columns: PresenceListColumn<T>[];
  rows: T[];
  count?: number;
  searchable?: boolean;
  sortable?: boolean;
  showMore?: boolean;
  /**
   * When set to 'embedded', the list renders without its own Card wrapper so it
   * can be placed inside an existing Card.
   */
  variant?: 'card' | 'embedded';
  onSearch?: (value: string) => void;
  onSort?: (value: keyof T) => void;
  onShowMore?: () => void;
}

export function PresenceList<T extends Record<string, ReactNode>>({
  title,
  columns,
  rows,
  count,
  searchable,
  sortable,
  showMore,
  variant = 'card',
  onSearch,
  onSort,
  onShowMore,
}: PresenceListProps<T>) {
  const displayCount = count ?? rows.length;
  const isTwoColumn = columns.length === 2;
  const controls =
    (searchable || sortable) && (
      <div className="flex items-center gap-2 mb-4">
        {searchable && (
          <Input
            className="flex-1"
            placeholder="Rechercher..."
            onChange={(e) => onSearch?.(e.target.value)}
          />
        )}
        {sortable && (
          <Select onValueChange={(value) => onSort?.(value as keyof T)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Trier par" />
            </SelectTrigger>
            <SelectContent>
              {columns.map((col) => (
                <SelectItem key={String(col.key)} value={String(col.key)}>
                  {col.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    );

  const table = (
    <div className="rounded-md border">
      <Table className={isTwoColumn ? 'table-fixed' : undefined}>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead
                key={String(col.key)}
                className={isTwoColumn ? 'w-1/2' : undefined}
              >
                {col.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, idx) => (
            <TableRow key={idx}>
              {columns.map((col) => (
                <TableCell
                  key={String(col.key)}
                  className={isTwoColumn ? 'w-1/2' : undefined}
                >
                  {row[col.key]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  const footer =
    showMore && (
      <div className="flex justify-end mt-auto pt-4">
        <Button variant="default" size="sm" onClick={() => onShowMore?.()}>
          Voir plus
        </Button>
      </div>
    );

  if (variant === 'embedded') {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold leading-none tracking-tight">
            {title}
          </h2>
          <span className="text-2xl font-semibold">{displayCount}</span>
        </div>
        <div className="flex flex-col flex-1">
          {controls}
          {table}
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
        {footer}
      </CardContent>
    </Card>
  );
}

export default PresenceList;
