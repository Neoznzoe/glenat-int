import { useState } from 'react';
import { Filter } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

const genres = ['BD', 'Manga', 'Jeunesse', 'Documentaire', 'Voyage'];
const formats = ['Album', 'Poche', 'Intégrale'];
const langues = ['Français', 'Anglais', 'Japonais'];

export function BookFilters() {
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
  const [selectedLangues, setSelectedLangues] = useState<string[]>([]);

  const toggle = (
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    value: string
  ) => {
    setList(prev =>
      prev.includes(value)
        ? prev.filter(v => v !== value)
        : [...prev, value]
    );
  };

  const count =
    selectedGenres.length + selectedFormats.length + selectedLangues.length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Filter className="mr-2 h-4 w-4" />
          Filtres {count > 0 && `(${count})`}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Genre</DropdownMenuLabel>
        {genres.map(g => (
          <DropdownMenuCheckboxItem
            key={g}
            checked={selectedGenres.includes(g)}
            onCheckedChange={() => toggle(selectedGenres, setSelectedGenres, g)}
          >
            {g}
          </DropdownMenuCheckboxItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Format</DropdownMenuLabel>
        {formats.map(f => (
          <DropdownMenuCheckboxItem
            key={f}
            checked={selectedFormats.includes(f)}
            onCheckedChange={() => toggle(selectedFormats, setSelectedFormats, f)}
          >
            {f}
          </DropdownMenuCheckboxItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Langue</DropdownMenuLabel>
        {langues.map(l => (
          <DropdownMenuCheckboxItem
            key={l}
            checked={selectedLangues.includes(l)}
            onCheckedChange={() => toggle(selectedLangues, setSelectedLangues, l)}
          >
            {l}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default BookFilters;

