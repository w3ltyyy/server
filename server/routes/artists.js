const express = require('express');
const router = express.Router();

// Get all artists
router.get('/', (req, res) => {
  res.json({ message: 'Get all artists endpoint' });
});

// Get artist by ID
router.get('/:id', (req, res) => {
  res.json({ message: `Get artist with ID: ${req.params.id}` });
});

// Create artist (admin only)
router.post('/', (req, res) => {
  res.json({ message: 'Create new artist endpoint' });
});

// Update artist (admin only)
router.put('/:id', (req, res) => {
  res.json({ message: `Update artist with ID: ${req.params.id}` });
});

// Delete artist (admin only)
router.delete('/:id', (req, res) => {
  res.json({ message: `Delete artist with ID: ${req.params.id}` });
});

// Get artist's albums
router.get('/:id/albums', (req, res) => {
  res.json({ message: `Get albums for artist with ID: ${req.params.id}` });
});

// Get artist's tracks
router.get('/:id/tracks', (req, res) => {
  res.json({ message: `Get tracks for artist with ID: ${req.params.id}` });
});

module.exports = router; 