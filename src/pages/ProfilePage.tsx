import { useEffect } from 'react';
import { CalendarCheck, Mail, Calendar } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchMyEvents } from '@/store/eventsSlice';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EventCard from '@/components/shared/EventCard';
import { logoutUser } from '@/store/authSlice';
import { LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';

// Profile Page
export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const { myEvents, isLoading } = useAppSelector((s) => s.events);

  useEffect(() => {
    dispatch(fetchMyEvents({ limit: 6 }));
  }, [dispatch]);

  const initials = user
    ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
    : 'U';

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <ProfileHeader user={user} initials={initials} />
      <UserStats myEvents={myEvents} />
      <RecentEvents myEvents={myEvents} isLoading={isLoading} />
    </div>
  );
}



function ProfileHeader({ user, initials }: { user: any; initials: string }) {
  const dispatch = useAppDispatch();
  const handleLogout = async () => {
    await dispatch(logoutUser());
    window.location.href = '/login';
  };
  return (
    <div className="bg-white rounded-xl border border-border p-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-6">
        <Avatar className="w-20 h-20">
          <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {user.first_name} {user.last_name}
            </h1>
            <div className="flex items-center gap-2 text-muted-foreground mt-1">
              <Mail className="w-4 h-4" />
              <span className="text-sm">{user.email}</span>
            </div>
          </div>
          {user.created_at && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">
                Joined {new Date(user.created_at).toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric'
                })}
              </span>
            </div>
          )}
        </div>
        {/* Mobile-only logout button */}
        <Button
          onClick={handleLogout}
          variant="outline"
          className="shrink-0 flex sm:hidden gap-2 mt-4"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}

function UserStats({ myEvents }: { myEvents: any[] }) {
  const totalEvents = myEvents.length;
  const upcomingEvents = myEvents.filter(event => 
    new Date(event.event_date) > new Date()
  ).length;
  const pastEvents = totalEvents - upcomingEvents;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatCard
        icon={CalendarCheck}
        title="Total Events"
        value={totalEvents}
        color="blue"
      />
      <StatCard
        icon={Calendar}
        title="Upcoming Events"
        value={upcomingEvents}
        color="green"
      />
      <StatCard
        icon={Calendar}
        title="Past Events"
        value={pastEvents}
        color="gray"
      />
    </div>
  );
}

function StatCard({ 
  icon: Icon, 
  title, 
  value, 
  color 
}: { 
  icon: any; 
  title: string; 
  value: number; 
  color: 'blue' | 'green' | 'gray';
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    gray: 'bg-gray-50 text-gray-600 border-gray-200'
  };

  return (
    <div className="bg-white rounded-xl border border-border p-6">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-muted-foreground">{title}</p>
        </div>
      </div>
    </div>
  );
}

function RecentEvents({ myEvents, isLoading }: { myEvents: any[]; isLoading: boolean }) {
  return (
    <div className="bg-white rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Recent Events</h2>
        <Link to="/my-events">
          View All Events
        </Link>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner />
        </div>
      ) : myEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {myEvents.slice(0, 6).map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <CalendarCheck className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No events created yet</p>
          <Button className="mt-4">
            Create Your First Event
          </Button>
        </div>
      )}
    </div>
  );
}