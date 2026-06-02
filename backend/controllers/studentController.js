const Student = require('../models/Student');
const Payment = require('../models/Payment');
const Room = require('../models/Room');
const { calculateFeeDetails } = require('../utils/feeCalculator');
const { decrypt } = require('../utils/crypto');

/**
 * Helper to sync room occupancy details when a student changes rooms
 */
const syncRoomOccupancy = async (studentObjectId, newRoomNo, oldRoomNo) => {
  // If room number hasn't changed, do nothing
  if (newRoomNo === oldRoomNo) return;

  // 1. Remove student from old room if they were in one
  if (oldRoomNo) {
    const oldRoom = await Room.findOne({ roomNumber: oldRoomNo });
    if (oldRoom) {
      oldRoom.students = oldRoom.students.filter(
        (id) => id.toString() !== studentObjectId.toString()
      );
      oldRoom.occupiedBeds = oldRoom.students.length;
      oldRoom.status = oldRoom.occupiedBeds >= oldRoom.totalBeds ? 'Full' : 'Available';
      await oldRoom.save();
    }
  }

  // 2. Add student to new room if assigned
  if (newRoomNo) {
    const newRoom = await Room.findOne({ roomNumber: newRoomNo });
    if (newRoom) {
      // Check if student already in list
      if (!newRoom.students.includes(studentObjectId)) {
        newRoom.students.push(studentObjectId);
      }
      newRoom.occupiedBeds = newRoom.students.length;
      newRoom.status = newRoom.occupiedBeds >= newRoom.totalBeds ? 'Full' : 'Available';
      await newRoom.save();
    }
  }
};

