import { useEffect, useState } from 'react';
import { CalendarCheck, Mail, Calendar, Shield, CheckCircle, Lock } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchMyEvents } from '@/store/eventsSlice';
import { resendVerificationEmail, enable2FAUser, disable2FAUser } from '@/store/authSlice';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EventCard from '@/components/shared/EventCard';
import { logoutUser } from '@/store/authSlice';
import { LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

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
      <TwoFactorSection />
      <RecentEvents myEvents={myEvents} isLoading={isLoading} />
    </div>
  );
}

function ProfileHeader({ user, initials }: { user: any; initials: string }) {
  const dispatch = useAppDispatch();
  // const { isLoading } = useAppSelector((s) => s.auth);
  const [isResending, setIsResending] = useState(false);
  
  const handleLogout = async () => {
    await dispatch(logoutUser());
    window.location.href = '/login';
  };

  const handleResendVerification = async () => {
    if (isResending) return;
    
    setIsResending(true);
    try {
      await dispatch(resendVerificationEmail()).unwrap();
      toast.success('Verification email sent! Please check your inbox.');
    } catch (error) {
      toast.error('Failed to send verification email. Please try again.');
    } finally {
      setIsResending(false);
    }
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
              {user.email_verified_at ? (
                <div className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-xs font-medium">Verified</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-amber-600">
                  <Shield className="w-4 h-4" />
                  <span className="text-xs font-medium">Unverified</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Email Verification Banner */}
          {!user.email_verified_at && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-amber-800">Email not verified</p>
                  <p className="text-xs text-amber-700 mt-1">
                    Please verify your email to ensure account security and receive important notifications.
                  </p>
                </div>
                <Button
                  onClick={handleResendVerification}
                  disabled={isResending}
                  size="sm"
                  variant="outline"
                  className="shrink-0 text-xs border-amber-300 text-amber-700 hover:bg-amber-100"
                >
                  {isResending ? (
                    <>
                      <LoadingSpinner className="w-3 h-3 mr-1" />
                      Sending...
                    </>
                  ) : (
                    'Resend Email'
                  )}
                </Button>
              </div>
            </div>
          )}

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
  const navigate = useNavigate();
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
          <Button className="mt-4" onClick={() => navigate('/events/create')}>
            Create Your First Event
          </Button>
        </div>
      )}
    </div>
  );
}

function TwoFactorSection() {
  const dispatch = useAppDispatch();
  const { user, isLoading } = useAppSelector((s) => s.auth);
  
  const is2FAEnabled = !!user?.two_factor_enabled;

  const [showDisableDialog, setShowDisableDialog] = useState(false);
  const [disablePassword, setDisablePassword] = useState('');
  const [disableError, setDisableError] = useState<string | null>(null);

  const handleEnable = async () => {
    try {
      await dispatch(enable2FAUser()).unwrap();
      toast.success('Two-factor authentication enabled.');
    } catch (err: unknown) {
      toast.error((err as string) ?? 'Failed to enable 2FA.');
    }
  };

  const handleDisableConfirm = async () => {
    if (!disablePassword.trim()) {
      setDisableError('Password is required.');
      return;
    }
    setDisableError(null);
    try {
      await dispatch(disable2FAUser({ password: disablePassword })).unwrap();
      toast.success('Two-factor authentication disabled.');
      setShowDisableDialog(false);
      setDisablePassword('');
    } catch (err: unknown) {
      const msg = err as string;
      if (msg?.toLowerCase().includes('password')) {
        setDisableError('Incorrect password. Please try again.');
      } else {
        setDisableError(msg ?? 'Failed to disable 2FA.');
      }
    }
  };

  return (
    <div className="bg-white rounded-xl border border-border p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
          <Lock className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Two-Factor Authentication</h2>
          <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-lg border border-border p-4">
        <div className="flex items-center gap-3">
          {is2FAEnabled ? (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm font-medium">2FA is enabled</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Shield className="w-5 h-5" />
              <span className="text-sm font-medium">2FA is disabled</span>
            </div>
          )}
        </div>

        {is2FAEnabled ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => { setShowDisableDialog(true); setDisableError(null); setDisablePassword(''); }}
            className="text-red-600 border-red-300 hover:bg-red-50"
          >
            Disable 2FA
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={handleEnable}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2"><LoadingSpinner className="w-3 h-3" /> Enabling...</span>
            ) : 'Enable 2FA'}
          </Button>
        )}
      </div>

      {is2FAEnabled && (
        <p className="text-xs text-muted-foreground mt-3">
          A 6-digit code will be sent to your email each time you log in.
        </p>
      )}

      {/* Disable 2FA Dialog */}
      <Dialog open={showDisableDialog} onOpenChange={setShowDisableDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Disable Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Enter your current password to confirm disabling 2FA.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 py-2">
            <Label htmlFor="disable-2fa-password">Current Password</Label>
            <Input
              id="disable-2fa-password"
              type="password"
              placeholder="••••••••"
              value={disablePassword}
              onChange={(e) => { setDisablePassword(e.target.value); setDisableError(null); }}
              onKeyDown={(e) => { if (e.key === 'Enter') handleDisableConfirm(); }}
            />
            {disableError && (
              <p className="text-sm text-red-500">{disableError}</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDisableDialog(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={handleDisableConfirm}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2"><LoadingSpinner className="w-3 h-3" /> Disabling...</span>
              ) : 'Disable 2FA'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}