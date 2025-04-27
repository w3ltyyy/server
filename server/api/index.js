const express = require('express');
const cors = require('cors');

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to Svag Music API',
    version: '1.0.0',
    status: 'online' 
  });
});

// Auth routes
app.post('/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  // Mock authentication - replace with actual auth logic
  if (username === 'demo' && password === 'password') {
    res.json({
      user: { id: 1, username: 'demo', displayName: 'Demo User' },
      token: 'mock-jwt-token'
    });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

// Tracks route
app.get('/tracks', (req, res) => {
  // Mock tracks data
  const tracks = [
    { id: 1, title: 'Blinding Lights', artist: 'The Weeknd', duration: '3:20' },
    { id: 2, title: 'Don\'t Start Now', artist: 'Dua Lipa', duration: '3:03' },
    { id: 3, title: 'Watermelon Sugar', artist: 'Harry Styles', duration: '2:54' }
  ];
  
  res.json({ tracks });
});

// Handle all HTTP methods for /api
module.exports = app; 