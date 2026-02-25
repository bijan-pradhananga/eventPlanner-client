import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';

// Layout
import AppLayout from '@/components/layout/AppLayout';

// Auth Pages
import LoginPage from '@/pages/auth/LoginPage';
import SignUpPage from '@/pages/auth/SignUpPage';

// App Pages
import DashboardPage from '@/pages/DashboardPage';
import EventsPage from '@/pages/events/EventsPage';
import EventDetailPage from '@/pages/events/EventDetailPage';
import CreateEventPage from '@/pages/events/CreateEventPage';
import EditEventPage from '@/pages/events/EditEventPage';
import MyEventsPage from '@/pages/events/MyEventsPage';
import ProfilePage from './pages/ProfilePage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />

        {/* Protected App Routes */}
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/create" element={<CreateEventPage />} />
          <Route path="/events/:id" element={<EventDetailPage />} />
          <Route path="/events/:id/edit" element={<EditEventPage />} />
          <Route path="/my-events" element={<MyEventsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<ComingSoon title="Settings" />} />
        </Route>

        {/* Defaults */}
        <Route path="/" element={<Navigate to="/events" replace />} />
        <Route path="*" element={<Navigate to="/events" replace />} />
      </Routes>
      <Toaster position="top-right" />
    </BrowserRouter>
  );
}

function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-center h-64 flex-col gap-3">
      <p className="text-2xl font-bold text-gray-300">{title}</p>
      <p className="text-muted-foreground text-sm">Coming soon</p>
    </div>
  );
}

export default App;
