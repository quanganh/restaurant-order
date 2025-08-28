const express = require('express');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/auth/login
// @desc    Login admin
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if admin exists
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if admin is active
    if (!admin.isActive) {
      return res.status(400).json({ message: 'Account is deactivated' });
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    // Create JWT token
    const payload = {
      id: admin._id,
      username: admin.username,
      role: admin.role
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.json({
      success: true,
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        role: admin.role,
        permissions: admin.permissions
      }
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/auth/me
// @desc    Get current admin
// @access  Private
router.get('/me', auth, async (req, res) => {
  res.json({
    id: req.admin._id,
    username: req.admin.username,
    role: req.admin.role,
    permissions: req.admin.permissions
  });
});

// @route   POST /api/auth/setup
// @desc    Initial admin setup (only if no admins exist)
// @access  Public
router.post('/setup', async (req, res) => {
  try {
    // Check if any admin exists
    const adminCount = await Admin.countDocuments();
    if (adminCount > 0) {
      return res.status(400).json({ message: 'Admin already exists' });
    }

    const { username, password } = req.body;

    const admin = new Admin({
      username,
      password,
      role: 'admin',
      permissions: ['manage-menu', 'manage-orders', 'manage-tables', 'view-analytics', 'manage-staff']
    });

    await admin.save();

    res.json({ message: 'Initial admin created successfully' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
