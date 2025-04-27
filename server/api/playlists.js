const express = require('express');

const app = express();

// Middleware
app.use(express.json());

// Get all playlists
app.get('/', (req, res) => {
  // Mock playlists data - replace with database query in production
  const playlists = [
    {
      id: 1,
      name: "Вайб шайбы",
      description: "Так звучит КХЛ",
      coverUrl: "https://avatars.yandex.net/get-music-content/5280749/9fa1275e.p.41218/m1000x1000",
      trackIds: [1, 3, 5]
    },
    {
      id: 2,
      name: "Для вас",
      description: "volhey, 17SEVENTEEN",
      coverUrl: "https://avatars.yandex.net/get-music-content/4467280/9c853977.a.17892474-1/m1000x1000",
      trackIds: [2, 4]
    },
    {
      id: 3,
      name: "Тренды",
      description: "Loqiemean, Гио Пика",
      coverUrl: "https://avatars.yandex.net/get-music-content/4446014/b4c3c98d.a.13390025-1/m1000x1000",
      trackIds: [1, 2]
    }
  ];
  
  res.json({ playlists });
});

// Get playlist by ID
app.get('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  
  // Mock data - replace with database query
  const playlists = {
    1: {
      id: 1,
      name: "Вайб шайбы",
      description: "Так звучит КХЛ",
      coverUrl: "https://avatars.yandex.net/get-music-content/5280749/9fa1275e.p.41218/m1000x1000",
      tracks: [
        { 
          id: 1, 
          title: 'Blinding Lights', 
          artist: 'The Weeknd', 
          duration: '3:20',
          coverUrl: 'https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36'
        },
        { 
          id: 3, 
          title: 'Watermelon Sugar', 
          artist: 'Harry Styles', 
          duration: '2:54',
          coverUrl: 'https://i.scdn.co/image/ab67616d0000b273e2e352d89826aef6dbd5ff8f'
        }
      ]
    },
    2: {
      id: 2,
      name: "Для вас",
      description: "volhey, 17SEVENTEEN",
      coverUrl: "https://avatars.yandex.net/get-music-content/4467280/9c853977.a.17892474-1/m1000x1000",
      tracks: [
        { 
          id: 2, 
          title: 'Don\'t Start Now', 
          artist: 'Dua Lipa', 
          duration: '3:03',
          coverUrl: 'https://i.scdn.co/image/ab67616d0000b273bd26ede1ae69327010d49946'
        }
      ]
    },
    3: {
      id: 3,
      name: "Тренды",
      description: "Loqiemean, Гио Пика",
      coverUrl: "https://avatars.yandex.net/get-music-content/4446014/b4c3c98d.a.13390025-1/m1000x1000",
      tracks: [
        { 
          id: 1, 
          title: 'Blinding Lights', 
          artist: 'The Weeknd', 
          duration: '3:20',
          coverUrl: 'https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36'
        },
        { 
          id: 2, 
          title: 'Don\'t Start Now', 
          artist: 'Dua Lipa', 
          duration: '3:03',
          coverUrl: 'https://i.scdn.co/image/ab67616d0000b273bd26ede1ae69327010d49946'
        }
      ]
    }
  };
  
  const playlist = playlists[id];
  
  if (playlist) {
    res.json(playlist);
  } else {
    res.status(404).json({ message: 'Playlist not found' });
  }
});

module.exports = app; 