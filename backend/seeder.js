require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Load models
const User = require('./models/User');
const Setting = require('./models/Setting');
const Room = require('./models/Room');
const Counter = require('./models/Counter');
const Student = require('./models/Student');
const Payment = require('./models/Payment');
const Notification = require('./models/Notification');
const Expense = require('./models/Expense');

const seedData = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hostel-fee-manager');
    console.log('MongoDB Connected for Seeding...');

    // Clear existing data
    await User.deleteMany();
    await Setting.deleteMany();
    await Room.deleteMany();
    await Counter.deleteMany();
    console.log('Existing collections cleared...');

    // 1. Seed Owner Admin User
    const adminPassword = 'adminpassword';
    const salt = await bcrypt.genSalt(12);
    const hashedAdminPassword = await bcrypt.hash(adminPassword, salt);

    const admin = await User.create({
      name: 'Hostel Manager',
      email: 'admin@hostel.com',
      password: hashedAdminPassword,
      role: 'owner'
    });
    console.log('Admin account created successfully.');
    console.log('Email: admin@hostel.com');
    console.log('Password: adminpassword');

    // 2. Seed Default Settings
    const settings = await Setting.create({
      hostelName: 'Elite Living Hostel',
      ownerEmail: 'admin@hostel.com',
      upiId: 'hostelmerchant@upi',
      defaultFeeCycleType: 'joining_date',
      defaultDueDay: 5
    });
    console.log('Default settings seeded successfully.');

    // 3. Seed Rooms
    const roomsToSeed = [
      { roomNumber: '101', totalBeds: 4, occupiedBeds: 0, students: [], status: 'Available' },
      { roomNumber: '102', totalBeds: 4, occupiedBeds: 0, students: [], status: 'Available' },
      { roomNumber: '201', totalBeds: 2, occupiedBeds: 0, students: [], status: 'Available' },
      { roomNumber: '202', totalBeds: 2, occupiedBeds: 0, students: [], status: 'Available' },
      { roomNumber: '301', totalBeds: 1, occupiedBeds: 0, students: [], status: 'Available' }
    ];

    await Room.create(roomsToSeed);
    console.log('Default rooms seeded successfully.');

    // 4. Seed counter for student ID
    await Counter.create({
      id: 'studentId',
      seq: 1000
    });
    console.log('Counter initialized.');

    console.log('Database Seeding Completed Successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
