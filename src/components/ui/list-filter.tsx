import { Checkbox } from '@/components/ui/checkbox';

interface ListFilterProps {
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
}

export function ListFilter({ options, selected, onToggle }: ListFilterProps) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {options.map(option => (
        <label key={option} className="flex items-center space-x-2 text-sm">
          <Checkbox
            checked={selected.includes(option)}
            onCheckedChange={() => onToggle(option)}
          />
          <span>{option}</span>
        </label>
      ))}
    </div>
  );
}

export default ListFilter;
