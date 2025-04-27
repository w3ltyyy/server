const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');

const Track = sequelize.define('Track', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  file_path: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  cover_image: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  genre: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  duration: {
    type: DataTypes.INTEGER, // duration in seconds
    allowNull: false,
  },
  is_public: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  plays: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  release_date: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: DataTypes.NOW,
  },
  // Explicitly define foreign keys with correct data types
  UserId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  AlbumId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Albums',
      key: 'id'
    }
  },
  ArtistId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Artists',
      key: 'id'
    }
  }
});

module.exports = Track; 