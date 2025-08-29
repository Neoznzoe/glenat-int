import { useState } from 'react';
import { ListFilter as ListFilterIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import ListFilter from '@/components/ui/list-filter';

const formats = ['Album', 'Poche', 'Intégrale'];
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
const themes = [
  'Aventure',
  'Psychologie',
  'Écologie',
  'Histoire',
  'Fantastique',
  'Science-fiction',
  'Romance',
  'Mystère',
  'Humour',
  'Cuisine',
  'Sport',
  'Art',
  'Politique',
  'Technologie',
];

export function BookFilters() {
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
  const [selectedEditions, setSelectedEditions] = useState<string[]>([]);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>([]);
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
    selectedFormats.length +
    selectedEditions.length +
    selectedCollections.length +
    selectedThemes.length +
    selectedAvailability.length +
    (isNew ? 1 : 0) +
    (comingSoon ? 1 : 0);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <ListFilterIcon className="mr-2 h-4 w-4" />
          Filtres {count > 0 && `(${count})`}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 space-y-4">
        <div>
          <h4 className="mb-2 font-medium">Format</h4>
          <ListFilter
            options={formats}
            selected={selectedFormats}
            onToggle={val => toggle(selectedFormats, setSelectedFormats, val)}
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
          <h4 className="mb-2 font-medium">Thèmes</h4>
          <ListFilter
            options={themes}
            selected={selectedThemes}
            onToggle={val => toggle(selectedThemes, setSelectedThemes, val)}
          />
        </div>
        <div>
          <h4 className="mb-2 font-medium">Parution</h4>
          <div className="flex gap-4 overflow-x-auto">
            <label className="flex items-center space-x-2 whitespace-nowrap">
              <Checkbox
                checked={isNew}
                onCheckedChange={checked => setIsNew(checked === true)}
              />
              <span>Nouveauté</span>
            </label>
            <label className="flex items-center space-x-2 whitespace-nowrap">
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
