import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center justify-center w-full py-20', className)}>
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
}
