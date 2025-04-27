const express = require('express');
const router = express.Router();

// Get all playlists
router.get('/', (req, res) => {
  res.json({ message: 'Get all playlists endpoint' });
});

// Get playlist by ID
router.get('/:id', (req, res) => {
  res.json({ message: `Get playlist with ID: ${req.params.id}` });
});

// Create playlist
router.post('/', (req, res) => {
  res.json({ message: 'Create new playlist endpoint' });
});

// Update playlist
router.put('/:id', (req, res) => {
  res.json({ message: `Update playlist with ID: ${req.params.id}` });
});

// Delete playlist
router.delete('/:id', (req, res) => {
  res.json({ message: `Delete playlist with ID: ${req.params.id}` });
});

// Add track to playlist
router.post('/:id/tracks', (req, res) => {
  res.json({ message: `Add track to playlist with ID: ${req.params.id}` });
});

// Remove track from playlist
router.delete('/:id/tracks/:trackId', (req, res) => {
  res.json({ message: `Remove track ${req.params.trackId} from playlist ${req.params.id}` });
});

module.exports = router; 