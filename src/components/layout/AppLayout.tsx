import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import BottomBar from './BottomBar';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchProfile } from '@/store/authSlice';

export default function AppLayout() {
  const { isAuthenticated, user } = useAppSelector((s) => s.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!user) {
      dispatch(fetchProfile());
    }
  }, [isAuthenticated, user, dispatch, navigate]);

  if (!isAuthenticated) return null;

  return (
    <div className="flex min-h-screen bg-[#f1f5f9]">
      <div className="hidden md:flex">
        <Sidebar />
      </div>
      <div className="flex flex-col flex-1 min-w-0 md:ml-56">
        <TopBar />
        <main className="flex-1 overflow-auto p-6 pb-24 md:pb-6">
          <Outlet />
        </main>
      </div>
      <BottomBar />
    </div>
  );
}
