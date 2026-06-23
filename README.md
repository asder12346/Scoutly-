# Scoutly - Player MVP

Welcome to the Scoutly player-side MVP! This application allows real basketball/football players to create an account, log in, and establish their profiles. It handles secure data routing and local modifications using modern web tech and Supabase.

## Tech Stack
- Frontend: React (Vite)
- Backend: Express (TypeScript)
- Auth & Database: Supabase

## Setup Instructions

### 1. Supabase Initialization
1. Create a new Supabase project (or use an existing one).
2. Go to the SQL Editor and run the contents of `supabase-schema.sql` to initialize the `players` table, assign User Auth ownership, and establish Row Level Security (RLS) policies.
3. Enable Email/Password authentication in Authentication settings (you can disable email confirmations for testing).

### 2. Environment Variables
You need configuration from Supabase to start the app securely.

Locate your keys in **Project Settings -> API** and add them to AI Studio's secure Environment panel:
- `VITE_SUPABASE_URL`: Your Supabase Project URL
- `VITE_SUPABASE_ANON_KEY`: Your Project Anon/Public Key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Service Role Secret (Required for the Express Backend)

*Note: Never expose the `SUPABASE_SERVICE_ROLE_KEY` to the client side. The application leverages it server-side while routing.*

### 3. Usage
- Go to `/signup` and create a user. The system uses built-in Supabase Auth and redirects you to the profile page.
- Log out, log in, and view your securely scoped user properties!

Enjoy building Scoutly!
