import { useState } from 'react';
import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import ListFilter from '@/components/ui/list-filter';

const genres = ['BD', 'Manga', 'Jeunesse', 'Documentaire', 'Voyage'];
const formats = ['Album', 'Poche', 'Intégrale'];
const langues = ['Français', 'Anglais', 'Japonais'];
const editions = [
  'Adonis',
  'Blanche',
  'Comix Buro',
  'Disney',
  'Éditions licences',
  'Cheval Magazine',
  'Glénat BD',
  'Glénat Jeunesse',
  'Glénat Manga',
  'Hugo',
  'Livres diffusés',
  'Rando éditions',
  'Glénat Livres',
  "Vent d'Ouest",
];
const collections = ['Coffrets', 'Éditions limitées', 'Collector'];
const availability = ['En stock', 'À réimprimer', 'Épuisé'];
const years = Array.from({ length: 10 }, (_, i) => (new Date().getFullYear() - i).toString());

export function BookFilters() {
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
  const [selectedLangues, setSelectedLangues] = useState<string[]>([]);
  const [selectedEditions, setSelectedEditions] = useState<string[]>([]);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<string | undefined>();
  const [isNew, setIsNew] = useState(false);
  const [comingSoon, setComingSoon] = useState(false);

  const toggle = (
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    value: string
  ) => {
    setList(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    );
  };

  const count =
    selectedGenres.length +
    selectedFormats.length +
    selectedLangues.length +
    selectedEditions.length +
    selectedCollections.length +
    selectedAvailability.length +
    (selectedYear ? 1 : 0) +
    (isNew ? 1 : 0) +
    (comingSoon ? 1 : 0);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <Filter className="mr-2 h-4 w-4" />
          Filtres {count > 0 && `(${count})`}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 space-y-4">
        <div>
          <h4 className="mb-2 font-medium">Genre</h4>
          <ListFilter
            options={genres}
            selected={selectedGenres}
            onToggle={val => toggle(selectedGenres, setSelectedGenres, val)}
          />
        </div>
        <div>
          <h4 className="mb-2 font-medium">Format</h4>
          <ListFilter
            options={formats}
            selected={selectedFormats}
            onToggle={val => toggle(selectedFormats, setSelectedFormats, val)}
          />
        </div>
        <div>
          <h4 className="mb-2 font-medium">Langue</h4>
          <ListFilter
            options={langues}
            selected={selectedLangues}
            onToggle={val => toggle(selectedLangues, setSelectedLangues, val)}
          />
        </div>
        <div>
          <h4 className="mb-2 font-medium">Maison d'éditions</h4>
          <ListFilter
            options={editions}
            selected={selectedEditions}
            onToggle={val => toggle(selectedEditions, setSelectedEditions, val)}
          />
        </div>
        <div>
          <h4 className="mb-2 font-medium">Collections spéciales</h4>
          <ListFilter
            options={collections}
            selected={selectedCollections}
            onToggle={val => toggle(selectedCollections, setSelectedCollections, val)}
          />
        </div>
        <div>
          <h4 className="mb-2 font-medium">Filtres temporels</h4>
          <div className="grid grid-cols-3 gap-2">
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger>
                <SelectValue placeholder="Année" />
              </SelectTrigger>
              <SelectContent>
                {years.map(year => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <label className="flex items-center space-x-2">
              <Checkbox
                checked={isNew}
                onCheckedChange={checked => setIsNew(checked === true)}
              />
              <span>Nouveauté</span>
            </label>
            <label className="flex items-center space-x-2">
              <Checkbox
                checked={comingSoon}
                onCheckedChange={checked => setComingSoon(checked === true)}
              />
              <span>À paraître</span>
            </label>
          </div>
        </div>
        <div>
          <h4 className="mb-2 font-medium">Disponibilité</h4>
          <ListFilter
            options={availability}
            selected={selectedAvailability}
            onToggle={val => toggle(selectedAvailability, setSelectedAvailability, val)}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default BookFilters;
