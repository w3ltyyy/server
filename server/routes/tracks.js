const express = require('express');
const router = express.Router();
const Track = require('../models/Track');
const Artist = require('../models/Artist');
const Album = require('../models/Album');
const { Op } = require('sequelize');
const path = require('path');
const fs = require('fs');

// Get all tracks (with filters)
router.get('/', async (req, res) => {
  try {
    const { genre, query, limit = 20, offset = 0 } = req.query;
    
    const whereClause = { is_public: true };
    
    // Add genre filter if provided
    if (genre) {
      whereClause.genre = { [Op.like]: `%${genre}%` };
    }
    
    // Add search query filter if provided (search in title, genre)
    if (query) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${query}%` } },
        { genre: { [Op.like]: `%${query}%` } }
      ];
    }
    
    // Find tracks with includes for related models
    const tracks = await Track.findAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      include: [
        { 
          model: Artist,
          attributes: ['id', 'name', 'profile_image']
        },
        {
          model: Album,
          attributes: ['id', 'title', 'cover_image']
        }
      ]
    });
    
    // Transform tracks to include full URLs for audio and image files
    const tracksWithUrls = tracks.map(track => {
      const trackData = track.toJSON();
      
      // Add streaming URL with absolute path including host/port
      trackData.url = `http://localhost:3002/api/tracks/${track.id}/stream`;
      
      // Add cover image URL (prioritize track cover, fallback to album cover)
      trackData.coverUrl = track.cover_image 
        ? `http://localhost:3002${track.cover_image}` 
        : (trackData.Album && trackData.Album.cover_image 
            ? `http://localhost:3002${trackData.Album.cover_image}` 
            : null);
      
      // Format artist data if available
      if (trackData.Artist) {
        trackData.artistName = trackData.Artist.name;
        trackData.artistImage = trackData.Artist.profile_image;
      }
      
      return trackData;
    });
    
    res.json({ 
      tracks: tracksWithUrls,
      total: tracks.length,
      query: query || null,
      genre: genre || null
    });
  } catch (error) {
    console.error('Error fetching tracks:', error);
    res.status(500).json({ message: 'Failed to fetch tracks' });
  }
});

// Get user's uploaded tracks
router.get('/my-tracks', async (req, res) => {
  try {
    const tracks = await Track.findAll({
      where: { UserId: req.user.id },
      order: [['createdAt', 'DESC']],
      include: [
        { 
          model: Artist,
          attributes: ['id', 'name', 'profile_image']
        },
        {
          model: Album,
          attributes: ['id', 'title', 'cover_image']
        }
      ]
    });
    
    // Transform tracks to include full URLs for audio and image files
    const tracksWithUrls = tracks.map(track => {
      const trackData = track.toJSON();
      
      // Add streaming URL with absolute path
      trackData.url = `http://localhost:3002/api/tracks/${track.id}/stream`;
      
      // Add cover image URL (prioritize track cover, fallback to album cover)
      trackData.coverUrl = track.cover_image 
        ? `http://localhost:3002${track.cover_image}` 
        : (trackData.Album && trackData.Album.cover_image 
            ? `http://localhost:3002${trackData.Album.cover_image}` 
            : null);
      
      // Format artist data if available
      if (trackData.Artist) {
        trackData.artistName = trackData.Artist.name;
        trackData.artistImage = trackData.Artist.profile_image;
      }
      
      return trackData;
    });
    
    res.json({ tracks: tracksWithUrls });
  } catch (error) {
    console.error('Error fetching user tracks:', error);
    res.status(500).json({ message: 'Failed to fetch your tracks' });
  }
});

