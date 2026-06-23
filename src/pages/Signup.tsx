import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      // Direct user straight to profile generation after signing up
      navigate('/profile/edit');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center font-sans px-4 sm:px-6">
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="w-12 h-12 bg-[#22C55E] rounded-xl flex items-center justify-center mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/></svg>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Create Account</h1>
          <p className="text-slate-500 mt-2">Sign up to build your player profile</p>
        </div>
        
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-100 rounded-[2rem] sm:px-10">
          <form className="space-y-5" onSubmit={handleSignup}>
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
                minLength={6}
                className="appearance-none block w-full px-4 py-3 border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-[#22C55E] focus:border-[#22C55E] sm:text-sm transition-shadow"
                placeholder="6+ characters"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-[#22C55E] hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#22C55E] disabled:opacity-50 transition-colors"
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </div>
          </form>
          
          <div className="mt-8 text-center text-sm">
            <span className="text-slate-500">Already have an account? </span>
            <Link to="/login" className="font-bold text-[#22C55E] hover:text-green-600 transition-colors">
              Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
