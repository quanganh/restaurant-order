const mongoose = require('mongoose');
const MenuItem = require('../models/MenuItem');
const Table = require('../models/Table');
const Admin = require('../models/Admin');
require('dotenv').config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/restaurant-order');

    console.log('Connected to MongoDB');

    // Clear existing data
    await MenuItem.deleteMany({});
    await Table.deleteMany({});
    await Admin.deleteMany({});

    // Sample menu items
    const menuItems = [
      // Appetizers
      {
        name: 'Spring Rolls',
        description: 'Fresh vegetables wrapped in rice paper, served with peanut sauce',
        price: 8.99,
        category: 'appetizers',
        preparationTime: 10,
        ingredients: ['rice paper', 'lettuce', 'cucumber', 'carrots', 'mint'],
        spicyLevel: 0
      },
      {
        name: 'Chicken Wings',
        description: 'Crispy buffalo wings with celery and ranch dressing',
        price: 12.99,
        category: 'appetizers',
        preparationTime: 15,
        ingredients: ['chicken wings', 'buffalo sauce', 'celery', 'ranch'],
        spicyLevel: 2
      },
      {
        name: 'Mozzarella Sticks',
        description: 'Golden fried mozzarella with marinara sauce',
        price: 9.99,
        category: 'appetizers',
        preparationTime: 12,
        ingredients: ['mozzarella', 'breadcrumbs', 'marinara sauce'],
        spicyLevel: 0
      },

      // Main Courses
      {
        name: 'Grilled Salmon',
        description: 'Atlantic salmon with lemon herb butter, served with vegetables',
        price: 24.99,
        category: 'main-courses',
        preparationTime: 20,
        ingredients: ['salmon', 'lemon', 'herbs', 'mixed vegetables'],
        spicyLevel: 0
      },
      {
        name: 'Beef Steak',
        description: 'Premium ribeye steak cooked to perfection with garlic mashed potatoes',
        price: 28.99,
        category: 'main-courses',
        preparationTime: 25,
        ingredients: ['ribeye steak', 'potatoes', 'garlic', 'butter'],
        spicyLevel: 0
      },
      {
        name: 'Chicken Curry',
        description: 'Aromatic Thai red curry with jasmine rice',
        price: 18.99,
        category: 'main-courses',
        preparationTime: 18,
        ingredients: ['chicken', 'red curry paste', 'coconut milk', 'jasmine rice'],
        spicyLevel: 3
      },
      {
        name: 'Vegetarian Pasta',
        description: 'Fresh pasta with seasonal vegetables in tomato basil sauce',
        price: 16.99,
        category: 'main-courses',
        preparationTime: 15,
        ingredients: ['pasta', 'tomatoes', 'basil', 'seasonal vegetables'],
        spicyLevel: 0
      },

      // Desserts
      {
        name: 'Chocolate Cake',
        description: 'Rich chocolate cake with vanilla ice cream',
        price: 7.99,
        category: 'desserts',
        preparationTime: 5,
        ingredients: ['chocolate cake', 'vanilla ice cream', 'chocolate sauce'],
        spicyLevel: 0
      },
      {
        name: 'Tiramisu',
        description: 'Classic Italian dessert with coffee and mascarpone',
        price: 8.99,
        category: 'desserts',
        preparationTime: 5,
        ingredients: ['ladyfingers', 'espresso', 'mascarpone', 'cocoa'],
        spicyLevel: 0
      },

      // Beverages
      {
        name: 'Fresh Orange Juice',
        description: 'Freshly squeezed orange juice',
        price: 4.99,
        category: 'beverages',
        preparationTime: 3,
        ingredients: ['fresh oranges'],
        spicyLevel: 0
      },
      {
        name: 'Iced Coffee',
        description: 'Cold brew coffee with milk and sugar',
        price: 3.99,
        category: 'beverages',
        preparationTime: 5,
        ingredients: ['coffee beans', 'milk', 'ice'],
        spicyLevel: 0
      },
      {
        name: 'Mango Smoothie',
        description: 'Tropical mango smoothie with yogurt',
        price: 5.99,
        category: 'beverages',
        preparationTime: 5,
        ingredients: ['mango', 'yogurt', 'honey', 'ice'],
        spicyLevel: 0
      },

      // Specials
      {
        name: 'Chef\'s Special Platter',
        description: 'Today\'s special combination of our finest dishes',
        price: 32.99,
        category: 'specials',
        preparationTime: 30,
        ingredients: ['chef selection'],
        spicyLevel: 1
      }
    ];

    const createdMenuItems = await MenuItem.insertMany(menuItems);
    console.log(`Created ${createdMenuItems.length} menu items`);

    // Create tables
    const tables = [];
    for (let i = 1; i <= 20; i++) {
      tables.push({
        number: i,
        capacity: Math.floor(Math.random() * 6) + 2, // 2-8 people
        location: i <= 10 ? 'Main Dining' : 'Terrace',
        qrCode: `${process.env.CLIENT_URL || 'http://localhost:3000'}/table/${i}`
      });
    }

    const createdTables = await Table.insertMany(tables);
    console.log(`Created ${createdTables.length} tables`);

    // Create default admin
    const admin = new Admin({
      username: 'admin',
      password: 'admin123',
      role: 'admin',
      permissions: ['manage-menu', 'manage-orders', 'manage-tables', 'view-analytics', 'manage-staff']
    });

    await admin.save();
    console.log('Created default admin user (username: admin, password: admin123)');

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
