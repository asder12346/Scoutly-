import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface ProfileFormProps {
  session: Session;
}

export default function ProfileForm({ session }: ProfileFormProps) {
  const navigate = useNavigate();
  const [isUpdating, setIsUpdating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    full_name: '',
    date_of_birth: '',
    nationality: '',
    position: '',
    secondary_position: '',
    preferred_foot: '',
    height_cm: '',
    weight_kg: '',
    current_club: '',
    bio: '',
    highlight_video_url: '',
    goals: 0,
    assists: 0,
    matches_played: 0,
    clean_sheets: 0,
    avatar_url: ''
  });
  
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function checkProfile() {
      try {
        const response = await fetch('/api/players/me', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setFormData({
            full_name: data.full_name || '',
            date_of_birth: data.date_of_birth || '',
            nationality: data.nationality || '',
            position: data.position || '',
            secondary_position: data.secondary_position || '',
            preferred_foot: data.preferred_foot || '',
            height_cm: data.height_cm || '',
            weight_kg: data.weight_kg || '',
            current_club: data.current_club || '',
            bio: data.bio || '',
            highlight_video_url: data.highlight_video_url || '',
            goals: data.goals || 0,
            assists: data.assists || 0,
            matches_played: data.matches_played || 0,
            clean_sheets: data.clean_sheets || 0,
            avatar_url: data.avatar_url || ''
          });
          setIsUpdating(true);
        }
      } catch (err) {
        // Will just stay in creation mode
      } finally {
        setLoading(false);
      }
    }
    
    checkProfile();
  }, [session]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value ? parseInt(value, 10) : '' }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploadingImage(true);
      setError(null);
      
      if (!e.target.files || e.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${session.user.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      let { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      
      setFormData(prev => ({ ...prev, avatar_url: data.publicUrl }));
    } catch (error: any) {
      setError(error.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const method = isUpdating ? 'PATCH' : 'POST';
      const cleanData = { ...formData };
      
      // Clean up empty numbers so they don't break postgres
      if (!cleanData.height_cm) delete (cleanData as any).height_cm;
      if (!cleanData.weight_kg) delete (cleanData as any).weight_kg;
      if (!cleanData.date_of_birth) delete (cleanData as any).date_of_birth;

      const response = await fetch('/api/players/me', {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(cleanData)
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to save profile');
      }

      navigate('/profile');
    } catch (err: any) {
      setError(err.message);
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-slate-500 font-medium animate-pulse">Loading...</div>;

  const calculateProgress = () => {
    const fieldsToTrack = [
      'full_name', 'position', 'secondary_position', 'nationality',
      'date_of_birth', 'preferred_foot', 'height_cm', 'weight_kg',
      'current_club', 'bio', 'highlight_video_url', 'avatar_url'
    ];
    let filled = 0;
    fieldsToTrack.forEach(field => {
      if (formData[field as keyof typeof formData]) {
        filled++;
      }
    });
    return Math.round((filled / fieldsToTrack.length) * 100);
  };

  const progress = calculateProgress();

  return (
    <div className="bg-white px-5 py-6 shadow-sm border border-slate-100 rounded-[2rem] sm:p-8 mb-8 pb-10">
      <div className="border-b border-slate-100 pb-5 mb-6">
        <h3 className="text-xl font-bold tracking-tight text-slate-900">
          {isUpdating ? 'Edit Profile' : 'Create Profile'}
        </h3>
        <p className="mt-1.5 text-sm text-slate-500 font-medium">
          This information will be displayed on your player card.
        </p>

        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Profile Completeness</span>
            <span className="text-sm font-bold text-[#22C55E]">{progress}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div className="bg-[#22C55E] h-2.5 rounded-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      </div>
      
      <div className="mt-5">
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="mb-5 p-3 bg-red-50/50 text-red-600 border border-red-100 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          <div className="grid grid-cols-6 gap-y-6 gap-x-4">
            <div className="col-span-6 flex flex-col items-center mb-2">
              <div className="w-24 h-24 bg-slate-100 rounded-full mb-3 border-4 border-white shadow-sm flex items-center justify-center text-slate-400 overflow-hidden">
                 {formData.avatar_url ? (
                   <img src={formData.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                 ) : (
                   <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                 )}
              </div>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageUpload} 
                disabled={uploadingImage}
                ref={fileInputRef}
                className="hidden"
              />
              <button 
                type="button" 
                disabled={uploadingImage}
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-bold text-[#22C55E] uppercase tracking-wider bg-green-50 px-3 py-1.5 rounded-full hover:bg-green-100 transition-colors"
               >
                {uploadingImage ? 'Uploading...' : 'Change Photo'}
               </button>
            </div>

            <div className="col-span-6">
              <label className="block text-sm font-bold text-slate-700 ml-1 mb-1.5">Full name *</label>
              <input
                type="text"
                name="full_name"
                required
                value={formData.full_name}
                onChange={handleChange}
                className="appearance-none block w-full px-4 py-3 border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-[#22C55E] focus:border-[#22C55E] sm:text-sm transition-shadow"
              />
            </div>

            <div className="col-span-6 sm:col-span-3">
              <label className="block text-sm font-bold text-slate-700 ml-1 mb-1.5">Position</label>
              <input
                type="text"
                name="position"
                placeholder="e.g. Winger, Striker, CM"
                value={formData.position}
                onChange={handleChange}
                className="appearance-none block w-full px-4 py-3 border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-[#22C55E] focus:border-[#22C55E] sm:text-sm transition-shadow"
              />
            </div>

            <div className="col-span-6 sm:col-span-3">
              <label className="block text-sm font-bold text-slate-700 ml-1 mb-1.5">Secondary Position</label>
              <input
                type="text"
                name="secondary_position"
                value={formData.secondary_position}
                onChange={handleChange}
                className="appearance-none block w-full px-4 py-3 border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-[#22C55E] focus:border-[#22C55E] sm:text-sm transition-shadow"
              />
            </div>

            <div className="col-span-6 sm:col-span-2">
              <label className="block text-sm font-bold text-slate-700 ml-1 mb-1.5">Nationality</label>
              <input
                type="text"
                name="nationality"
                placeholder="e.g. Nigerian"
                value={formData.nationality}
                onChange={handleChange}
                className="appearance-none block w-full px-4 py-3 border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-[#22C55E] focus:border-[#22C55E] sm:text-sm transition-shadow"
              />
            </div>

            <div className="col-span-6 sm:col-span-2">
              <label className="block text-sm font-bold text-slate-700 ml-1 mb-1.5">Date of Birth</label>
              <input
                type="date"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleChange}
                className="appearance-none block w-full px-4 py-3 border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-[#22C55E] focus:border-[#22C55E] sm:text-sm transition-shadow"
              />
            </div>

            <div className="col-span-6 sm:col-span-2">
              <label className="block text-sm font-bold text-slate-700 ml-1 mb-1.5">Preferred Foot</label>
              <select
                name="preferred_foot"
                value={formData.preferred_foot}
                onChange={handleChange}
                className="appearance-none block w-full bg-white px-4 py-3 border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-[#22C55E] focus:border-[#22C55E] sm:text-sm transition-shadow"
              >
                <option value="">Select...</option>
                <option value="Either">Either</option>
                <option value="Left">Left</option>
                <option value="Right">Right</option>
                <option value="Both">Both</option>
              </select>
            </div>

            <div className="col-span-6 sm:col-span-3">
              <label className="block text-sm font-bold text-slate-700 ml-1 mb-1.5">Height (cm)</label>
              <input
                type="number"
                name="height_cm"
                value={formData.height_cm}
                onChange={handleNumberChange}
                className="appearance-none block w-full px-4 py-3 border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-[#22C55E] focus:border-[#22C55E] sm:text-sm transition-shadow"
              />
            </div>

            <div className="col-span-6 sm:col-span-3">
              <label className="block text-sm font-bold text-slate-700 ml-1 mb-1.5">Weight (kg)</label>
              <input
                type="number"
                name="weight_kg"
                value={formData.weight_kg}
                onChange={handleNumberChange}
                className="appearance-none block w-full px-4 py-3 border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-[#22C55E] focus:border-[#22C55E] sm:text-sm transition-shadow"
              />
            </div>

            <div className="col-span-6">
              <label className="block text-sm font-bold text-slate-700 ml-1 mb-1.5">Current Club / Academy</label>
              <input
                type="text"
                name="current_club"
                value={formData.current_club}
                onChange={handleChange}
                className="appearance-none block w-full px-4 py-3 border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-[#22C55E] focus:border-[#22C55E] sm:text-sm transition-shadow"
              />
            </div>

            <div className="col-span-6">
              <label className="block text-sm font-bold text-slate-700 ml-1 mb-1.5">Highlight Video URL</label>
              <input
                type="url"
                name="highlight_video_url"
                placeholder="YouTube or Google Drive link"
                value={formData.highlight_video_url}
                onChange={handleChange}
                className="appearance-none block w-full px-4 py-3 border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-[#22C55E] focus:border-[#22C55E] sm:text-sm transition-shadow"
              />
            </div>

            <div className="col-span-6">
              <label className="block text-sm font-bold text-slate-700 ml-1 mb-1.5">Bio</label>
              <textarea
                name="bio"
                rows={3}
                value={formData.bio}
                onChange={handleChange}
                className="appearance-none block w-full px-4 py-3 border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-[#22C55E] focus:border-[#22C55E] sm:text-sm transition-shadow"
                placeholder="Tell scouts a bit about yourself..."
              />
            </div>

            <div className="col-span-6 border-t border-slate-100 pt-6 mt-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 ml-1">Statistics</h4>
              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 ml-1 mb-1">Matches</label>
                  <input
                    type="number"
                    name="matches_played"
                    value={formData.matches_played}
                    onChange={handleNumberChange}
                    className="appearance-none text-center block w-full px-2 py-3 border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-[#22C55E] focus:border-[#22C55E] sm:text-sm font-bold transition-shadow"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 ml-1 mb-1">Goals</label>
                  <input
                    type="number"
                    name="goals"
                    value={formData.goals}
                    onChange={handleNumberChange}
                    className="appearance-none text-center block w-full px-2 py-3 border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-[#22C55E] focus:border-[#22C55E] sm:text-sm font-bold transition-shadow"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 ml-1 mb-1">Assists</label>
                  <input
                    type="number"
                    name="assists"
                    value={formData.assists}
                    onChange={handleNumberChange}
                    className="appearance-none text-center block w-full px-2 py-3 border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-[#22C55E] focus:border-[#22C55E] sm:text-sm font-bold transition-shadow"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 ml-1 mb-1">Clean</label>
                  <input
                    type="number"
                    name="clean_sheets"
                    value={formData.clean_sheets}
                    onChange={handleNumberChange}
                    className="appearance-none text-center block w-full px-2 py-3 border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-[#22C55E] focus:border-[#22C55E] sm:text-sm font-bold transition-shadow"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            {isUpdating && (
              <button
                type="button"
                onClick={() => navigate('/profile')}
                className="py-3 px-6 border border-slate-200 rounded-xl shadow-sm text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 mr-3 transition-colors"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={saving}
              className="py-3 px-6 flex-1 sm:flex-none border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-[#22C55E] hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#22C55E] disabled:opacity-50 transition-colors"
            >
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
