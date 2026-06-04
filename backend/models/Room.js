const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  roomNumber: {
    type: String,
    required: [true, 'Room number is required'],
    trim: true
  },
  totalBeds: {
    type: Number,
    required: [true, 'Total beds is required'],
    min: [1, 'Must have at least 1 bed']
  },
  occupiedBeds: {
    type: Number,
    default: 0
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  }],
  status: {
    type: String,
    enum: ['Available', 'Full', 'Maintenance'],
    default: 'Available'
  }
}, {
  timestamps: true
});

RoomSchema.index({ roomNumber: 1 });

module.exports = mongoose.model('Room', RoomSchema);
