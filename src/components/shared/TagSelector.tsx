import { Check, Plus, X } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';

import { cn } from '@/lib/utils';

interface TagSelectorProps {
  selectedIds: number[];
  onChange: (ids: number[]) => void;
}

export default function TagSelector({ selectedIds, onChange }: TagSelectorProps) {
  const tags = useAppSelector((s) => s.tags.tags);

  const toggle = (id: number) => {
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter((i) => i !== id)
        : [...selectedIds, id]
    );
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Selected tags */}
      {selectedIds.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedIds.map((id) => {
            const tag = tags.find((t) => t.id === id);
            if (!tag) return null;
            return (
              <span
                key={id}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20"
              >
                {tag.name}
                <button
                  type="button"
                  onClick={() => toggle(id)}
                  className="hover:text-primary/60"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            );
          })}
        </div>
      )}


      {/* Tag list */}
      <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto">
        {tags.map((tag) => {
          const isSelected = selectedIds.includes(tag.id);
          return (
            <button
              key={tag.id}
              type="button"
              onClick={() => toggle(tag.id)}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-colors',
                isSelected
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-primary hover:text-primary'
              )}
            >
              {isSelected && <Check className="w-3 h-3" />}
              {!isSelected && <Plus className="w-3 h-3" />}
              {tag.name}
            </button>
          );
        })}
        {tags.length === 0 && (
          <p className="text-sm text-muted-foreground">No tags found.</p>
        )}
      </div>
    </div>
  );
}
