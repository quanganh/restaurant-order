const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000"
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/menu', require('./routes/menu'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/tables', require('./routes/tables'));
app.use('/api/admin', require('./routes/admin'));

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join table room for real-time updates
  socket.on('join-table', (tableNumber) => {
    socket.join(`table-${tableNumber}`);
    console.log(`User joined table ${tableNumber}`);
  });

  // Join admin room
  socket.on('join-admin', () => {
    socket.join('admin');
    console.log('Admin joined');
  });

  // Handle service calls
  socket.on('call-service', (data) => {
    io.to('admin').emit('service-called', {
      tableNumber: data.tableNumber,
      message: data.message,
      timestamp: new Date()
    });
  });

  // Handle order updates
  socket.on('order-update', (data) => {
    io.to(`table-${data.tableNumber}`).emit('order-status-updated', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/restaurant-order')
.then(() => console.log('MongoDB connected'))
.catch(err => console.log('MongoDB connection error:', err));

// Basic health check route
app.get('/', (req, res) => {
  res.json({ message: 'Restaurant Order API is running!' });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Make io accessible to other routes
app.set('io', io);
