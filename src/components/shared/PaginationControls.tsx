import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Pagination } from '@/types';

interface PaginationControlsProps {
  pagination: Pagination;
  onPageChange: (page: number) => void;
}

export default function PaginationControls({ pagination, onPageChange }: PaginationControlsProps) {
  const { page, total_pages, total, limit } = pagination;
  
  if (total_pages <= 1) return null;

  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="flex items-center justify-between mt-6">
      <p className="text-sm text-muted-foreground">
        Showing <span className="font-medium text-gray-900">{from}–{to}</span> of{' '}
        <span className="font-medium text-gray-900">{total}</span> events
      </p>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        {Array.from({ length: total_pages }, (_, i) => i + 1)
          .filter((p) => p === 1 || p === total_pages || Math.abs(p - page) <= 1)
          .reduce<(number | '...')[]>((acc, p, idx, arr) => {
            if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('...');
            acc.push(p);
            return acc;
          }, [])
          .map((p, idx) =>
            p === '...' ? (
              <span key={`ellipsis-${idx}`} className="px-1.5 text-muted-foreground text-sm">
                …
              </span>
            ) : (
              <Button
                key={p}
                variant={p === page ? 'default' : 'outline'}
                size="icon"
                className="h-8 w-8 text-xs"
                onClick={() => onPageChange(p as number)}
              >
                {p}
              </Button>
            )
          )}
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={page === total_pages}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
