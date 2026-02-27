import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarDays, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import TagSelector from '@/components/shared/TagSelector';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import DateTimePicker from '@/components/shared/DateTimePicker';
import { createEventSchema, editEventSchema, type CreateEventFormValues, type EditEventFormValues } from '@/lib/validations';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { createEvent, updateEvent, fetchEventById, clearSelectedEvent } from '@/store/eventsSlice';
import { fetchAllTags } from '@/store/tagsSlice';
import { toast } from 'sonner';
import { format } from 'date-fns';
import ErrorMessage from '@/components/shared/ErrorMessage';

interface EventFormPageProps {
  mode: 'create' | 'edit';
}

function toLocalDatetimeValue(isoString: string) {
  return isoString ? format(new Date(isoString), "yyyy-MM-dd'T'HH:mm") : '';
}

export default function EventFormPage({ mode }: EventFormPageProps) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { isSubmitting, selectedEvent, isLoading } = useAppSelector((s) => s.events);
  const { error } = useAppSelector((s) => s.events);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateEventFormValues | EditEventFormValues>({
    resolver: zodResolver(mode === 'edit' ? editEventSchema : createEventSchema),
    defaultValues: {
      event_type: 'public',
      tag_ids: [],
    },
  });

  const tagIds = watch('tag_ids') ?? [];

  // Load tags
  useEffect(() => {
    dispatch(fetchAllTags());
  }, [dispatch]);

  // Load event when editing
  useEffect(() => {
    if (mode === 'edit' && id) {
      dispatch(fetchEventById(Number(id)));
    }
    return () => { dispatch(clearSelectedEvent()); };
  }, [mode, id, dispatch]);

  // Pre-fill form when event loads
  useEffect(() => {
    if (mode === 'edit' && selectedEvent) {
      reset({
        title: selectedEvent.title,
        description: selectedEvent.description,
        event_date: toLocalDatetimeValue(selectedEvent.event_date),
        event_end_date: selectedEvent.event_end_date
          ? toLocalDatetimeValue(selectedEvent.event_end_date)
          : '',
        location: selectedEvent.location,
        event_type: selectedEvent.event_type,
        tag_ids: Array.isArray(selectedEvent.tags) ? selectedEvent.tags.map((t) => t.id) : [],
      });
    }
  }, [selectedEvent, mode, reset]);

  const onSubmit = async (values: CreateEventFormValues) => {
    const payload = {
      ...values,
      event_date: new Date(values.event_date).toISOString(),
      event_end_date: values.event_end_date
        ? new Date(values.event_end_date).toISOString()
        : undefined,
    };

    if (mode === 'create') {
      const result = await dispatch(createEvent(payload));
      if (createEvent.fulfilled.match(result)) {
        toast.success('Event created successfully!');
        navigate(`/events/${result.payload.id}`);
      } else {
        toast.error(result.payload as string ?? 'Failed to create event');
      }
    } else if (id) {
      const result = await dispatch(updateEvent({ id: Number(id), data: payload }));
      if (updateEvent.fulfilled.match(result)) {
        toast.success('Event updated successfully!');
        navigate(`/events/${id}`);
      } else {
        toast.error(result.payload as string ?? 'Failed to update event');
      }
    }
  };

  if (mode === 'edit' && isLoading) return <LoadingSpinner />;

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      {/* Breadcrumb */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {mode === 'create' ? 'Create New Event' : 'Edit Event'}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Fill in the details below to {mode === 'create' ? 'schedule your upcoming event' : 'update this event'}.
        </p>
      </div>

      {error && (
        <ErrorMessage error={error} />
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        {/* Main Fields */}
        <div className="bg-white rounded-xl p-6 border border-border flex flex-col gap-5">
          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">
              Event Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="e.g. Annual Tech Conference 2026"
              {...register('title')}
            />
            {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">
              Description <span className="text-red-500">*</span>
            </Label>
            <textarea
              id="description"
              rows={5}
              placeholder="Describe what your event is about..."
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
              {...register('description')}
            />
            {errors.description && (
              <p className="text-xs text-red-500">{errors.description.message}</p>
            )}
          </div>
        </div>

        {/* Schedule */}
        <div className="bg-white rounded-xl p-6 border border-border flex flex-col gap-5">
          <div className="flex items-center gap-2 mb-1">
            <CalendarDays className="w-4 h-4 text-muted-foreground" />
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              Schedule
            </p>
          </div>
          <Separator />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>
                Start Date &amp; Time <span className="text-red-500">*</span>
              </Label>
              <DateTimePicker
                value={watch('event_date')}
                onChange={(v) => setValue('event_date', v, { shouldValidate: true })}
                placeholder="Pick start date & time"
                minDate={new Date()}
              />
              {errors.event_date && (
                <p className="text-xs text-red-500">{errors.event_date.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>End Date &amp; Time</Label>
              <DateTimePicker
                value={watch('event_end_date')}
                onChange={(v) => setValue('event_end_date', v, { shouldValidate: true })}
                placeholder="Pick end date & time"
              />
              {errors.event_end_date && (
                <p className="text-xs text-red-500">{errors.event_end_date.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Location & Visibility */}
        <div className="bg-white rounded-xl p-6 border border-border flex flex-col gap-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            Location &amp; Visibility
          </p>
          <Separator />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="location">
                Location <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">📍</span>
                <Input
                  id="location"
                  placeholder="Venue or Online Link"
                  className="pl-8"
                  {...register('location')}
                />
              </div>
              {errors.location && (
                <p className="text-xs text-red-500">{errors.location.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label>Event Type</Label>
              <RadioGroup
                value={watch('event_type')}
                onValueChange={(v) => setValue('event_type', v as 'public' | 'private')}
                className="flex items-center gap-4"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="public" id="public" />
                  <label htmlFor="public" className="text-sm cursor-pointer">Public</label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="private" id="private" />
                  <label htmlFor="private" className="text-sm cursor-pointer">Private</label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="bg-white rounded-xl p-6 border border-border flex flex-col gap-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            Categorization
          </p>
          <Separator />
          <div className="flex flex-col gap-1.5">
            <Label>Tags</Label>
            <TagSelector
              selectedIds={tagIds}
              onChange={(ids) => setValue('tag_ids', ids)}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pb-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="px-8 font-semibold">
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                {mode === 'create' ? 'Creating...' : 'Saving...'}
              </span>
            ) : mode === 'create' ? 'Create Event' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}
