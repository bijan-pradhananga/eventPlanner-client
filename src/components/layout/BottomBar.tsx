import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CalendarDays, Users, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
  { label: 'Events', icon: CalendarDays, to: '/events' },
  { label: 'My Events', icon: Users, to: '/my-events' },
  { label: 'Profile', icon: User, to: '/profile' },
];

export default function BottomBar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around bg-white border-t border-border h-16 md:hidden">
      {navItems.map(({ label, icon: Icon, to }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center justify-center flex-1 h-full gap-1 text-xs font-medium transition-colors',
              isActive ? 'text-primary' : 'text-gray-500 hover:text-gray-900'
            )
          }
        >
          {({ isActive }) => (
            <>
              <div
                className={cn(
                  'p-1.5 rounded-lg transition-colors',
                  isActive ? 'bg-primary/10' : ''
                )}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span>{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
