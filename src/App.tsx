import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { Session } from '@supabase/supabase-js';

import Layout from './components/Layout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ProfileView from './pages/ProfileView';
import ProfileForm from './pages/ProfileForm';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!session ? <Login /> : <Navigate to="/" />} />
        <Route path="/signup" element={!session ? <Signup /> : <Navigate to="/" />} />
        
        {/* Protected Routes */}
        <Route element={session ? <Layout /> : <Navigate to="/login" />}>
          <Route path="/" element={<Navigate to="/profile" />} />
          <Route path="/profile" element={<ProfileView session={session!} />} />
          <Route path="/profile/edit" element={<ProfileForm session={session!} />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
