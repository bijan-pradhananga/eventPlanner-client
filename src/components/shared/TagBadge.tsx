import type { Tag } from '@/types';
import { cn } from '@/lib/utils';

interface TagBadgeProps {
  tag: Tag;
  onClick?: () => void;
  selected?: boolean;
  className?: string;
}

export default function TagBadge({ tag, onClick, selected, className }: TagBadgeProps) {
  const style = tag.color
    ? { backgroundColor: `${tag.color}20`, color: tag.color, borderColor: `${tag.color}40` }
    : undefined;

  return (
    <span
      onClick={onClick}
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border cursor-default',
        !tag.color && (selected
          ? 'bg-primary/10 text-primary border-primary/30'
          : 'bg-gray-100 text-gray-600 border-gray-200'),
        onClick && 'cursor-pointer hover:opacity-80 transition-opacity',
        selected && 'ring-1 ring-primary',
        className
      )}
      style={style}
    >
      #{tag.name}
    </span>
  );
}
