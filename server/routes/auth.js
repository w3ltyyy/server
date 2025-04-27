const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register a new user
const register = async (req, res) => {
  try {
    const { username, email, password, isAdmin, isPremium } = req.body;
    
    console.log('Registration attempt:', { username, email, isAdmin, isPremium });
    
    // Check if email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }
    
    // Create new user
    const newUser = await User.create({
      username,
      email,
      password, // Will be hashed by the beforeCreate hook
      role: isAdmin ? 'admin' : 'user',
      isPremium: isPremium || false,
      last_login: new Date()
    });
    
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET || 'chord_secret_key',
      { expiresIn: '1d' }
    );
    
    console.log('User registered successfully:', newUser.email);
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: newUser.toJSON()
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle validation errors
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: error.errors.map(e => ({ field: e.path, message: e.message }))
      });
    }
    
    res.status(500).json({ message: 'Registration failed: ' + error.message });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;
    
    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Check password
    const isPasswordValid = await user.validPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Update last login
    user.last_login = new Date();
    await user.save();
    
    // Проверяем настройки окружения для сохранения сессии
    const isPersistAuth = process.env.PERSIST_AUTH === 'true';
    
    // Срок действия токена зависит от опции "Запомнить меня" и режима разработки
    let tokenExpiration = rememberMe ? '30d' : '1d';
    
    // Если активирован режим сохранения сессии, устанавливаем длительный срок
    if (isPersistAuth || process.env.TOKEN_PERSIST === 'true') {
      tokenExpiration = process.env.SESSION_LIFETIME || '7d';
      console.log('Using persistent session with expiration:', tokenExpiration);
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'chord_secret_key',
      { expiresIn: tokenExpiration }
    );
    
    console.log(`User logged in successfully: ${user.email}, Remember Me: ${rememberMe ? 'Yes' : 'No'}, Session Persistence: ${isPersistAuth ? 'Yes' : 'No'}`);
    res.json({
      message: 'Login successful',
      token,
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
};

// Get current user
const me = async (req, res) => {
  try {
    console.log('Fetching current user with ID:', req.user.id);
    const user = await User.findByPk(req.user.id);
    
    if (!user) {
      console.error('User not found with ID:', req.user.id);
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log('User found:', user.email);
    res.json({
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(401).json({ message: 'Authentication failed' });
  }
};

// OAuth routes (placeholders - would need proper implementation)
const googleAuth = (req, res) => {
  res.status(501).json({ message: 'Google OAuth not implemented yet' });
};

const appleAuth = (req, res) => {
  res.status(501).json({ message: 'Apple OAuth not implemented yet' });
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update allowed fields
    const { username, bio } = req.body;
    
    if (username) user.username = username;
    if (bio !== undefined) user.bio = bio;
    
    await user.save();
    
    res.json({
      message: 'Profile updated successfully',
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Update profile error:', error);
    
    // Handle validation errors
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: error.errors.map(e => ({ field: e.path, message: e.message }))
      });
    }
    
    res.status(500).json({ message: 'Profile update failed' });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }
    
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Verify current password
    const isPasswordValid = await user.validPassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }
    
    // Update password
    user.password = newPassword; // Will be hashed by beforeUpdate hook
    await user.save();
    
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Password change failed' });
  }
};

// Delete account
const deleteAccount = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Optional: Add additional security check if needed
    // For example, require password confirmation
    
    // Delete user from database
    await user.destroy();
    
    console.log('User account deleted:', req.user.email);
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ message: 'Failed to delete account' });
  }
};

module.exports = {
  register,
  login,
  me,
  googleAuth,
  appleAuth,
  updateProfile,
  changePassword,
  deleteAccount
}; 