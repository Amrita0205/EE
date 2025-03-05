const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: '*', // Allow all origins for simplicity; restrict in production if needed
}));

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL and Key are required in environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function for standardized error responses
const sendError = (res, status, message) => {
  return res.status(status).json({ error: message });
};

// Test endpoint to verify Supabase connection
app.get('/api/test', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('names')
      .select('count', { count: 'exact' })
      .single();

    if (error) throw error;

    res.json({ message: 'Supabase connection successful', count: data.count });
  } catch (err) {
    console.error('Test endpoint error:', err);
    sendError(res, 500, 'Failed to connect to Supabase');
  }
});

// POST endpoint to save a name
app.post('/api/save-name', async (req, res) => {
  const { name } = req.body;

  // Input validation
  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return sendError(res, 400, 'Name must be a string with at least 2 characters');
  }

  try {
    const { error } = await supabase
      .from('names')
      .insert({ name: name.trim(), created_at: new Date().toISOString() });

    if (error) throw error;

    console.log(`Name saved: ${name}`);
    res.status(200).json({ message: 'Name saved successfully!', name: name.trim() });
  } catch (err) {
    console.error('Save name error:', err);
    sendError(res, 500, 'Failed to save name');
  }
});

// GET endpoint to retrieve all names
app.get('/api/get-names', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('names')
      .select('name, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.status(200).json({ names: data });
  } catch (err) {
    console.error('Get names error:', err);
    sendError(res, 500, 'Failed to fetch names');
  }
});

// For local development only (Vercel handles this in production)
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3002;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;