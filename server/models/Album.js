const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');

const Album = sequelize.define('Album', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  cover_image: {
    type: DataTypes.STRING,
    allowNull: true
  },
  release_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  genre: {
    type: DataTypes.STRING,
    allowNull: true
  }
});

module.exports = Album; 