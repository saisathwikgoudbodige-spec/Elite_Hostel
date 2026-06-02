const mongoose = require('mongoose');

const SettingSchema = new mongoose.Schema({
  hostelName: {
    type: String,
    required: true,
    default: 'Premium Hostel'
  },
  ownerEmail: {
    type: String,
    required: true,
    default: 'admin@hostel.com'
  },
  upiId: {
    type: String,
    trim: true,
    default: 'merchant@upi'
  },
  defaultFeeCycleType: {
    type: String,
    enum: ['joining_date', 'fixed_date'],
    default: 'joining_date'
  },
  defaultDueDay: {
    type: Number,
    min: 1,
    max: 31,
    default: 5
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Setting', SettingSchema);
