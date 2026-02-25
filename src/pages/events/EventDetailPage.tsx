import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  CalendarDays,
  MapPin,
  Globe,
  Lock,
  Pencil,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import TagBadge from '@/components/shared/TagBadge';
import DeleteConfirmDialog from '@/components/shared/DeleteConfirmDialog';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchEventById, deleteEvent, clearSelectedEvent } from '@/store/eventsSlice';


const fallbackImages = [
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=900&q=80',
  'https://images.unsplash.com/photo-1511578314322-379afb476865?w=900&q=80',
  'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=900&q=80',
];

// Main Page Component
export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { selectedEvent: event, isLoading } = useAppSelector((s) => s.events);
  const { user } = useAppSelector((s) => s.auth);

  useEffect(() => {
    if (id) dispatch(fetchEventById(Number(id)));
    return () => {
      dispatch(clearSelectedEvent());
    };
  }, [id, dispatch]);

  if (isLoading) return <LoadingSpinner />;

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <p className="text-gray-500">Event not found.</p>
        <Button variant="outline" onClick={() => navigate('/events')}>
          Back to Events
        </Button>
      </div>
    );
  }

  const isOwner = user?.id === event.creator_id;
  const isPast = new Date(event.event_date) < new Date();
  const coverImage = event.cover_image ?? fallbackImages[event.id % fallbackImages.length];

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6">
   
      <EventHero
        title={event.title}
        eventDate={new Date(event.event_date)}
        endDate={event.event_end_date ? new Date(event.event_end_date) : null}
        location={event.location}
        eventType={event.event_type}
        coverImage={coverImage}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          <AboutSection description={event.description} />
          <TagsSection tags={event.tags ?? []} />
          {event.creator && <OrganizerCard creator={event.creator} />}
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          <EventStatusPanel
            isPast={isPast}
            eventType={event.event_type}
            startDate={new Date(event.event_date)}
            endDate={event.event_end_date ? new Date(event.event_end_date) : null}
          />

          <LocationCard location={event.location} />

          {isOwner && <OwnerActions eventId={event.id} />}
        </div>
      </div>
    </div>
  );
}

function EventHero({
  title,
  eventDate,
  endDate,
  location,
  eventType,
  coverImage,
}: {
  title: string;
  eventDate: Date;
  endDate?: Date | null;
  location: string;
  eventType: 'public' | 'private';
  coverImage: string;
}) {
  return (
    <div
      className="relative w-full h-64 md:h-80 rounded-2xl overflow-hidden bg-gray-200"
      style={{ backgroundImage: `url(${coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 p-6 text-white">
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge variant="outline" className="border-white/50 text-white text-xs uppercase">
            {eventType === 'public' ? 'Public Event' : 'Private Event'}
          </Badge>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold">{title}</h1>
        <div className="flex flex-wrap gap-4 mt-2 text-sm text-white/80">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="w-4 h-4" />
            {format(eventDate, 'MMMM d, yyyy')} • {format(eventDate, 'h:mm a')}
            {endDate && ` – ${format(endDate, 'h:mm a')}`}
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4" />
            {location}
          </span>
        </div>
      </div>
    </div>
  );
}

function AboutSection({ description }: { description: string }) {
  return (
    <div className="bg-white rounded-xl p-6 border border-border">
      <h2 className="text-base font-semibold text-gray-900 mb-3">About this Event</h2>
      <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
        {description}
      </p>
    </div>
  );
}

function TagsSection({ tags }: { tags: Array<{ id: number; name: string }> }) {
  if (!tags?.length) return null;
  return (
    <div className="bg-white rounded-xl p-6 border border-border">
      <h2 className="text-base font-semibold text-gray-900 mb-3">Tags</h2>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <TagBadge key={tag.id} tag={tag} />
        ))}
      </div>
    </div>
  );
}

function OrganizerCard({ creator }: { creator: { first_name: string; last_name: string } }) {
  return (
    <div className="bg-gray-900 rounded-xl p-5 border border-border">
      <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">Organized By</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <CalendarDays className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">
              {creator.first_name} {creator.last_name}
            </p>
            <p className="text-gray-400 text-xs">Event Organizer</p>
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="text-white border-white/20 bg-white/10 hover:bg-white/20 gap-1.5"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Contact
        </Button>
      </div>
    </div>
  );
}

function EventStatusPanel({
  isPast,
  eventType,
  startDate,
  endDate,
}: {
  isPast: boolean;
  eventType: 'public' | 'private';
  startDate: Date;
  endDate?: Date | null;
}) {
  return (
    <div className="bg-white rounded-xl p-5 border border-border flex flex-col gap-4">
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Status</p>
        <p className={`text-sm font-semibold flex items-center gap-1.5 ${isPast ? 'text-gray-400' : 'text-green-600'}`}>
          <span className={`w-2 h-2 rounded-full ${isPast ? 'bg-gray-400' : 'bg-green-500'}`} />
          {isPast ? 'Event Ended' : 'Registration Open'}
        </p>
      </div>

      <Separator />

      <div className="flex flex-col gap-3 text-sm">
        <div className="flex items-start gap-2">
          {eventType === 'public' ? (
            <Globe className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
          ) : (
            <Lock className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
          )}
          <div>
            <p className="text-xs text-muted-foreground">Visibility</p>
            <p className="font-medium capitalize">{eventType}</p>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <CalendarDays className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground">Start Date</p>
            <p className="font-medium">{format(startDate, 'MMM d, yyyy – h:mm a')}</p>
          </div>
        </div>

        {endDate && (
          <div className="flex items-start gap-2">
            <CalendarDays className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">End Date</p>
              <p className="font-medium">{format(endDate, 'MMM d, yyyy – h:mm a')}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function LocationCard({ location }: { location: string }) {
  return (
    <div className="bg-white rounded-xl p-5 border border-border">
      <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1.5">
        <MapPin className="w-3.5 h-3.5" /> Location
      </p>
      <div className="rounded-lg overflow-hidden w-full h-28 bg-gray-100 mb-3">
        <iframe
          title="map"
          className="w-full h-full border-0"
          src={`https://maps.google.com/maps?q=${encodeURIComponent(location)}&output=embed`}
        />
      </div>
      <p className="text-sm font-medium text-gray-900">{location}</p>
    </div>
  );
}

function OwnerActions({ eventId }: { eventId: number }) {
  const navigate = useNavigate();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const isSubmitting = useAppSelector((s) => s.events.isSubmitting);
  const dispatch = useAppDispatch();

  const handleDelete = async () => {
    const result = await dispatch(deleteEvent(eventId));
    if (deleteEvent.fulfilled.match(result)) {
      navigate('/events');
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl p-4 border border-border flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 gap-1.5"
          onClick={() => navigate(`/events/${eventId}/edit`)}
        >
          <Pencil className="w-3.5 h-3.5" /> Edit
        </Button>
        <Button
          variant="destructive"
          size="sm"
          className="flex-1 gap-1.5"
          onClick={() => setDeleteOpen(true)}
        >
          <Trash2 className="w-3.5 h-3.5" /> Delete
        </Button>
      </div>

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDelete}
        isLoading={isSubmitting}
      />
    </>
  );
}

