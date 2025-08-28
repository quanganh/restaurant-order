const express = require('express');
const Table = require('../models/Table');
const QRCode = require('qrcode');
const { auth, managerOrAdmin } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/tables/:tableNumber
// @desc    Get table info for customer
// @access  Public
router.get('/:tableNumber', async (req, res) => {
  try {
    const table = await Table.findOne({ number: req.params.tableNumber })
      .populate({
        path: 'currentOrder',
        populate: {
          path: 'items.menuItem'
        }
      });

    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }

    res.json({
      number: table.number,
      capacity: table.capacity,
      status: table.status,
      currentOrder: table.currentOrder
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/tables
// @desc    Get all tables (admin)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const tables = await Table.find()
      .populate('currentOrder')
      .sort({ number: 1 });

    res.json(tables);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/tables
// @desc    Create new table
// @access  Private (Admin/Manager)
router.post('/', auth, managerOrAdmin, async (req, res) => {
  try {
    const { number, capacity, location } = req.body;

    // Check if table number already exists
    const existingTable = await Table.findOne({ number });
    if (existingTable) {
      return res.status(400).json({ message: 'Table number already exists' });
    }

    const table = new Table({
      number,
      capacity,
      location,
      qrCode: `${process.env.CLIENT_URL || 'http://localhost:3000'}/table/${number}`
    });

    await table.save();
    res.status(201).json(table);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/tables/:id
// @desc    Update table
// @access  Private (Admin/Manager)
router.put('/:id', auth, managerOrAdmin, async (req, res) => {
  try {
    const table = await Table.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }

    res.json(table);
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Table not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   DELETE /api/tables/:id
// @desc    Delete table
// @access  Private (Admin/Manager)
router.delete('/:id', auth, managerOrAdmin, async (req, res) => {
  try {
    const table = await Table.findByIdAndDelete(req.params.id);

    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }

    res.json({ message: 'Table removed' });
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Table not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   GET /api/tables/:tableNumber/qr
// @desc    Generate QR code for table
// @access  Private (Admin/Manager)
router.get('/:tableNumber/qr', auth, managerOrAdmin, async (req, res) => {
  try {
    const table = await Table.findOne({ number: req.params.tableNumber });
    
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }

    const qrCodeDataURL = await QRCode.toDataURL(table.qrCode);
    
    res.json({
      qrCode: qrCodeDataURL,
      url: table.qrCode
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   PATCH /api/tables/:tableNumber/status
// @desc    Update table status
// @access  Private
router.patch('/:tableNumber/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const table = await Table.findOne({ number: req.params.tableNumber });

    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }

    table.status = status;
    if (status === 'available') {
      table.currentOrder = null;
    }

    await table.save();
    res.json(table);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/tables/:tableNumber/service
// @desc    Call service for table
// @access  Public
router.post('/:tableNumber/service', async (req, res) => {
  try {
    const { message } = req.body;
    const table = await Table.findOne({ number: req.params.tableNumber });

    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }

    // Add service call to table
    table.serviceCalls.push({
      message: message || 'Service requested',
      timestamp: new Date()
    });

    await table.save();

    // Emit to admin via socket
    const io = req.app.get('io');
    io.to('admin').emit('service-called', {
      tableNumber: table.number,
      message: message || 'Service requested',
      timestamp: new Date()
    });

    res.json({ message: 'Service call sent successfully' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   PATCH /api/tables/:tableNumber/service/:serviceId/resolve
// @desc    Mark service call as resolved
// @access  Private
router.patch('/:tableNumber/service/:serviceId/resolve', auth, async (req, res) => {
  try {
    const table = await Table.findOne({ number: req.params.tableNumber });

    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }

    const serviceCall = table.serviceCalls.id(req.params.serviceId);
    if (!serviceCall) {
      return res.status(404).json({ message: 'Service call not found' });
    }

    serviceCall.resolved = true;
    await table.save();

    res.json(table);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
