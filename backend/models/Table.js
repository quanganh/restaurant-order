const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
  number: {
    type: Number,
    required: true,
    unique: true
  },
  qrCode: {
    type: String,
    required: true,
    unique: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  status: {
    type: String,
    enum: ['available', 'occupied', 'reserved', 'cleaning'],
    default: 'available'
  },
  currentOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    default: null
  },
  location: {
    type: String,
    default: ''
  },
  serviceCalls: [{
    message: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    resolved: {
      type: Boolean,
      default: false
    }
  }]
}, {
  timestamps: true
});

// Generate QR code URL before saving
tableSchema.pre('save', function(next) {
  if (!this.qrCode) {
    this.qrCode = `${process.env.CLIENT_URL || 'http://localhost:3000'}/table/${this.number}`;
  }
  next();
});

module.exports = mongoose.model('Table', tableSchema);
