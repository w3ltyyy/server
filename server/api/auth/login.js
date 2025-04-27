const express = require('express');

const app = express();

// Middleware
app.use(express.json());

// Login endpoint
app.post('/', (req, res) => {
  const { username, password } = req.body;
  
  // Mock authentication - replace with actual auth logic in production
  if (username === 'demo' && password === 'password') {
    res.json({
      user: { 
        id: 1, 
        username: 'demo', 
        displayName: 'Demo User',
        email: 'demo@example.com',
        isPremium: false,
        createdAt: new Date().toISOString()
      },
      token: 'mock-jwt-token',
      expiresIn: '24h'
    });
  } else {
    res.status(401).json({ 
      message: 'Invalid credentials',
      error: 'INVALID_CREDENTIALS'
    });
  }
});

module.exports = app; 