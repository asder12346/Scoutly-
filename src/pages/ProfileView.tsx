// src/pages/ProfileView.tsx
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Session } from '@supabase/supabase-js';
import { Edit2, ExternalLink, User } from 'lucide-react';

interface ProfileViewProps {
  session: Session;
}

export default function ProfileView({ session }: ProfileViewProps) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await fetch('/api/players/me', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        });
        
        if (response.status === 404) {
          // If no profile, redirect to create
          navigate('/profile/edit');
          return;
        }
        
        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }
        
        const data = await response.json();
        setProfile(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchProfile();
  }, [session, navigate]);

  if (loading) return <div className="text-center py-20 text-slate-500 font-medium animate-pulse">Loading profile...</div>;
  if (error) return <div className="text-red-500 py-10 bg-red-50 rounded-xl border border-red-100 p-4 text-center">{error}</div>;
  if (!profile) return null;

  return (
    <div className="space-y-6 pb-12">
      <div className="text-center pt-2">
        <div className="w-24 h-24 bg-slate-200 rounded-full mx-auto mb-4 border-4 border-white shadow-sm flex items-center justify-center text-slate-400">
          <User className="w-10 h-10" />
        </div>
        <h3 className="font-bold text-2xl text-slate-900">{profile.full_name}</h3>
        <p className="text-slate-500 text-sm mt-1 font-medium">
          {profile.position}{profile.secondary_position ? ` / ${profile.secondary_position}` : ''}{profile.current_club && ` • ${profile.current_club}`}
        </p>
      </div>

      {(profile.goals > 0 || profile.assists > 0 || profile.matches_played > 0 || profile.clean_sheets > 0) && (
        <div className="grid grid-cols-4 gap-2.5">
          <div className="bg-white p-3.5 rounded-2xl shadow-sm border border-slate-100 text-center flex flex-col justify-center">
             <p className="text-xl font-bold text-slate-900 leading-tight">{profile.matches_played}</p>
             <p className="text-[10px] uppercase text-slate-400 font-bold tracking-wider mt-0.5">Apps</p>
          </div>
          <div className="bg-white p-3.5 rounded-2xl shadow-sm border border-slate-100 text-center flex flex-col justify-center">
             <p className="text-xl font-bold text-slate-900 leading-tight">{profile.goals}</p>
             <p className="text-[10px] uppercase text-slate-400 font-bold tracking-wider mt-0.5">Goals</p>
          </div>
          <div className="bg-white p-3.5 rounded-2xl shadow-sm border border-slate-100 text-center flex flex-col justify-center">
             <p className="text-xl font-bold text-slate-900 leading-tight">{profile.assists}</p>
             <p className="text-[10px] uppercase text-slate-400 font-bold tracking-wider mt-0.5">Assists</p>
          </div>
          <div className="bg-white p-3.5 rounded-2xl shadow-sm border border-slate-100 text-center flex flex-col justify-center">
             <p className="text-xl font-bold text-slate-900 leading-tight">{profile.clean_sheets}</p>
             <p className="text-[10px] uppercase text-slate-400 font-bold tracking-wider mt-0.5">Clean</p>
          </div>
        </div>
      )}

      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-3.5">
        <div className="flex justify-between text-sm items-center">
          <span className="text-slate-400 font-medium">Height</span>
          <span className="font-bold text-slate-900">{profile.height_cm ? `${profile.height_cm} cm` : '-'}</span>
        </div>
        <div className="flex justify-between text-sm items-center">
          <span className="text-slate-400 font-medium">Weight</span>
          <span className="font-bold text-slate-900">{profile.weight_kg ? `${profile.weight_kg} kg` : '-'}</span>
        </div>
        <div className="flex justify-between text-sm items-center">
          <span className="text-slate-400 font-medium">Preferred Foot</span>
          <span className="font-bold text-slate-900">{profile.preferred_foot || '-'}</span>
        </div>
        <div className="flex justify-between text-sm items-center">
          <span className="text-slate-400 font-medium">Nationality</span>
          <span className="font-bold text-slate-900">{profile.nationality || '-'}</span>
        </div>
        <div className="flex justify-between text-sm items-center">
          <span className="text-slate-400 font-medium">Date of Birth</span>
          <span className="font-bold text-slate-900">{profile.date_of_birth || '-'}</span>
        </div>
      </div>

      {profile.bio && (
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Biography</p>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
            <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{profile.bio}</p>
          </div>
        </div>
      )}

      {profile.highlight_video_url && (
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Highlight Reel</p>
          <a
            href={profile.highlight_video_url}
            target="_blank"
            rel="noopener noreferrer"
            className="block aspect-video bg-slate-200 rounded-2xl relative overflow-hidden group border border-slate-100 shadow-sm"
          >
            <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-slate-900/20 transition-colors flex items-center justify-center">
              <div className="w-14 h-14 bg-white/95 rounded-full flex items-center justify-center pl-1 shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#22C55E"><path d="M8 5v14l11-7z"/></svg>
              </div>
            </div>
          </a>
        </div>
      )}
    </div>
  );
}
