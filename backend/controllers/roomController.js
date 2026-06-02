const Room = require('../models/Room');
const Student = require('../models/Student');

// @desc    Get all rooms (Admin view)
// @route   GET /api/rooms
// @access  Private/Owner
const getRooms = async (req, res, next) => {
  try {
    const rooms = await Room.find().populate('students', 'name studentId status phone').sort({ roomNumber: 1 });
    res.json({
      success: true,
      count: rooms.length,
      data: rooms
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get available rooms list (for dropdowns, public/student-accessible)
// @route   GET /api/rooms/available
// @access  Public
const getAvailableRooms = async (req, res, next) => {
  try {
    const rooms = await Room.find({ status: 'Available' }).select('roomNumber totalBeds occupiedBeds');
    res.json({
      success: true,
      data: rooms
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a room
// @route   POST /api/rooms
// @access  Private/Owner
const createRoom = async (req, res, next) => {
  try {
    const { roomNumber, totalBeds } = req.body;

    if (!roomNumber || !totalBeds) {
      res.status(400);
      return next(new Error('Please provide roomNumber and totalBeds'));
    }

    const roomExists = await Room.findOne({ roomNumber });
    if (roomExists) {
      res.status(400);
      return next(new Error(`Room ${roomNumber} already exists`));
    }

    const room = await Room.create({
      roomNumber,
      totalBeds: Number(totalBeds),
      occupiedBeds: 0,
      students: [],
      status: 'Available'
    });

    res.status(201).json({
      success: true,
      data: room
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update room details
// @route   PUT /api/rooms/:id
// @access  Private/Owner
const updateRoom = async (req, res, next) => {
  try {
    const { roomNumber, totalBeds, status } = req.body;
    let room = await Room.findById(req.params.id);

    if (!room) {
      res.status(404);
      return next(new Error('Room not found'));
    }

    // Check if new roomNumber conflicts
    if (roomNumber && roomNumber !== room.roomNumber) {
      const roomConflict = await Room.findOne({ roomNumber });
      if (roomConflict) {
        res.status(400);
        return next(new Error(`Room ${roomNumber} already exists`));
      }
      
      // Update room number in all allocated students
      await Student.updateMany(
        { _id: { $in: room.students } },
        { roomNumber: roomNumber }
      );
    }

    if (totalBeds !== undefined) {
      if (Number(totalBeds) < room.students.length) {
        res.status(400);
        return next(new Error(`Cannot reduce bed capacity to ${totalBeds} because ${room.students.length} students are currently allocated.`));
      }
      room.totalBeds = Number(totalBeds);
    }

    if (roomNumber) room.roomNumber = roomNumber;
    
    // Recalculate status based on beds
    room.occupiedBeds = room.students.length;
    if (status) {
      room.status = status;
    } else {
      room.status = room.occupiedBeds >= room.totalBeds ? 'Full' : 'Available';
    }

    await room.save();

    res.json({
      success: true,
      data: room
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete room
// @route   DELETE /api/rooms/:id
// @access  Private/Owner
const deleteRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      res.status(404);
      return next(new Error('Room not found'));
    }

    // Check if room has students
    if (room.students && room.students.length > 0) {
      res.status(400);
      return next(new Error('Cannot delete room with allocated students. Please reallocate students first.'));
    }

    await Room.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Room deleted successfully.'
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getRooms,
  getAvailableRooms,
  createRoom,
  updateRoom,
  deleteRoom
};
