import { Checkbox } from '@/components/ui/checkbox';

interface ListFilterProps {
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
}

export function ListFilter({ options, selected, onToggle }: ListFilterProps) {
  return (
    <div className="grid max-h-48 grid-cols-5 gap-4 overflow-y-auto">
      {options.map(option => (
        <label key={option} className="flex items-center space-x-2 text-sm">
          <Checkbox
            checked={selected.includes(option)}
            onCheckedChange={() => onToggle(option)}
          />
          <span className="truncate">{option}</span>
        </label>
      ))}
    </div>
  );
}

export default ListFilter;
