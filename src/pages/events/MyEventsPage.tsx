import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EventCard from '@/components/shared/EventCard';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import PaginationControls from '@/components/shared/PaginationControls';
import DeleteConfirmDialog from '@/components/shared/DeleteConfirmDialog';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchMyEvents, deleteEvent } from '@/store/eventsSlice';

// Main My Events Page
export default function MyEventsPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { myEvents, myEventsPagination, isLoading, isSubmitting } =
    useAppSelector((s) => s.events);

  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    dispatch(
      fetchMyEvents({
        page,
        limit: 10,
        upcoming: tab === 'upcoming' ? true : undefined,
        past: tab === 'past' ? true : undefined,
      })
    );
  }, [dispatch, page, tab]);

  const handleTabChange = (value: string) => {
    setTab(value as 'upcoming' | 'past');
    setPage(1);
  };

  const handleDeleteRequest = (id: number) => {
    setDeleteId(id);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    const result = await dispatch(deleteEvent(deleteId));
    if (deleteEvent.fulfilled.match(result)) {
      setDeleteId(null);
    }
  };

  const handleCreateEvent = () => {
    navigate('/events/create');
  };

  return (
    <div className="flex flex-col gap-5">
      <PageHeader />

      <MyEventsTabs value={tab} onChange={handleTabChange} />

      {isLoading ? (
        <LoadingSpinner />
      ) : myEvents.length === 0 ? (
        <EmptyMyEvents tab={tab} onCreateEvent={handleCreateEvent} />
      ) : (
        <MyEventsGrid events={myEvents} onDelete={handleDeleteRequest} />
      )}

      {!isLoading && myEvents.length > 0 && (
        <PaginationControls
          pagination={myEventsPagination}
          onPageChange={setPage}
        />
      )}

      <DeleteConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        isLoading={isSubmitting}
      />
    </div>
  );
}

// Sub-components
function PageHeader() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Events</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Events you've created and manage.
        </p>
      </div>
      <Button
        onClick={() => navigate('/events/create')}
        className="gap-2 font-semibold"
      >
        <Plus className="w-4 h-4" />
        New Event
      </Button>
    </div>
  );
}

interface MyEventsTabsProps {
  value: 'upcoming' | 'past';
  onChange: (value: string) => void;
}

function MyEventsTabs({ value, onChange }: MyEventsTabsProps) {
  return (
    <Tabs value={value} onValueChange={onChange}>
      <TabsList>
        <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
        <TabsTrigger value="past">Past</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

interface EmptyMyEventsProps {
  tab: 'upcoming' | 'past';
  onCreateEvent: () => void;
}

function EmptyMyEvents({ tab, onCreateEvent }: EmptyMyEventsProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
        <Plus className="w-8 h-8 text-primary" />
      </div>
      <div className="text-center">
        <p className="text-gray-900 font-semibold">No {tab} events</p>
        <p className="text-muted-foreground text-sm mt-1">
          {tab === 'upcoming'
            ? 'Create your first event to get started!'
            : 'Your past events will appear here.'}
        </p>
      </div>
      {tab === 'upcoming' && (
        <Button onClick={onCreateEvent}>Create Event</Button>
      )}
    </div>
  );
}

interface MyEventsGridProps {
  events: any[]; // replace with proper Event type
  onDelete: (id: number) => void;
}

function MyEventsGrid({ events, onDelete }: MyEventsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {events.map((event) => (
        <EventCard
          key={event.id}
          event={event}
          showActions
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

