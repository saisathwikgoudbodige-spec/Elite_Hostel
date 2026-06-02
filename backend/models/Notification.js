const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  studentId: {
    type: String,
    required: true
  },
  recipientName: {
    type: String,
    required: true
  },
  recipientPhone: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['WhatsApp', 'Email', 'SMS'],
    default: 'WhatsApp'
  },
  sentDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Sent', 'Failed'],
    default: 'Sent'
  }
}, {
  timestamps: true
});

NotificationSchema.index({ studentId: 1 });
NotificationSchema.index({ sentDate: -1 });

module.exports = mongoose.model('Notification', NotificationSchema);
