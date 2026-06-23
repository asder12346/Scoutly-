import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { LogOut, User, Edit2 } from 'lucide-react';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const isEditing = location.pathname.includes('/edit');

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <header className="bg-white border-b border-slate-100 sticky top-0 z-10 w-full sm:static">
        <div className="max-w-md mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="text-lg font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <div className="w-8 h-8 bg-[#22C55E] rounded-lg flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/></svg>
            </div>
            Scoutly
          </Link>
          <div className="flex items-center space-x-5">
            {location.pathname === '/profile' && (
              <Link to="/profile/edit" className="text-sm font-semibold text-[#22C55E] hover:text-green-600 transition-colors">
                Edit
              </Link>
            )}
            <button onClick={handleLogout} className="text-slate-400 hover:text-red-500 transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>
      
      <main className="flex-1 w-full max-w-md mx-auto p-5 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
}
