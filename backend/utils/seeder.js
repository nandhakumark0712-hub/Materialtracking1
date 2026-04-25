const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

const users = [
  {
    name: 'Main Admin',
    email: 'admin@gmail.com',
    password: 'password123',
    role: 'Admin',
    phone: '1234567890'
  },
  {
    name: 'HR Manager',
    email: 'hr@example.com',
    password: 'password123',
    role: 'HR',
    phone: '1234567891'
  },
  {
    name: 'Warehouse Manager',
    email: 'manager@example.com',
    password: 'password123',
    role: 'Manager',
    phone: '1234567892'
  },
  {
    name: 'Standard Employee',
    email: 'employee@example.com',
    password: 'password123',
    role: 'Employee',
    phone: '1234567893'
  },
  {
    name: 'Sales Rep',
    email: 'sales@example.com',
    password: 'password123',
    role: 'Sales Team',
    phone: '1234567894'
  }
];

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Clear existing users
    await User.deleteMany();
    console.log('Existing users removed');

    // Create users
    await User.create(users);
    console.log(`${users.length} users seeded successfully`);

    process.exit();
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
};

seedUsers();
