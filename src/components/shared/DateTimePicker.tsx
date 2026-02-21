import * as React from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface DateTimePickerProps {
  value?: string; // ISO or local datetime string
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  minDate?: Date;
}

export default function DateTimePicker({
  value,
  onChange,
  placeholder = 'Pick a date & time',
  disabled,
  minDate,
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false);

  // Parse current value into date and time parts
  const selected = value ? new Date(value) : undefined;
  const timeValue = selected
    ? format(selected, 'HH:mm')
    : '00:00';

  const handleDaySelect = (day: Date | undefined) => {
    if (!day) return;
    // Preserve the current time when picking a new day
    const [hours, minutes] = timeValue.split(':').map(Number);
    const merged = new Date(day);
    merged.setHours(hours, minutes, 0, 0);
    onChange(format(merged, "yyyy-MM-dd'T'HH:mm"));
    setOpen(false);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [hours, minutes] = e.target.value.split(':').map(Number);
    const base = selected ?? new Date();
    const merged = new Date(base);
    merged.setHours(hours, minutes, 0, 0);
    onChange(format(merged, "yyyy-MM-dd'T'HH:mm"));
  };

  return (
    <div className="flex gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            className={cn(
              'flex-1 justify-start text-left font-normal',
              !selected && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
            {selected ? format(selected, 'PPP') : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selected}
            onSelect={handleDaySelect}
            disabled={minDate ? (date) => date < minDate : undefined}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      {/* Time input */}
      <Input
        type="time"
        value={timeValue}
        onChange={handleTimeChange}
        disabled={disabled}
        className="w-28 shrink-0"
      />
    </div>
  );
}
