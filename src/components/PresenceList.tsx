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
  onSearch,
  onSort,
  onShowMore,
}: PresenceListProps<T>) {
  const displayCount = count ?? rows.length;

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <span className="text-sm text-muted-foreground">{displayCount}</span>
      </CardHeader>
      <CardContent>
        {(searchable || sortable) && (
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            {searchable && (
              <Input
                placeholder="Rechercher..."
                onChange={(e) => onSearch?.(e.target.value)}
              />
            )}
            {sortable && (
              <Select onValueChange={(value) => onSort?.(value as keyof T)}>
                <SelectTrigger className="sm:w-[180px]">
                  <SelectValue placeholder="Trier" />
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
        )}

        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={String(col.key)}>{col.label}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, idx) => (
              <TableRow key={idx}>
                {columns.map((col) => (
                  <TableCell key={String(col.key)}>{row[col.key]}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {showMore && (
          <div className="flex justify-end mt-4">
            <Button variant="outline" size="sm" onClick={() => onShowMore?.()}>
              Voir plus
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default PresenceList;
