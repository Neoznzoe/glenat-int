import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface TagInputProps {
  tags: string[];
  setTags: (tags: string[]) => void;
  placeholder?: string;
}

export function TagInput({ tags, setTags, placeholder }: TagInputProps) {
  const [value, setValue] = useState('');

  const addTag = () => {
    const val = value.trim();
    if (val && !tags.includes(val)) {
      setTags([...tags, val]);
    }
    setValue('');
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  return (
    <div className="flex items-center gap-2 rounded-md border px-2 py-1">
      <Search className="h-4 w-4 text-muted-foreground" />
      <div className="flex flex-1 flex-wrap items-center gap-1">
        {tags.map(tag => (
          <Badge key={tag} variant="secondary" className="flex items-center gap-1">
            {tag}
            <X
              className="h-3 w-3 cursor-pointer"
              onClick={() => removeTag(tag)}
            />
          </Badge>
        ))}
        <input
          className="flex-1 border-none bg-transparent text-sm outline-none"
          value={value}
          placeholder={placeholder}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addTag();
            }
          }}
        />
      </div>
      {tags.length > 0 && (
        <X
          className="h-4 w-4 cursor-pointer text-muted-foreground"
          onClick={() => setTags([])}
        />
      )}
    </div>
  );
}

export default TagInput;
