const express = require('express');
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const Table = require('../models/Table');
const Admin = require('../models/Admin');
const { auth, adminOnly, managerOrAdmin } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/admin/dashboard
// @desc    Get dashboard statistics
// @access  Private
router.get('/dashboard', auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Today's statistics
    const todayOrders = await Order.find({
      createdAt: { $gte: today, $lt: tomorrow }
    });

    const todayRevenue = todayOrders.reduce((total, order) => {
      return order.status !== 'cancelled' ? total + order.total : total;
    }, 0);

    const activeOrders = await Order.find({
      status: { $in: ['pending', 'confirmed', 'preparing', 'ready'] }
    }).countDocuments();

    const availableTables = await Table.find({ status: 'available' }).countDocuments();
    const occupiedTables = await Table.find({ status: 'occupied' }).countDocuments();
    const totalTables = await Table.countDocuments();

    // Recent orders
    const recentOrders = await Order.find()
      .populate('items.menuItem')
      .sort({ createdAt: -1 })
      .limit(10);

    // Top menu items
    const topMenuItems = await Order.aggregate([
      { $unwind: '$items' },
      { $group: {
        _id: '$items.menuItem',
        totalOrdered: { $sum: '$items.quantity' },
        totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
      }},
      { $sort: { totalOrdered: -1 } },
      { $limit: 5 }
    ]);

    // Populate menu item details
    await MenuItem.populate(topMenuItems, { path: '_id', select: 'name category price' });

    // Pending service calls
    const pendingServiceCalls = await Table.find({
      'serviceCalls.resolved': false
    }).select('number serviceCalls');

    const stats = {
      todayOrders: todayOrders.length,
      todayRevenue,
      activeOrders,
      tableStats: {
        available: availableTables,
        occupied: occupiedTables,
        total: totalTables
      },
      recentOrders,
      topMenuItems,
      pendingServiceCalls
    };

    res.json(stats);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/admin/analytics
// @desc    Get analytics data
// @access  Private (Admin/Manager)
router.get('/analytics', auth, managerOrAdmin, async (req, res) => {
  try {
    const { period = '7d' } = req.query;
    
    let startDate = new Date();
    if (period === '7d') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === '30d') {
      startDate.setDate(startDate.getDate() - 30);
    } else if (period === '90d') {
      startDate.setDate(startDate.getDate() - 90);
    }

    // Revenue over time
    const revenueData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Category performance
    const categoryData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $ne: 'cancelled' }
        }
      },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'menuitems',
          localField: 'items.menuItem',
          foreignField: '_id',
          as: 'menuItemDetails'
        }
      },
      { $unwind: '$menuItemDetails' },
      {
        $group: {
          _id: '$menuItemDetails.category',
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          quantity: { $sum: '$items.quantity' }
        }
      }
    ]);

    // Peak hours
    const peakHours = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: { $hour: '$createdAt' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    res.json({
      revenueData,
      categoryData,
      peakHours
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/admin/staff
// @desc    Get all staff members
// @access  Private (Admin only)
router.get('/staff', auth, adminOnly, async (req, res) => {
  try {
    const staff = await Admin.find().select('-password').sort({ createdAt: -1 });
    res.json(staff);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/admin/staff
// @desc    Create new staff member
// @access  Private (Admin only)
router.post('/staff', auth, adminOnly, async (req, res) => {
  try {
    const { username, password, role, permissions } = req.body;

    // Check if username already exists
    const existingAdmin = await Admin.findOne({ username });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const admin = new Admin({
      username,
      password,
      role,
      permissions
    });

    await admin.save();

    // Return admin without password
    const adminResponse = await Admin.findById(admin._id).select('-password');
    res.status(201).json(adminResponse);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/admin/staff/:id
// @desc    Update staff member
// @access  Private (Admin only)
router.put('/staff/:id', auth, adminOnly, async (req, res) => {
  try {
    const { username, role, permissions, isActive } = req.body;
    
    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    // Update fields
    if (username) admin.username = username;
    if (role) admin.role = role;
    if (permissions) admin.permissions = permissions;
    if (typeof isActive !== 'undefined') admin.isActive = isActive;

    await admin.save();

    // Return updated admin without password
    const updatedAdmin = await Admin.findById(admin._id).select('-password');
    res.json(updatedAdmin);
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Staff member not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   DELETE /api/admin/staff/:id
// @desc    Delete staff member
// @access  Private (Admin only)
router.delete('/staff/:id', auth, adminOnly, async (req, res) => {
  try {
    // Don't allow deleting yourself
    if (req.params.id === req.admin._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    const admin = await Admin.findByIdAndDelete(req.params.id);
    if (!admin) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    res.json({ message: 'Staff member removed' });
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Staff member not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   GET /api/admin/service-calls
// @desc    Get all pending service calls
// @access  Private
router.get('/service-calls', auth, async (req, res) => {
  try {
    const tables = await Table.find({
      'serviceCalls.resolved': false
    }).select('number serviceCalls location');

    const serviceCalls = [];
    tables.forEach(table => {
      table.serviceCalls
        .filter(call => !call.resolved)
        .forEach(call => {
          serviceCalls.push({
            _id: call._id,
            tableNumber: table.number,
            tableLocation: table.location,
            message: call.message,
            timestamp: call.timestamp,
            resolved: call.resolved
          });
        });
    });

    // Sort by timestamp (newest first)
    serviceCalls.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json(serviceCalls);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
