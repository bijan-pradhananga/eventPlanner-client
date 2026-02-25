import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, BarChart2, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import EventCard from '@/components/shared/EventCard';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchMyEvents, fetchEvents, fetchDashboardStats } from '@/store/eventsSlice';

export default function DashboardPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const { myEvents, events, dashboardStats, isLoading, isStatsLoading } = useAppSelector((s) => s.events);

  useEffect(() => {
    dispatch(fetchMyEvents({ page: 1, limit: 6 }));
    dispatch(fetchEvents({ upcoming: true, page: 1, limit: 3 }));
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  const stats = dashboardStats ? [
    { label: 'Total Events', value: dashboardStats.total_events, icon: CalendarDays, color: 'bg-blue-50 text-primary' },
    { label: 'Upcoming', value: dashboardStats.total_upcoming_events, icon: CalendarDays, color: 'bg-green-50 text-green-600' },
    { label: 'Private Events', value: dashboardStats.total_private_events, icon: BarChart2, color: 'bg-purple-50 text-purple-600' },
    { label: 'Public Events', value: dashboardStats.total_public_events, icon: Users, color: 'bg-orange-50 text-orange-500' },
  ] : [];

  return (
    <div className="flex flex-col gap-6">
      <Greeting user={user} />
      <StatsGrid stats={stats} isLoading={isStatsLoading} />
      <MyRecentEvents
        myEvents={myEvents}
        isLoading={isLoading}
        navigate={navigate}
      />
      <UpcomingEvents events={events} navigate={navigate} />
    </div>
  );
}

function Greeting({ user }: { user: any }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.first_name ?? 'there'} 👋
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Here's what's happening with your events.
        </p>
      </div>
    </div>
  );
}

function StatsGrid({ stats, isLoading }: { stats: any[]; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-5 flex gap-4 border-border items-center">
            <div className="w-10 h-10 rounded-xl bg-gray-200 animate-pulse" />
            <div className="flex flex-col justify-center h-full">
              <div className="w-8 h-6 bg-gray-200 animate-pulse rounded mb-1" />
              <div className="w-16 h-3 bg-gray-200 animate-pulse rounded" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map(({ label, value, icon: Icon, color }) => (
        <Card key={label} className="p-5 flex gap-4 border-border items-center">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex flex-col justify-center h-full">
            <p className="text-2xl font-bold text-gray-900 text-center">{value}</p>
            <p className="text-xs text-muted-foreground text-center">{label}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}

function MyRecentEvents({ myEvents, isLoading, navigate }: { myEvents: any[]; isLoading: boolean; navigate: any }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-gray-900">My Recent Events</h2>
        <button
          onClick={() => navigate('/my-events')}
          className="text-sm text-primary font-medium hover:underline"
        >
          View all
        </button>
      </div>
      {isLoading ? (
        <LoadingSpinner />
      ) : myEvents.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center">
          <p className="text-muted-foreground text-sm mb-3">
            You haven't created any events yet.
          </p>
          <Button size="sm" onClick={() => navigate('/events/create')}>
            Create your first event
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {myEvents.slice(0, 3).map((event) => (
            <EventCard key={event.id} event={event} showActions />
          ))}
        </div>
      )}
    </div>
  );
}

function UpcomingEvents({ events, navigate }: { events: any[]; navigate: any }) {
  if (!events.length) return null;
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-gray-900">Upcoming Events</h2>
        <button
          onClick={() => navigate('/events')}
          className="text-sm text-primary font-medium hover:underline"
        >
          Browse all
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.slice(0, 3).map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
}
