import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';

export interface PresenceListProps {
  title: string;
  count: number;
  rows: { name: string; status: string }[];
  searchable?: boolean;
  sortable?: boolean;
  showMore?: boolean;
  onSearch?: (value: string) => void;
  onSort?: (value: string) => void;
  onShowMore?: () => void;
}

export function PresenceList({
  title,
  count,
  rows,
  searchable,
  sortable,
  showMore,
  onSearch,
  onSort,
  onShowMore,
}: PresenceListProps) {
  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <span className="text-sm text-muted-foreground">{count}</span>
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
              <Select onValueChange={(value) => onSort?.(value)}>
                <SelectTrigger className="sm:w-[180px]">
                  <SelectValue placeholder="Trier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Nom</SelectItem>
                  <SelectItem value="status">Statut</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        )}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, idx) => (
              <TableRow key={idx}>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.status}</TableCell>
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
