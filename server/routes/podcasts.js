const express = require('express');
const router = express.Router();

// Get all podcasts
router.get('/', (req, res) => {
  res.json({ message: 'Get all podcasts endpoint' });
});

// Get podcast by ID
router.get('/:id', (req, res) => {
  res.json({ message: `Get podcast with ID: ${req.params.id}` });
});

// Create podcast (admin only)
router.post('/', (req, res) => {
  res.json({ message: 'Create new podcast endpoint' });
});

// Update podcast (admin only)
router.put('/:id', (req, res) => {
  res.json({ message: `Update podcast with ID: ${req.params.id}` });
});

// Delete podcast (admin only)
router.delete('/:id', (req, res) => {
  res.json({ message: `Delete podcast with ID: ${req.params.id}` });
});

// Get podcast episodes
router.get('/:id/episodes', (req, res) => {
  res.json({ message: `Get episodes for podcast with ID: ${req.params.id}` });
});

// Get podcast episode by ID
router.get('/:id/episodes/:episodeId', (req, res) => {
  res.json({ message: `Get episode ${req.params.episodeId} for podcast ${req.params.id}` });
});

module.exports = router; 