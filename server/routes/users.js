const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticateJWT, isAdmin } = require('../middleware/auth');

// Get all users (admin only)
router.get('/', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] }
    });
    
    res.json({ 
      users, 
      message: 'Users retrieved successfully' 
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Failed to retrieve users' });
  }
});

// Get user by ID
router.get('/:id', authenticateJWT, async (req, res) => {
  try {
    // Users can only access their own data, admins can access any
    if (!req.user.isAdmin && req.user.id !== parseInt(req.params.id)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ user });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Failed to retrieve user data' });
  }
});

// Update user
router.put('/:id', authenticateJWT, async (req, res) => {
  try {
    // Users can only update their own data, admins can update any
    if (!req.user.isAdmin && req.user.id !== parseInt(req.params.id)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Allow updating only certain fields
    const { username, email, isPremium, isAdmin } = req.body;
    
    // Regular users cannot change isAdmin or isPremium
    if (!req.user.isAdmin) {
      delete req.body.isAdmin;
      delete req.body.isPremium;
    }
    
    // Update user properties
    await user.update({
      ...(username && { username }),
      ...(email && { email }),
      ...(isPremium !== undefined && req.user.isAdmin && { isPremium }),
      ...(isAdmin !== undefined && req.user.isAdmin && { isAdmin })
    });
    
    // Return the updated user without password
    const updatedUser = await User.findByPk(user.id, {
      attributes: { exclude: ['password'] }
    });
    
    res.json({ 
      user: updatedUser, 
      message: 'User updated successfully' 
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Failed to update user data' });
  }
});

// Delete user
router.delete('/:id', authenticateJWT, async (req, res) => {
  try {
    // Users can only delete their own account, admins can delete any
    if (!req.user.isAdmin && req.user.id !== parseInt(req.params.id)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    await user.destroy();
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Failed to delete user' });
  }
});

module.exports = router; 