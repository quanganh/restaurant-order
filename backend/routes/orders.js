const express = require('express');
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const Table = require('../models/Table');
const { auth, managerOrAdmin } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/orders
// @desc    Create new order
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { tableNumber, items, customerNotes } = req.body;

    // Verify table exists
    const table = await Table.findOne({ number: tableNumber });
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }

    // Calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (let item of items) {
      const menuItem = await MenuItem.findById(item.menuItem);
      if (!menuItem || !menuItem.available) {
        return res.status(400).json({ message: `Menu item not available: ${item.menuItem}` });
      }

      const itemTotal = menuItem.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        menuItem: item.menuItem,
        quantity: item.quantity,
        price: menuItem.price,
        specialInstructions: item.specialInstructions || ''
      });
    }

    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax;

    // Calculate estimated ready time
    const avgPrepTime = orderItems.reduce((acc, item) => {
      return acc + (item.preparationTime || 15);
    }, 0) / orderItems.length;
    
    const estimatedReadyTime = new Date();
    estimatedReadyTime.setMinutes(estimatedReadyTime.getMinutes() + avgPrepTime);

    const order = new Order({
      tableNumber,
      items: orderItems,
      subtotal,
      tax,
      total,
      customerNotes,
      estimatedReadyTime
    });

    await order.save();
    
    // Update table status
    table.status = 'occupied';
    table.currentOrder = order._id;
    await table.save();

    // Populate menu items for response
    await order.populate('items.menuItem');

    // Emit to admin via socket
    const io = req.app.get('io');
    io.to('admin').emit('new-order', {
      order,
      message: `New order received from Table ${tableNumber}`
    });

    res.status(201).json(order);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/orders/table/:tableNumber
// @desc    Get orders for specific table
// @access  Public
router.get('/table/:tableNumber', async (req, res) => {
  try {
    const orders = await Order.find({ 
      tableNumber: req.params.tableNumber 
    })
    .populate('items.menuItem')
    .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/orders/:id
// @desc    Get single order
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.menuItem');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   GET /api/orders
// @desc    Get all orders (admin)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { status, date, tableNumber, page = 1, limit = 10 } = req.query;
    
    let filter = {};
    if (status) filter.status = status;
    if (tableNumber) filter.tableNumber = parseInt(tableNumber);
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      filter.createdAt = { $gte: startDate, $lt: endDate };
    }

    const orders = await Order.find(filter)
      .populate('items.menuItem')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(filter);

    res.json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalOrders: total
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   PATCH /api/orders/:id/status
// @desc    Update order status
// @access  Private
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    if (status === 'completed') {
      order.completedAt = new Date();
      
      // Update table status if order is completed
      await Table.findOneAndUpdate(
        { number: order.tableNumber },
        { status: 'available', currentOrder: null }
      );
    }

    await order.save();
    await order.populate('items.menuItem');

    // Emit status update to customer
    const io = req.app.get('io');
    io.to(`table-${order.tableNumber}`).emit('order-status-updated', {
      orderId: order._id,
      status: order.status,
      estimatedReadyTime: order.estimatedReadyTime
    });

    res.json(order);
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   DELETE /api/orders/:id
// @desc    Cancel order
// @access  Private
router.delete('/:id', auth, managerOrAdmin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status === 'preparing' || order.status === 'ready') {
      return res.status(400).json({ message: 'Cannot cancel order that is being prepared' });
    }

    order.status = 'cancelled';
    await order.save();

    // Update table status
    await Table.findOneAndUpdate(
      { number: order.tableNumber },
      { status: 'available', currentOrder: null }
    );

    // Notify customer
    const io = req.app.get('io');
    io.to(`table-${order.tableNumber}`).emit('order-cancelled', {
      orderId: order._id,
      message: 'Your order has been cancelled'
    });

    res.json({ message: 'Order cancelled' });
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router;
