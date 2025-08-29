import { Checkbox } from '@/components/ui/checkbox';

interface ListFilterProps {
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
}

export function ListFilter({ options, selected, onToggle }: ListFilterProps) {
  return (
    <div className="flex flex-nowrap gap-4 overflow-x-auto">
      {options.map(option => (
        <label
          key={option}
          className="flex items-center space-x-2 whitespace-nowrap text-sm"
        >
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
