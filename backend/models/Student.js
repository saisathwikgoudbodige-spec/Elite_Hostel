const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { encrypt, decrypt, maskAadhaar } = require('../utils/crypto');
const Counter = require('./Counter');

const StudentSchema = new mongoose.Schema({
  studentId: {
    type: String,
    unique: true
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required']
  },
  gender: {
    type: String,
    required: [true, 'Gender is required'],
    enum: ['Male', 'Female', 'Other']
  },
  photo: {
    type: String,
    default: ''
  },
  aadhaarNumber: {
    type: String,
    required: [true, 'Aadhaar number is required'],
    // We will encrypt/decrypt this in save hooks or set/get
  },
  parentOrGuardianName: {
    type: String,
    required: [true, 'Parent/Guardian name is required'],
    trim: true
  },
  guardianRelationship: {
    type: String,
    required: [true, 'Relationship is required'],
    enum: ['Father', 'Mother', 'Guardian']
  },
  parentPhone: {
    type: String,
    required: [true, 'Parent phone number is required'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Student phone number is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  college: {
    type: String,
    required: [true, 'College name is required'],
    trim: true
  },
  course: {
    type: String,
    required: [true, 'Course is required'],
    trim: true
  },
  branch: {
    type: String,
    required: [true, 'Branch is required'],
    trim: true
  },
  yearOfStudy: {
    type: Number,
    required: [true, 'Year of study is required'],
    min: 1,
    max: 5
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true
  },
  roomNumber: {
    type: String,
    default: ''
  },
  monthlyFee: {
    type: Number,
    required: [true, 'Monthly fee is required']
  },
  securityDeposit: {
    type: Number,
    required: [true, 'Security deposit is required']
  },
  joiningDate: {
    type: Date,
    required: [true, 'Joining date is required']
  },
  feeCycleType: {
    type: String,
    required: [true, 'Fee cycle preference is required'],
    enum: ['joining_date', 'fixed_date'],
    default: 'joining_date'
  },
  dueDay: {
    type: Number,
    min: 1,
    max: 31,
    default: 1 // Default to 1st of month if fixed_date is chosen
  },
  status: {
    type: String,
    enum: ['Pending', 'Active', 'Inactive'],
    default: 'Pending'
  },
  documentScan: {
    type: String,
    default: ''
  },
  collegeIdScan: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Indexes for high performance searches
StudentSchema.index({ studentId: 1 });
StudentSchema.index({ email: 1 });
StudentSchema.index({ roomNumber: 1 });
StudentSchema.index({ status: 1 });

// Encrypt Aadhaar number and hash password before saving
StudentSchema.pre('save', async function(next) {
  // Hash password if modified
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
  }

  // Encrypt Aadhaar if modified or new
  if (this.isModified('aadhaarNumber')) {
    this.aadhaarNumber = encrypt(this.aadhaarNumber);
  }

  // Auto-increment studentId if not already present
  if (!this.studentId) {
    try {
      const counter = await Counter.findOneAndUpdate(
        { id: 'studentId' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      this.studentId = `STU${counter.seq}`;
    } catch (err) {
      return next(err);
    }
  }

  next();
});

// Compare password
StudentSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Mask Aadhaar and remove password in JSON responses
StudentSchema.set('toJSON', {
  transform: function(doc, ret) {
    if (ret.aadhaarNumber) {
      const decrypted = decrypt(ret.aadhaarNumber);
      ret.aadhaarNumber = maskAadhaar(decrypted);
    }
    delete ret.password;
    return ret;
  }
});

StudentSchema.set('toObject', {
  transform: function(doc, ret) {
    if (ret.aadhaarNumber) {
      const decrypted = decrypt(ret.aadhaarNumber);
      ret.aadhaarNumber = maskAadhaar(decrypted);
    }
    delete ret.password;
    return ret;
  }
});

module.exports = mongoose.model('Student', StudentSchema);
