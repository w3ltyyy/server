const express = require('express');
const router = express.Router();

// Get all genres
router.get('/', (req, res) => {
  res.json({ message: 'Get all genres endpoint' });
});

// Get genre by ID
router.get('/:id', (req, res) => {
  res.json({ message: `Get genre with ID: ${req.params.id}` });
});

// Create genre (admin only)
router.post('/', (req, res) => {
  res.json({ message: 'Create new genre endpoint' });
});

// Update genre (admin only)
router.put('/:id', (req, res) => {
  res.json({ message: `Update genre with ID: ${req.params.id}` });
});

// Delete genre (admin only)
router.delete('/:id', (req, res) => {
  res.json({ message: `Delete genre with ID: ${req.params.id}` });
});

// Get tracks by genre
router.get('/:id/tracks', (req, res) => {
  res.json({ message: `Get tracks for genre with ID: ${req.params.id}` });
});

module.exports = router; 