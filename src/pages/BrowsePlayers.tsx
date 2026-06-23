import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Session } from '@supabase/supabase-js';
import { Search, User } from 'lucide-react';

interface BrowsePlayersProps {
  session: Session;
}

export default function BrowsePlayers({ session }: BrowsePlayersProps) {
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchPlayers = async (query = '') => {
    try {
      setLoading(true);
      const url = query ? `/api/players?search=${encodeURIComponent(query)}` : '/api/players';
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch players');
      }
      
      const data = await response.json();
      setPlayers(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayers();
  }, [session]);

  const handleSearchData = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPlayers(searchQuery);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="text-center pt-2 mb-4">
        <h2 className="font-extrabold text-2xl text-slate-900 tracking-tight">Players</h2>
        <p className="text-slate-500 text-sm mt-1">Discover talent</p>
      </div>

      <form onSubmit={handleSearchData} className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="appearance-none block w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-[#22C55E] focus:border-[#22C55E] sm:text-sm font-medium transition-shadow"
          placeholder="Search position, club, or name..."
        />
        <button type="submit" className="hidden">Search</button>
      </form>

      {error && <div className="text-red-500 py-10 bg-red-50 rounded-xl border border-red-100 p-4 text-center">{error}</div>}

      <div className="space-y-4 pt-2">
        {loading ? (
          <div className="text-center py-10 text-slate-500 font-medium animate-pulse">Loading players...</div>
        ) : players.length === 0 ? (
          <div className="text-center py-10 text-slate-500 font-medium bg-white rounded-2xl border border-slate-100 shadow-sm">No players found.</div>
        ) : (
          players.map((player) => (
            <Link key={player.id} to={`/profile/${player.id}`} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4 hover:border-slate-300 transition-colors cursor-pointer group">
              <div className="w-14 h-14 bg-slate-200 rounded-full flex-shrink-0 border-2 border-white shadow-sm flex items-center justify-center text-slate-400 overflow-hidden">
                {player.avatar_url ? (
                  <img src={player.avatar_url} alt={player.full_name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-6 h-6" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-bold text-slate-900 group-hover:text-[#22C55E] transition-colors truncate tracking-tight">{player.full_name}</p>
                <div className="flex items-center text-xs text-slate-500 mt-0.5 space-x-1 font-medium">
                  <span className="truncate">{player.position || 'Unknown Pos'}</span>
                  {player.current_club && (
                    <>
                      <span>•</span>
                      <span className="truncate text-slate-700 font-bold">{player.current_club}</span>
                    </>
                  )}
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
