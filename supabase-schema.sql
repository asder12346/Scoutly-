-- Supabase Schema for Scoutly

-- Create the players table
CREATE TABLE public.players (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  date_of_birth DATE,
  nationality TEXT,
  position TEXT,
  secondary_position TEXT,
  preferred_foot TEXT CHECK (preferred_foot IN ('Left', 'Right', 'Both')),
  height_cm INTEGER,
  weight_kg INTEGER,
  current_club TEXT,
  bio TEXT,
  highlight_video_url TEXT,
  avatar_url TEXT,
  goals INTEGER DEFAULT 0,
  assists INTEGER DEFAULT 0,
  matches_played INTEGER DEFAULT 0,
  clean_sheets INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;

-- 1. Players can view all profiles
CREATE POLICY "Players can view all profiles" 
ON public.players 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- 2. Players can only INSERT their own profile
CREATE POLICY "Players can insert own profile" 
ON public.players 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- 3. Players can only UPDATE their own profile
CREATE POLICY "Players can update own profile" 
ON public.players 
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Function to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_players_updated_at
BEFORE UPDATE ON public.players
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Set up Storage for avatars
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

CREATE POLICY "Avatar images are publicly accessible."
ON storage.objects FOR SELECT
USING ( bucket_id = 'avatars' );

CREATE POLICY "Anyone can upload an avatar."
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'avatars' AND auth.role() = 'authenticated' );

CREATE POLICY "Anyone can update their own avatar."
ON storage.objects FOR UPDATE
USING ( auth.uid() = owner )
WITH CHECK ( bucket_id = 'avatars' AND auth.role() = 'authenticated' );

CREATE POLICY "Anyone can delete their own avatar."
ON storage.objects FOR DELETE
USING ( auth.uid() = owner AND bucket_id = 'avatars' );
