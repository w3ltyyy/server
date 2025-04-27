const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Track = require('../models/Track');
const User = require('../models/User');
const Artist = require('../models/Artist');
const Album = require('../models/Album');
const { getAudioDurationInSeconds } = require('get-audio-duration');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create user-specific directory
    const userDir = path.join(uploadsDir, `user-${req.user.id}`);
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }
    cb(null, userDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Accept audio files
  if (file.mimetype.startsWith('audio/')) {
    cb(null, true);
  } else if (file.fieldname === 'cover' && file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only audio files and images are allowed!'), false);
  }
};

// Initialize multer upload
const upload = multer({ 
  storage: storage, 
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB max file size
  }
});

// Upload track endpoint
router.post('/track', upload.fields([
  { name: 'audio', maxCount: 1 },
  { name: 'cover', maxCount: 1 }
]), async (req, res) => {
  try {
    if (!req.files || !req.files.audio) {
      return res.status(400).json({ message: 'Audio file is required' });
    }

    const audioFile = req.files.audio[0];
    const coverFile = req.files.cover ? req.files.cover[0] : null;
    
    // Get audio duration
    const duration = await getAudioDurationInSeconds(audioFile.path);
    
    // Get file paths (relative to server root)
    const filePath = audioFile.path.replace(path.join(__dirname, '../..'), '');
    const coverPath = coverFile ? coverFile.path.replace(path.join(__dirname, '../..'), '') : null;
    
    // Get artist name (for metadata only since we don't have artist column)
    const user = await User.findByPk(req.user.id);
    
    // Process optional IDs properly
    let albumId = null;
    let artistId = null;
    
    // Safely convert albumId to number if provided
    if (req.body.albumId) {
      try {
        albumId = parseInt(req.body.albumId, 10);
        if (isNaN(albumId)) {
          albumId = null;
        } else {
          // Verify album exists
          const album = await Album.findByPk(albumId);
          if (!album) {
            console.log(`Album with ID ${albumId} not found, setting to null`);
            albumId = null;
          }
        }
      } catch (error) {
        console.log('Error processing albumId:', error);
        albumId = null;
      }
    }
    
    // Safely convert artistId to number if provided
    if (req.body.artistId) {
      try {
        artistId = parseInt(req.body.artistId, 10);
        if (isNaN(artistId)) {
          artistId = null;
        } else {
          // Verify artist exists
          const artist = await Artist.findByPk(artistId);
          if (!artist) {
            console.log(`Artist with ID ${artistId} not found, setting to null`);
            artistId = null;
          }
        }
      } catch (error) {
        console.log('Error processing artistId:', error);
        artistId = null;
      }
    }
    
    // Create artist automatically if needed
    if (!artistId && req.body.artist) {
      try {
        // Check if artist already exists by name
        const [artist, created] = await Artist.findOrCreate({
          where: { name: req.body.artist },
          defaults: { 
            name: req.body.artist,
            bio: `Artist page for ${req.body.artist}`
          }
        });
        artistId = artist.id;
        console.log(`${created ? 'Created' : 'Found'} artist with ID ${artistId}`);
      } catch (error) {
        console.error('Error creating/finding artist:', error);
      }
    }
    
    console.log('Creating track with data:', {
      title: req.body.title,
      file_path: filePath,
      duration: Math.round(duration),
      albumId: albumId,
      artistId: artistId
    });
    
    // Create track in database
    const track = await Track.create({
      title: req.body.title || path.basename(audioFile.originalname, path.extname(audioFile.originalname)),
      file_path: filePath,
      cover_image: coverPath,
      genre: req.body.genre || null,
      duration: Math.round(duration),
      is_public: req.body.isPublic !== undefined ? req.body.isPublic : true,
      plays: 0,
      release_date: new Date(),
      UserId: req.user.id,
      AlbumId: albumId,
      ArtistId: artistId
    });

    return res.status(201).json({ 
      message: 'Track uploaded successfully',
      track
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ message: 'Upload failed', error: error.message });
  }
});

// Upload profile picture endpoint
router.post('/profile-picture', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Image file is required' });
    }

    // Update user profile image
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove old profile picture if exists
    if (user.profile_image && fs.existsSync(path.join(__dirname, '../..', user.profile_image))) {
      fs.unlinkSync(path.join(__dirname, '../..', user.profile_image));
    }

    // Update with new image
    user.profile_image = req.file.path.replace(path.join(__dirname, '../..'), '');
    await user.save();

    return res.status(200).json({ 
      message: 'Profile picture updated successfully',
      user 
    });
  } catch (error) {
    console.error('Profile picture upload error:', error);
    return res.status(500).json({ message: 'Upload failed', error: error.message });
  }
});

module.exports = router; 