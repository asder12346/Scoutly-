import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate('/profile');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center font-sans px-4 sm:px-6">
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="w-12 h-12 bg-[#22C55E] rounded-xl flex items-center justify-center mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/></svg>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Welcome Back</h1>
          <p className="text-slate-500 mt-2">Log in to your player profile</p>
        </div>
        
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-100 rounded-[2rem] sm:px-10">
          <form className="space-y-5" onSubmit={handleLogin}>
            {error && (
              <div className="p-3 bg-red-50/50 text-red-600 border border-red-100 rounded-xl text-sm font-medium">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-bold text-slate-700 ml-1 mb-1.5 uppercase tracking-wide text-[10px]">Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none block w-full px-4 py-3 border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-[#22C55E] focus:border-[#22C55E] sm:text-sm transition-shadow"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 ml-1 mb-1.5 uppercase tracking-wide text-[10px]">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none block w-full px-4 py-3 border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-[#22C55E] focus:border-[#22C55E] sm:text-sm transition-shadow"
                placeholder="••••••••"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-[#22C55E] hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#22C55E] disabled:opacity-50 transition-colors"
              >
                {loading ? 'Logging in...' : 'Log In'}
              </button>
            </div>
          </form>
          
          <div className="mt-8 text-center text-sm flex flex-col space-y-3">
            <div>
              <Link to="/forgot-password" className="font-bold text-slate-500 hover:text-slate-900 transition-colors">
                Forgot your password?
              </Link>
            </div>
            <div>
              <span className="text-slate-500">Don't have an account? </span>
              <Link to="/signup" className="font-bold text-[#22C55E] hover:text-green-600 transition-colors">
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
