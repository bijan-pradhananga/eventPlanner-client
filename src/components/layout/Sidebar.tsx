import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  User,
  LogOut,
  CalendarCheck,
  MoreVertical,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logoutUser } from '@/store/authSlice';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
  { label: 'Events', icon: CalendarDays, to: '/events' },
  { label: 'My Events', icon: Users, to: '/my-events' },
  { label: 'Profile', icon: User, to: '/profile' },
];

export default function Sidebar() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((s) => s.auth);

  const initials = user
    ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
    : 'U';

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  return (
    <aside className="fixed top-0 left-0 flex flex-col w-56 h-screen overflow-hidden bg-white border-r border-border z-40">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
          <CalendarCheck className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900 leading-tight">Evently</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
            Pro Edition
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 p-3 flex-1">
        {navItems.map(({ label, icon: Icon, to }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )
            }
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="border-t border-border p-3">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {user ? `${user.first_name} ${user.last_name}` : 'User'}
            </p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1 rounded hover:bg-gray-100 text-muted-foreground">
                <MoreVertical className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="top">
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-red-500 focus:text-red-500 cursor-pointer"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </aside>
  );
}
