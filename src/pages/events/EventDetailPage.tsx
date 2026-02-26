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
  Check,
  X,
  HelpCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import TagBadge from '@/components/shared/TagBadge';
import DeleteConfirmDialog from '@/components/shared/DeleteConfirmDialog';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchEventById, deleteEvent, clearSelectedEvent } from '@/store/eventsSlice';
import { fetchUserRSVP, fetchEventRSVPs, upsertRSVP, deleteRSVP } from '@/store/rsvpsSlice';
import type { RSVPStatus } from '@/types';
import { toast } from 'sonner';


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
  const { user, isAuthenticated } = useAppSelector((s) => s.auth);
  const { myEventRSVP, eventRSVPs, eventRSVPSummaries, isLoading: rsvpLoading } = useAppSelector((s) => s.rsvps);

  const eventId = Number(id);

  useEffect(() => {
    if (id) {
      dispatch(fetchEventById(eventId));
      dispatch(fetchEventRSVPs(eventId));
      if (isAuthenticated) {
        dispatch(fetchUserRSVP(eventId));
      }
    }
    return () => {
      dispatch(clearSelectedEvent());
    };
  }, [id, dispatch, eventId, isAuthenticated]);

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
  const userRSVP = myEventRSVP[eventId];
  const rsvpSummary = eventRSVPSummaries[eventId];
  const attendees = eventRSVPs[eventId] || [];

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
          {rsvpSummary && attendees.length > 0 && (
            <RSVPSection summary={rsvpSummary} attendees={attendees} isOwner={isOwner} />
          )}
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

          {!isOwner && !isPast && isAuthenticated && (
            <RSVPActionsCard
              eventId={eventId}
              currentRSVP={userRSVP?.status}
              isLoading={rsvpLoading}
            />
          )}

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

// RSVP Components
function RSVPActionsCard({
  eventId,
  currentRSVP,
  isLoading
}: {
  eventId: number;
  currentRSVP?: RSVPStatus;
  isLoading: boolean;
}) {
  const dispatch = useAppDispatch();
  const isSubmitting = useAppSelector((s) => s.rsvps.isSubmitting);

  const handleRSVP = async (status: RSVPStatus) => {
    const result = await dispatch(upsertRSVP({ eventId, data: { status } }));
    if (upsertRSVP.fulfilled.match(result)) {
      toast.success(`RSVP updated to "${status.toUpperCase()}"`);
    } else {
      toast.error('Failed to update RSVP');
    }
  };

  const handleCancel = async () => {
    const result = await dispatch(deleteRSVP(eventId));
    if (deleteRSVP.fulfilled.match(result)) {
      toast.success('RSVP cancelled');
    } else {
      toast.error('Failed to cancel RSVP');
    }
  };

  if (isLoading) {
    return (
      <Card className="p-5">
        <div className="h-32 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">RSVP to this Event</h3>

      <div className="flex flex-col gap-2">
        <Button
          variant={currentRSVP === 'yes' ? 'default' : 'outline'}
          size="sm"
          className="w-full justify-start gap-2"
          onClick={() => handleRSVP('yes')}
          disabled={isSubmitting}
        >
          <Check className="w-4 h-4" />
          Going
          {currentRSVP === 'yes' && <span className="ml-auto text-xs">✓</span>}
        </Button>

        <Button
          variant={currentRSVP === 'maybe' ? 'default' : 'outline'}
          size="sm"
          className="w-full justify-start gap-2"
          onClick={() => handleRSVP('maybe')}
          disabled={isSubmitting}
        >
          <HelpCircle className="w-4 h-4" />
          Maybe
          {currentRSVP === 'maybe' && <span className="ml-auto text-xs">✓</span>}
        </Button>

        <Button
          variant={currentRSVP === 'no' ? 'default' : 'outline'}
          size="sm"
          className="w-full justify-start gap-2"
          onClick={() => handleRSVP('no')}
          disabled={isSubmitting}
        >
          <X className="w-4 h-4" />
          Can't Go
          {currentRSVP === 'no' && <span className="ml-auto text-xs">✓</span>}
        </Button>
      </div>

      {currentRSVP && (
        <>
          <Separator className="my-3" />
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs text-muted-foreground hover:text-destructive"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel RSVP
          </Button>
        </>
      )}
    </Card>
  );
}

function RSVPSection({
  summary,
  attendees,

}: {
  summary: { yes: number; maybe: number; no: number };
  attendees: any[];
  isOwner: boolean;
}) {
  const [showAllAttendeesModal, setShowAllAttendeesModal] = useState(false);
  const going = attendees.filter((a) => a.status === 'yes');
  const maybe = attendees.filter((a) => a.status === 'maybe');
  const displayAttendees = [...going, ...maybe];
  const totalCount = summary.yes + summary.maybe + summary.no;

  // Function to get initials from name
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  // Function to get random avatar color
  const getAvatarColor = (id: number) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-yellow-500',
      'bg-red-500',
      'bg-gray-500'
    ];
    return colors[id % colors.length];
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'yes': return 'Attending';
      case 'maybe': return 'Interested';
      default: return 'Attending';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'yes': return 'text-green-600';
      case 'maybe': return 'text-yellow-600';
      default: return 'text-green-600';
    }
  };

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Attendees</h2>
          {/* Subtitle */}
          <p className="text-sm text-muted-foreground">
            {totalCount} people have RSVP'd
          </p>
        </div>

        {displayAttendees.length > 4 && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-blue-600 hover:text-blue-700 rounded-sm h-auto font-medium"
            onClick={() => setShowAllAttendeesModal(true)}
          >
            View All
          </Button>
        )}
      </div>



      {/* Attendees Grid */}
      {displayAttendees.length > 0 ? (
        <div className="flex gap-4 overflow-x-auto pb-2">
          {displayAttendees.slice(0, 4).map((rsvp) => (
            <div key={rsvp.id} className="flex flex-col items-center min-w-20">
              {/* Avatar */}
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-medium text-sm mb-2 ${getAvatarColor(rsvp.id)}`}>
                {rsvp.user
                  ? getInitials(rsvp.user.first_name, rsvp.user.last_name)
                  : '?'
                }
              </div>

              {/* Name */}
              <p className="text-xs font-medium text-gray-900 text-center leading-tight mb-1">
                {rsvp.user
                  ? `${rsvp.user.first_name} ${rsvp.user.last_name}`.length > 12
                    ? `${rsvp.user.first_name} ${rsvp.user.last_name}`.slice(0, 12) + '...'
                    : `${rsvp.user.first_name} ${rsvp.user.last_name}`
                  : 'Anonymous'
                }
              </p>

              {/* Status */}
              <p className={`text-xs ${getStatusColor(rsvp.status)}`}>
                {getStatusLabel(rsvp.status)}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground text-sm">No RSVPs yet</p>
        </div>
      )}

      {/* All Attendees Modal */}
      <Dialog open={showAllAttendeesModal} onOpenChange={setShowAllAttendeesModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>All Attendees ({displayAttendees.length})</DialogTitle>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              {displayAttendees.map((rsvp) => (
                <div key={rsvp.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                  {/* Avatar */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium text-xs ${getAvatarColor(rsvp.id)}`}>
                    {rsvp.user
                      ? getInitials(rsvp.user.first_name, rsvp.user.last_name)
                      : '?'
                    }
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {rsvp.user
                        ? `${rsvp.user.first_name} ${rsvp.user.last_name}`
                        : 'Anonymous'
                      }
                    </p>
                    <p className={`text-xs ${getStatusColor(rsvp.status)}`}>
                      {getStatusLabel(rsvp.status)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </Card>
  );
}
