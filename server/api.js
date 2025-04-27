const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const { testConnection, initDatabase, sequelize } = require('./database');

// Load environment variables
dotenv.config();

// Ensure data directory exists
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const tracksRoutes = require('./routes/tracks');
const playlistsRoutes = require('./routes/playlists');
const artistsRoutes = require('./routes/artists');
const albumsRoutes = require('./routes/albums');
const genresRoutes = require('./routes/genres');
const podcastsRoutes = require('./routes/podcasts');
const uploadRoutes = require('./routes/upload');

// Инициализируем базу данных перед созданием сервера
let isDbInitialized = false;

const initDbFirst = async () => {
  if (!isDbInitialized) {
    // Тестируем подключение
    await testConnection();
    
    // Инициализируем БД
    await initDatabase();
    
    isDbInitialized = true;
    console.log('Database initialized and ready for connections');
  }
};

// Initialize express app
async function createServer() {
  // Инициализируем БД перед тем, как начать обрабатывать запросы
  await initDbFirst();
  
  const app = express();

  // Проверяем режим сохранения сессии
  const isPersistAuth = process.env.PERSIST_AUTH === 'true' || process.env.TOKEN_PERSIST === 'true';
  if (isPersistAuth) {
    console.log('Auth session persistence enabled. Tokens will be preserved across restarts.');
    // Устанавливаем более долгий срок жизни токенов в режиме разработки
    process.env.SESSION_LIFETIME = process.env.SESSION_LIFETIME || '7d';
  }

  // Middleware
  app.use(cors());
  // Configure helmet but allow media playback
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        mediaSrc: ["'self'", "blob:"],
        imgSrc: ["'self'", "data:", "blob:"],
        connectSrc: ["'self'", "blob:", "ws:", "http://localhost:3001", "http://localhost:3002"],
        scriptSrc: ["'self'", "'unsafe-inline'"]
      }
    }
  }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Static files - make these accessible without authentication
  app.use(express.static(path.join(__dirname, '../build')));
  // Make uploads directory public without authentication for media streaming
  app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

  // Authentication middleware
  const authMiddleware = (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'chord_secret_key');
      req.user = decoded;
      console.log('Authentication successful for user:', decoded);
      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
  };

  // Public auth routes (login/register)
  // Use a separate router for public auth routes
  const publicAuthRouter = express.Router();
  publicAuthRouter.post('/login', authRoutes.login);
  publicAuthRouter.post('/register', authRoutes.register);
  app.use('/api/auth', publicAuthRouter);
  
  // Protected auth routes
  app.get('/api/auth/me', authMiddleware, authRoutes.me);
  app.put('/api/auth/profile', authMiddleware, authRoutes.updateProfile);
  app.put('/api/auth/change-password', authMiddleware, authRoutes.changePassword);
  app.delete('/api/auth/delete-account', authMiddleware, authRoutes.deleteAccount);
  
  // Other protected routes
  app.use('/api/users', authMiddleware, userRoutes);

  // --- PUBLIC STREAM ROUTE ---
  // Подключаем только стрим роут без авторизации
  const publicTracksRouter = express.Router();
  publicTracksRouter.get('/:id/stream', require('./routes/tracks').stack.find(r => r.route && r.route.path === '/:id/stream').route.stack[0].handle);
  app.use('/api/tracks', publicTracksRouter);

  // Остальные треки защищены
  app.use('/api/tracks', authMiddleware, tracksRoutes);
  app.use('/api/playlists', authMiddleware, playlistsRoutes);
  app.use('/api/artists', authMiddleware, artistsRoutes);
  app.use('/api/albums', authMiddleware, albumsRoutes);
  app.use('/api/genres', authMiddleware, genresRoutes);
  app.use('/api/podcasts', authMiddleware, podcastsRoutes);
  app.use('/api/upload', authMiddleware, uploadRoutes);

  // Health check
  app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  // Stats endpoint for admin dashboard
  app.get('/api/stats', async (req, res) => {
    try {
      // Get counts from database tables
      const [usersCount] = await sequelize.query('SELECT COUNT(*) as count FROM Users');
      const [tracksCount] = await sequelize.query('SELECT COUNT(*) as count FROM Tracks');
      const [playlistsCount] = await sequelize.query('SELECT COUNT(*) as count FROM Playlists');
      
      res.json({
        users: usersCount[0]?.count || 0,
        tracks: tracksCount[0]?.count || 0,
        playlists: playlistsCount[0]?.count || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      res.status(500).json({ message: 'Failed to fetch database statistics' });
    }
  });

  // Database reset endpoint (admin only)
  app.post('/api/reset-db', authMiddleware, async (req, res) => {
    try {
      // Check if user is admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }

      // Reset database (this is potentially dangerous)
      await sequelize.sync({ force: true });
      
      // Reinitialize with seed data if needed
      await initDatabase();
      
      res.json({ message: 'Database reset successfully' });
    } catch (error) {
      console.error('Error resetting database:', error);
      res.status(500).json({ message: 'Failed to reset database' });
    }
  });

  // Catch-all route for SPA
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../build/index.html'));
  });

  // Error handling middleware
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
  });

  return app;
}

module.exports = createServer; 