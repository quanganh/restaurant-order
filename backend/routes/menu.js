const express = require('express');
const MenuItem = require('../models/MenuItem');
const { auth, managerOrAdmin } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/menu
// @desc    Get all menu items (available only for customers)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    
    let filter = { available: true };
    if (category) {
      filter.category = category;
    }

    const menuItems = await MenuItem.find(filter).sort({ category: 1, name: 1 });
    res.json(menuItems);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/menu/all
// @desc    Get all menu items (including unavailable for admin)
// @access  Private (Admin/Manager)
router.get('/all', auth, managerOrAdmin, async (req, res) => {
  try {
    const { category } = req.query;
    
    let filter = {};
    if (category) {
      filter.category = category;
    }

    const menuItems = await MenuItem.find(filter).sort({ category: 1, name: 1 });
    res.json(menuItems);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/menu/:id
// @desc    Get single menu item
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);
    
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    res.json(menuItem);
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST /api/menu
// @desc    Create menu item
// @access  Private (Admin/Manager)
router.post('/', auth, managerOrAdmin, async (req, res) => {
  try {
    const menuItem = new MenuItem(req.body);
    await menuItem.save();
    
    res.status(201).json(menuItem);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/menu/:id
// @desc    Update menu item
// @access  Private (Admin/Manager)
router.put('/:id', auth, managerOrAdmin, async (req, res) => {
  try {
    const menuItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    res.json(menuItem);
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   DELETE /api/menu/:id
// @desc    Delete menu item
// @access  Private (Admin/Manager)
router.delete('/:id', auth, managerOrAdmin, async (req, res) => {
  try {
    const menuItem = await MenuItem.findByIdAndDelete(req.params.id);

    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    res.json({ message: 'Menu item removed' });
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   PATCH /api/menu/:id/toggle
// @desc    Toggle menu item availability
// @access  Private (Admin/Manager)
router.patch('/:id/toggle', auth, managerOrAdmin, async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);

    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    menuItem.available = !menuItem.available;
    await menuItem.save();

    res.json(menuItem);
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   GET /api/menu/categories/list
// @desc    Get list of categories
// @access  Public
router.get('/categories/list', async (req, res) => {
  try {
    const categories = await MenuItem.distinct('category', { available: true });
    res.json(categories);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
