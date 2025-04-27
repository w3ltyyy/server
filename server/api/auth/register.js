const express = require('express');

const app = express();

// Middleware
app.use(express.json());

// Register endpoint
app.post('/', (req, res) => {
  const { username, email, password } = req.body;
  
  // Validate input
  if (!username || !email || !password) {
    return res.status(400).json({ 
      message: 'All fields are required',
      error: 'MISSING_FIELDS'
    });
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ 
      message: 'Invalid email format',
      error: 'INVALID_EMAIL'
    });
  }
  
  // Validate password strength
  if (password.length < 6) {
    return res.status(400).json({ 
      message: 'Password must be at least 6 characters',
      error: 'WEAK_PASSWORD'
    });
  }
  
  // Mock registration - replace with actual database storage in production
  // In production, check if username/email already exists
  
  // Success response
  res.status(201).json({
    user: { 
      id: 2, // would be dynamically assigned in production
      username,
      email,
      displayName: username,
      isPremium: false,
      createdAt: new Date().toISOString()
    },
    token: 'mock-jwt-token',
    expiresIn: '24h'
  });
});

module.exports = app; 