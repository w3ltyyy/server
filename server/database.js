const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');

// Убедимся, что директория data существует
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log('Created data directory:', dataDir);
}

// Проверяем существование файла БД
const dbFile = path.join(dataDir, 'chord.sqlite');
const dbExists = fs.existsSync(dbFile);

// Initialize SQLite database for development
// In production, you'd use a more robust database like PostgreSQL
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbFile,
  logging: false, // Disable SQL logs for cleaner console output
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  define: {
    timestamps: true, // Adds createdAt and updatedAt
    underscored: true, // Use snake_case for column names
  }
});

// Test database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

// Initialize database and create tables
const initDatabase = async () => {
  try {
    // Import models
    const User = require('./models/User');
    const Track = require('./models/Track');
    const Album = require('./models/Album');
    const Playlist = require('./models/Playlist');
    const Artist = require('./models/Artist');
    
    // Define relationships with unique aliases
    // User relationships
    User.hasMany(Playlist, { foreignKey: 'UserId' });
    User.hasMany(Track, { foreignKey: 'UserId' });
    
    // Playlist relationships
    Playlist.belongsTo(User, { foreignKey: 'UserId' });
    Playlist.belongsToMany(Track, { through: 'PlaylistTrack' });
    
    // Track relationships
    Track.belongsTo(Album, { foreignKey: 'AlbumId' });
    Track.belongsTo(Artist, { foreignKey: 'ArtistId' });
    Track.belongsTo(User, { foreignKey: 'UserId' });
    Track.belongsToMany(Playlist, { through: 'PlaylistTrack' });
    
    // Album relationships
    Album.belongsTo(Artist, { foreignKey: 'ArtistId' });
    Album.hasMany(Track, { foreignKey: 'AlbumId' });
    
    // Artist relationships
    Artist.hasMany(Album, { foreignKey: 'ArtistId' });
    Artist.hasMany(Track, { foreignKey: 'ArtistId' });
    
    // Sync all models with database
    // Если база данных не существует, создаем ее с нуля (force: true)
    // Если существует, применяем изменения схемы (alter: true)
    const forceReset = !dbExists;
    
    if (forceReset) {
      // Create tables if DB doesn't exist
    await sequelize.sync({ force: true }); 
      console.log('Database created and models initialized successfully');
    // Создаем тестовые данные
    await createSampleData();
    } else {
      // Apply schema changes if DB exists
      await sequelize.sync({ alter: true });
      console.log('Database schema updated successfully');
    }
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

// Функция для создания тестовых данных
const createSampleData = async () => {
  try {
    const User = require('./models/User');
    
    // Создаем двух тестовых пользователей
    await User.create({
      username: 'demo',
      email: 'demo@example.com',
      password: 'password',
      role: 'user',
      last_login: new Date()
    });
    
    await User.create({
      username: 'admin',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin',
      last_login: new Date()
    });
    
    console.log('Sample users created successfully');
  } catch (error) {
    console.error('Error creating sample data:', error);
  }
};

module.exports = {
  sequelize,
  testConnection,
  initDatabase,
}; 