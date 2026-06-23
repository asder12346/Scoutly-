import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Create a Supabase client with the service role key for administrative privileges
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Middleware to verify the user's JWT
const requireAuth = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid authorization header' });
    return;
  }

  const token = authHeader.split(' ')[1];
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      res.status(401).json({ error: 'Invalid or expired token', details: error?.message });
      return;
    }
    
    // Attach user to request
    (req as any).user = user;
    next();
  } catch (err) {
    res.status(500).json({ error: 'Authentication failed' });
    return;
  }
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Wait for auth on player routes
  app.get('/api/players/me', requireAuth, async (req, res) => {
    try {
      const user = (req as any).user;
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      if (error.code === 'PGRST116') {
         // Profile not found
         res.status(404).json({ error: 'Profile not found' });
      } else {
        res.status(500).json({ error: error.message || 'Internal server error' });
      }
    }
  });

  app.post('/api/players/me', requireAuth, async (req, res) => {
    try {
      const user = (req as any).user;
      
      const { 
        full_name, date_of_birth, nationality, position, 
        secondary_position, preferred_foot, height_cm, 
        weight_kg, current_club, bio, highlight_video_url,
        goals, assists, matches_played, clean_sheets
      } = req.body;
      
      if (!full_name) {
        res.status(400).json({ error: 'full_name is required' });
        return;
      }
      
      const playerData = {
        id: user.id, // Must match auth user ID
        full_name, date_of_birth, nationality, position, 
        secondary_position, preferred_foot, height_cm, 
        weight_kg, current_club, bio, highlight_video_url,
        goals: goals || 0,
        assists: assists || 0,
        matches_played: matches_played || 0,
        clean_sheets: clean_sheets || 0
      };

      const { data, error } = await supabase
        .from('players')
        .insert([playerData])
        .select()
        .single();
        
      if (error) throw error;
      res.status(201).json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  });

  app.patch('/api/players/me', requireAuth, async (req, res) => {
    try {
      const user = (req as any).user;
      
      // Whitelist fields
      const updates: any = {};
      const allowedFields = [
        'full_name', 'date_of_birth', 'nationality', 'position', 
        'secondary_position', 'preferred_foot', 'height_cm', 
        'weight_kg', 'current_club', 'bio', 'highlight_video_url',
        'goals', 'assists', 'matches_played', 'clean_sheets'
      ];
      
      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
        }
      }

      if (Object.keys(updates).length === 0) {
        res.status(400).json({ error: 'No valid fields provided for update' });
        return;
      }
      
      const { data, error } = await supabase
        .from('players')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();
        
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
