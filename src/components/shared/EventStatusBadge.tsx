import { cn } from '@/lib/utils';

type StatusKey = 'upcoming' | 'past' | 'confirmed' | 'planning' | 'draft' | 'in_progress';

const statusConfig: Record<StatusKey, { label: string; className: string }> = {
  upcoming: { label: 'CONFIRMED', className: 'bg-green-500 text-white' },
  confirmed: { label: 'CONFIRMED', className: 'bg-green-500 text-white' },
  planning: { label: 'PLANNING', className: 'bg-yellow-500 text-white' },
  in_progress: { label: 'IN PROGRESS', className: 'bg-orange-500 text-white' },
  draft: { label: 'DRAFT', className: 'bg-gray-400 text-white' },
  past: { label: 'PAST', className: 'bg-gray-400 text-white' },
};

interface EventStatusBadgeProps {
  status: StatusKey;
  className?: string;
}

export default function EventStatusBadge({ status, className }: EventStatusBadgeProps) {
  const config = statusConfig[status] ?? statusConfig.draft;
  return (
    <span
      className={cn(
        'inline-block px-2 py-0.5 rounded text-[10px] font-bold tracking-wider',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