// @desc    Get all students with filters and search
// @route   GET /api/students
// @access  Private/Owner
const getStudents = async (req, res, next) => {
  try {
    const { status, search, course, branch, yearOfStudy, roomNumber, filterType } = req.query;

    let query = {};

    // 1. Apply status filter
    if (status) {
      query.status = status;
    }

    // 2. Academic filters
    if (course) query.course = course;
    if (branch) query.branch = branch;
    if (yearOfStudy) query.yearOfStudy = Number(yearOfStudy);
    if (roomNumber) query.roomNumber = roomNumber;

    // 3. Search parameters (name, studentId, phone, roomNumber)
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { roomNumber: { $regex: search, $options: 'i' } }
      ];
    }

    // Retrieve students matching filters
    let students = await Student.find(query).lean();

    // 4. If search query could be last 4 digits of Aadhaar
    if (search && /^\d{4}$/.test(search)) {
      // If we are searching for 4 digits, let's also fetch and search by Aadhaar
      // (This filters the in-memory array by comparing decrypted Aadhaar last 4)
      const allStudents = await Student.find({ status: query.status }).lean();
      const aadhaarMatches = allStudents.filter(s => {
        if (!s.aadhaarNumber) return false;
        try {
          const decrypted = decrypt(s.aadhaarNumber);
          return decrypted.slice(-4) === search;
        } catch (e) {
          return false;
        }
      });
      
      // Combine results safely by _id
      const studentIds = new Set(students.map(s => s._id.toString()));
      aadhaarMatches.forEach(match => {
        if (!studentIds.has(match._id.toString())) {
          students.push(match);
        }
      });
    }

    // 5. Compute and attach fee status and details for each student
    const enrichedStudents = await Promise.all(
      students.map(async (student) => {
        const payments = await Payment.find({ student: student._id });
        const feeDetails = calculateFeeDetails(student, payments);
        return {
          ...student,
          feeDetails
        };
      })
    );

    // 6. Extra filterType options: Paid | Pending | Overdue | 1 Month Due | 2 Months Due | 3+ Months Due
    let filteredStudents = enrichedStudents;
    if (filterType) {
      filteredStudents = enrichedStudents.filter(student => {
        const { pendingAmount, statusColor, monthsElapsed } = student.feeDetails;
        
        switch (filterType) {
          case 'Paid':
            return pendingAmount === 0;
          case 'Pending':
            return pendingAmount > 0;
          case 'Overdue':
            return statusColor === 'red';
          case '1 Month Due':
            return pendingAmount > 0 && monthsElapsed === 1;
          case '2 Months Due':
            return pendingAmount > 0 && monthsElapsed === 2;
          case '3+ Months Due':
            return pendingAmount > 0 && monthsElapsed >= 3;
          default:
            return true;
        }
      });
    }

    res.json({
      success: true,
      count: filteredStudents.length,
      data: filteredStudents
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single student by ID
// @route   GET /api/students/:id
// @access  Private (Owner or own student profile)
const getStudentById = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      res.status(404);
      return next(new Error('Student not found'));
    }

    // Check authorization: Owner or the student itself
    if (req.userRole === 'student' && req.user._id.toString() !== student._id.toString()) {
      res.status(403);
      return next(new Error('Access denied. You can only view your own profile.'));
    }

    const payments = await Payment.find({ student: student._id }).sort({ paymentDate: -1 });
    const feeDetails = calculateFeeDetails(student, payments);

    res.json({
      success: true,
      data: student,
      feeDetails,
      payments
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create student (Admin Direct)
// @route   POST /api/students
// @access  Private/Owner
const createStudent = async (req, res, next) => {
  try {
    const { email } = req.body;

    const emailExists = await Student.findOne({ email });
    if (emailExists) {
      res.status(400);
      return next(new Error('Email already registered'));
    }

    // Create active student directly
    const student = new Student({
      ...req.body,
      status: req.body.status || 'Active'
    });

    const savedStudent = await student.save();

    // Assign to room if roomNumber specified
    if (savedStudent.roomNumber) {
      await syncRoomOccupancy(savedStudent._id, savedStudent.roomNumber, null);
    }

    res.status(201).json({
      success: true,
      data: savedStudent
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update student details
// @route   PUT /api/students/:id
// @access  Private/Owner
const updateStudent = async (req, res, next) => {
  try {
    let student = await Student.findById(req.params.id);

    if (!student) {
      res.status(404);
      return next(new Error('Student not found'));
    }

    const oldRoomNo = student.roomNumber;
    const newRoomNo = req.body.roomNumber;

    // Check room capacity if room changes and is not empty
    if (newRoomNo && newRoomNo !== oldRoomNo) {
      const room = await Room.findOne({ roomNumber: newRoomNo });
      if (!room) {
        res.status(400);
        return next(new Error(`Room ${newRoomNo} does not exist.`));
      }
      if (room.occupiedBeds >= room.totalBeds) {
        res.status(400);
        return next(new Error(`Room ${newRoomNo} is already full.`));
      }
    }

    // Update fields
    const fieldsToUpdate = { ...req.body };
    // Prevent manual password change this way
    delete fieldsToUpdate.password;

    // Update record
    student = await Student.findByIdAndUpdate(req.params.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    // Synchronize room occupancy
    await syncRoomOccupancy(student._id, student.roomNumber, oldRoomNo);

    res.json({
      success: true,
      data: student
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Approve student registration
// @route   PUT /api/students/:id/approve
// @access  Private/Owner
const approveStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      res.status(404);
      return next(new Error('Student not found'));
    }

    if (student.status !== 'Pending') {
      res.status(400);
      return next(new Error('Student is already approved or active'));
    }

    // Capture approval updates (e.g. override room, set final fee)
    const { roomNumber, monthlyFee, securityDeposit, feeCycleType, dueDay } = req.body;

    if (roomNumber) {
      // Check room capacity
      const room = await Room.findOne({ roomNumber });
      if (!room) {
        res.status(400);
        return next(new Error(`Room ${roomNumber} does not exist`));
      }
      if (room.occupiedBeds >= room.totalBeds) {
        res.status(400);
        return next(new Error(`Room ${roomNumber} is full`));
      }
      student.roomNumber = roomNumber;
    }

    if (monthlyFee !== undefined) student.monthlyFee = monthlyFee;
    if (securityDeposit !== undefined) student.securityDeposit = securityDeposit;
    if (feeCycleType !== undefined) student.feeCycleType = feeCycleType;
    if (dueDay !== undefined) student.dueDay = dueDay;

    student.status = 'Active';
    await student.save();

    // Perform room occupancy synchronization
    if (student.roomNumber) {
      await syncRoomOccupancy(student._id, student.roomNumber, null);
    }

    res.json({
      success: true,
      message: 'Student registration approved successfully!',
      data: student
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Reject / Deactivate student
// @route   PUT /api/students/:id/reject
// @access  Private/Owner
const rejectOrDeactivateStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      res.status(404);
      return next(new Error('Student not found'));
    }

    const oldRoomNo = student.roomNumber;
    student.status = 'Inactive';
    student.roomNumber = ''; // Unassign room
    await student.save();

    // Release bed in the room
    if (oldRoomNo) {
      await syncRoomOccupancy(student._id, null, oldRoomNo);
    }

    res.json({
      success: true,
      message: 'Student account has been deactivated.',
      data: student
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete student profile
// @route   DELETE /api/students/:id
// @access  Private/Owner
const deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      res.status(404);
      return next(new Error('Student not found'));
    }

    const oldRoomNo = student.roomNumber;
    
    // Remove from DB
    await Student.findByIdAndDelete(req.params.id);

    // Delete associated payments
    await Payment.deleteMany({ student: req.params.id });

    // Release bed
    if (oldRoomNo) {
      await syncRoomOccupancy(student._id, null, oldRoomNo);
    }

    res.json({
      success: true,
      message: 'Student record and payment history deleted successfully.'
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  approveStudent,
  rejectOrDeactivateStudent,
  deleteStudent
};
