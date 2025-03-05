const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware to parse JSON and enable CORS
app.use(express.json());
app.use(cors());

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL and Key are required');
}
const supabase = createClient(supabaseUrl, supabaseKey);

// API endpoint to save the name
app.post('/api/save-name', async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  try {
    const { error } = await supabase
      .from('names') // Your Supabase table
      .insert({ name: name });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.status(200).json({ message: 'Name saved successfully!' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Export the app for Vercel
module.exports = app;