// Stream track audio file
router.get('/:id/stream', async (req, res) => {
  try {
    const track = await Track.findByPk(req.params.id);
    
    if (!track) {
      return res.status(404).json({ message: 'Track not found' });
    }
    
    // Для публичных треков не требуем авторизации
    if (!track.is_public) {
      // Приватные треки требуют авторизации
      if (!req.user || track.UserId !== req.user.id) {
        return res.status(403).json({ message: 'You do not have permission to access this track' });
      }
    }
    
    // Get the file path
    const filePath = path.join(__dirname, '../../', track.file_path);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Audio file not found' });
    }
    
    // Get file stats (for content-length, etc.)
    const stat = fs.statSync(filePath);
    
    // Handle range request (for seeking in audio)
    const range = req.headers.range;
    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
      const chunksize = (end - start) + 1;
      
      console.log(`Serving range ${start}-${end}/${stat.size} for track ${track.id}`);
      
      // Create read stream for this range
      const file = fs.createReadStream(filePath, { start, end });
      
      // Set appropriate headers
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${stat.size}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'audio/mpeg', // Adjust based on actual file type
      });
      
      // Pipe the audio file to response
      file.pipe(res);
    } else {
      // No range requested, serve the whole file
      console.log(`Serving full file for track ${track.id}, size: ${stat.size}`);
      
      // Set appropriate headers
      res.writeHead(200, {
        'Content-Length': stat.size,
        'Content-Type': 'audio/mpeg', // Adjust based on actual file type
        'Accept-Ranges': 'bytes',
      });
      
      // Pipe the audio file to response
      fs.createReadStream(filePath).pipe(res);
    }
    
    // Increment play count asynchronously (don't await to avoid delaying response)
    track.plays += 1;
    track.save().catch(err => console.error('Error incrementing play count:', err));
    
  } catch (error) {
    console.error('Error streaming track:', error);
    res.status(500).json({ message: 'Failed to stream track' });
  }
});

// Get a specific track
router.get('/:id', async (req, res) => {
  try {
    const track = await Track.findByPk(req.params.id, {
      include: [
        { 
          model: Artist,
          attributes: ['id', 'name', 'profile_image'] 
        },
        { 
          model: Album,
          attributes: ['id', 'title', 'cover_image'] 
        }
      ]
    });
    
    if (!track) {
      return res.status(404).json({ message: 'Track not found' });
    }
    
    // Check if user has access to this track
    if (!track.is_public && track.UserId !== req.user.id) {
      return res.status(403).json({ message: 'You do not have permission to access this track' });
    }
    
    // Add URLs for streaming
    const trackData = track.toJSON();
    
    // Add streaming URL with absolute path
    trackData.url = `http://localhost:3002/api/tracks/${track.id}/stream`;
    
    // Add cover image URL (prioritize track cover, fallback to album cover)
    trackData.coverUrl = track.cover_image 
      ? `http://localhost:3002${track.cover_image}` 
      : (trackData.Album && trackData.Album.cover_image 
          ? `http://localhost:3002${trackData.Album.cover_image}` 
          : null);
    
    // Format artist data if available
    if (trackData.Artist) {
      trackData.artistName = trackData.Artist.name;
      trackData.artistImage = trackData.Artist.profile_image;
    }
    
    res.json({ track: trackData });
  } catch (error) {
    console.error('Error fetching track:', error);
    res.status(500).json({ message: 'Failed to fetch track' });
  }
});

// Update track information
router.put('/:id', async (req, res) => {
  try {
    const track = await Track.findByPk(req.params.id);
    
    if (!track) {
      return res.status(404).json({ message: 'Track not found' });
    }
    
    // Check if user owns this track
    if (track.UserId !== req.user.id) {
      return res.status(403).json({ message: 'You do not have permission to modify this track' });
    }
    
    const { title, genre, is_public } = req.body;
    
    if (title) track.title = title;
    if (genre !== undefined) track.genre = genre;
    if (is_public !== undefined) track.is_public = is_public;
    
    await track.save();
    
    res.json({ message: 'Track updated successfully', track });
  } catch (error) {
    console.error('Error updating track:', error);
    res.status(500).json({ message: 'Failed to update track' });
  }
});

// Delete a track
router.delete('/:id', async (req, res) => {
  try {
    const track = await Track.findByPk(req.params.id);
    
    if (!track) {
      return res.status(404).json({ message: 'Track not found' });
    }
    
    // Check if user owns this track
    if (track.UserId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You do not have permission to delete this track' });
    }
    
    await track.destroy();
    
    res.json({ message: 'Track deleted successfully' });
  } catch (error) {
    console.error('Error deleting track:', error);
    res.status(500).json({ message: 'Failed to delete track' });
  }
});

// Increment play count
router.post('/:id/play', async (req, res) => {
  try {
    const track = await Track.findByPk(req.params.id);
    
    if (!track) {
      return res.status(404).json({ message: 'Track not found' });
    }
    
    track.plays += 1;
    await track.save();
    
    res.json({ message: 'Play count updated', plays: track.plays });
  } catch (error) {
    console.error('Error updating play count:', error);
    res.status(500).json({ message: 'Failed to update play count' });
  }
});

module.exports = router; 