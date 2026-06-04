const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  studentId: {
    type: String,
    required: true
  },
  amountPaid: {
    type: Number,
    required: [true, 'Amount paid is required'],
    min: [0, 'Amount cannot be negative']
  },
  paymentDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  paymentMode: {
    type: String,
    required: [true, 'Payment mode is required'],
    enum: ['Cash', 'UPI', 'Bank Transfer', 'Card'],
    default: 'UPI'
  },
  transactionId: {
    type: String,
    trim: true,
    default: ''
  },
  remarks: {
    type: String,
    trim: true,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'declined'],
    default: 'pending'
  },
  screenshotUrl: {
    type: String,
    default: ''
  },
  declineReason: {
    type: String,
    trim: true,
    default: ''
  },
  reviewedAt: {
    type: Date
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

PaymentSchema.index({ studentId: 1 });
PaymentSchema.index({ paymentDate: -1 });

module.exports = mongoose.model('Payment', PaymentSchema);
