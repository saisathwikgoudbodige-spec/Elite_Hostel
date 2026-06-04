const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Student = require('../models/Student');
const bcrypt = require('bcryptjs');

// Helper to generate JWT Token
const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || 'secretkey',
    { expiresIn: '30d' }
  );
};

// @desc    Register a new hostel owner
// @route   POST /api/auth/register/owner
// @access  Public
const registerOwner = async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // Validation
    if (!name || !email || !password || !confirmPassword) {
      res.status(400);
      return next(new Error('Please provide all required fields'));
    }

    if (password !== confirmPassword) {
      res.status(400);
      return next(new Error('Passwords do not match'));
    }

    if (password.length < 6) {
      res.status(400);
      return next(new Error('Password must be at least 6 characters'));
    }

    // Check if email already exists
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      res.status(400);
      return next(new Error('Email is already registered'));
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create owner
    const owner = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'owner'
    });

    res.status(201).json({
      success: true,
      message: 'Owner account created successfully! You can now login.',
      token: generateToken(owner._id, 'owner'),
      role: 'owner',
      user: {
        _id: owner._id,
        name: owner.name,
        email: owner.email,
        role: owner.role
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Register a new student
// @route   POST /api/auth/register
// @access  Public
const registerStudent = async (req, res, next) => {
  try {
    const studentData = { ...req.body };

    // Check if email already exists
    const emailExists = await Student.findOne({ email: studentData.email });
    const userEmailExists = await User.findOne({ email: studentData.email });
    if (emailExists || userEmailExists) {
      res.status(400);
      return next(new Error('Email is already registered'));
    }

    // Handle files if uploaded
    if (req.files) {
      if (req.files.photo) {
        studentData.photo = `/uploads/${req.files.photo[0].filename}`;
      }
      if (req.files.documentScan) {
        studentData.documentScan = `/uploads/${req.files.documentScan[0].filename}`;
      }
      if (req.files.collegeIdScan) {
        studentData.collegeIdScan = `/uploads/${req.files.collegeIdScan[0].filename}`;
      }
    }

    // Validate Aadhaar length
    if (studentData.aadhaarNumber && studentData.aadhaarNumber.length !== 12) {
      res.status(400);
      return next(new Error('Aadhaar number must be exactly 12 digits'));
    }

    // Force default status as Pending
    studentData.status = 'Pending';

    // Create student
    const student = await Student.create(studentData);

    res.status(201).json({
      success: true,
      message: 'Registration successful! Your account is pending approval by the hostel owner.',
      data: {
        id: student._id,
        studentId: student.studentId,
        name: student.name,
        email: student.email,
        status: student.status
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Login student
// @route   POST /api/auth/login/student
// @access  Public
const loginStudent = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      return next(new Error('Please provide email and password'));
    }

    // Find student
    const student = await Student.findOne({ email });
    if (!student) {
      res.status(401);
      return next(new Error('Invalid email or password'));
    }

    // Match password
    const isMatch = await student.matchPassword(password);
    if (!isMatch) {
      res.status(401);
      return next(new Error('Invalid email or password'));
    }

    res.json({
      success: true,
      token: generateToken(student._id, 'student'),
      role: 'student',
      user: {
        _id: student._id,
        studentId: student.studentId,
        name: student.name,
        email: student.email,
        status: student.status
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Login hostel owner/admin
// @route   POST /api/auth/login/owner
// @access  Public
const loginOwner = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      return next(new Error('Please provide email and password'));
    }

    // Find owner
    const owner = await User.findOne({ email, role: 'owner' });
    if (!owner) {
      res.status(401);
      return next(new Error('Invalid email or password'));
    }

    // Match password
    const isMatch = await owner.matchPassword(password);
    if (!isMatch) {
      res.status(401);
      return next(new Error('Invalid email or password'));
    }

    res.json({
      success: true,
      token: generateToken(owner._id, 'owner'),
      role: 'owner',
      user: {
        _id: owner._id,
        name: owner.name,
        email: owner.email,
        role: owner.role
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current logged in user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    res.json({
      success: true,
      role: req.userRole,
      user: req.user
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  registerOwner,
  registerStudent,
  loginStudent,
  loginOwner,
  getMe
};
