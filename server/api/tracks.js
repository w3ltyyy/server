const express = require('express');

const app = express();

// Middleware
app.use(express.json());

// Get all tracks
app.get('/', (req, res) => {
  // Mock tracks data - replace with database query in production
  const tracks = [
    { 
      id: 1, 
      title: 'Blinding Lights', 
      artist: 'The Weeknd', 
      album: 'After Hours',
      duration: '3:20',
      coverUrl: 'https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36'
    },
    { 
      id: 2, 
      title: 'Don\'t Start Now', 
      artist: 'Dua Lipa', 
      album: 'Future Nostalgia',
      duration: '3:03',
      coverUrl: 'https://i.scdn.co/image/ab67616d0000b273bd26ede1ae69327010d49946'
    },
    { 
      id: 3, 
      title: 'Watermelon Sugar', 
      artist: 'Harry Styles', 
      album: 'Fine Line',
      duration: '2:54',
      coverUrl: 'https://i.scdn.co/image/ab67616d0000b273e2e352d89826aef6dbd5ff8f'
    }
  ];
  
  res.json({ tracks });
});

// Get track by ID
app.get('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  
  // Mock data - replace with database query
  const tracks = {
    1: { 
      id: 1, 
      title: 'Blinding Lights', 
      artist: 'The Weeknd', 
      album: 'After Hours',
      duration: '3:20',
      coverUrl: 'https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36',
      audioUrl: 'https://example.com/tracks/blinding-lights.mp3'
    },
    2: { 
      id: 2, 
      title: 'Don\'t Start Now', 
      artist: 'Dua Lipa', 
      album: 'Future Nostalgia',
      duration: '3:03',
      coverUrl: 'https://i.scdn.co/image/ab67616d0000b273bd26ede1ae69327010d49946',
      audioUrl: 'https://example.com/tracks/dont-start-now.mp3'
    },
    3: { 
      id: 3, 
      title: 'Watermelon Sugar', 
      artist: 'Harry Styles', 
      album: 'Fine Line',
      duration: '2:54',
      coverUrl: 'https://i.scdn.co/image/ab67616d0000b273e2e352d89826aef6dbd5ff8f',
      audioUrl: 'https://example.com/tracks/watermelon-sugar.mp3'
    }
  };
  
  const track = tracks[id];
  
  if (track) {
    res.json(track);
  } else {
    res.status(404).json({ message: 'Track not found' });
  }
});

module.exports = app; 