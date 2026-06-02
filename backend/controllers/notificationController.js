const Notification = require('../models/Notification');
const Student = require('../models/Student');
const Payment = require('../models/Payment');
const Setting = require('../models/Setting');
const { calculateFeeDetails } = require('../utils/feeCalculator');

// @desc    Get all notifications log
// @route   GET /api/notifications
// @access  Private/Owner
const getNotificationsLog = async (req, res, next) => {
  try {
    const logs = await Notification.find()
      .populate('student', 'name studentId roomNumber')
      .sort({ sentDate: -1 });

    res.json({
      success: true,
      count: logs.length,
      data: logs
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get list of students needing reminders (due in <= 3 days, or overdue)
// @route   GET /api/notifications/reminders
// @access  Private/Owner
const getRemindersList = async (req, res, next) => {
  try {
    const students = await Student.find({ status: 'Active' });
    const payments = await Payment.find();
    
    const candidates = [];

    for (const student of students) {
      const studentPayments = payments.filter(p => p.student.toString() === student._id.toString());
      const feeDetails = calculateFeeDetails(student, studentPayments);

      // If they owe money
      if (feeDetails.pendingAmount > 0) {
        candidates.push({
          _id: student._id,
          studentId: student.studentId,
          name: student.name,
          phone: student.phone,
          roomNumber: student.roomNumber,
          parentOrGuardianName: student.parentOrGuardianName,
          parentPhone: student.parentPhone,
          pendingAmount: feeDetails.pendingAmount,
          nextDueDate: feeDetails.nextDueDate,
          statusColor: feeDetails.statusColor
        });
      }
    }

    res.json({
      success: true,
      count: candidates.length,
      data: candidates
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Simulate and log sending a reminder
// @route   POST /api/notifications/send
// @access  Private/Owner
const sendReminder = async (req, res, next) => {
  try {
    const { studentId, type } = req.body; // Student ID (ObjectId)
    const notificationType = type || 'WhatsApp';

    const student = await Student.findById(studentId);
    if (!student) {
      res.status(404);
      return next(new Error('Student not found'));
    }

    // Get hostel settings
    let settings = await Setting.findOne();
    if (!settings) {
      settings = { hostelName: 'Premium Hostel' };
    }

    // Calculate dues
    const payments = await Payment.find({ student: student._id });
    const details = calculateFeeDetails(student, payments);

    if (details.pendingAmount <= 0) {
      res.status(400);
      return next(new Error('This student has no outstanding dues. No reminder needed.'));
    }

    const formattedDate = new Date(details.nextDueDate).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    // Formulate message template
    // "Dear [Parent/Guardian Name], hostel fee of ₹[Amount] for [Student Name] is due on [Due Date]. Please pay before the due date. — [Hostel Name]"
    const message = `Dear ${student.parentOrGuardianName}, hostel fee of ₹${details.pendingAmount.toLocaleString('en-IN')} for ${student.name} is due on ${formattedDate}. Please pay before the due date. — ${settings.hostelName}`;

    // Create Notification Log in DB
    const log = await Notification.create({
      student: student._id,
      studentId: student.studentId,
      recipientName: student.parentOrGuardianName,
      recipientPhone: student.parentPhone,
      message,
      type: notificationType,
      status: 'Sent' // Mock sending as always successful
    });

    res.json({
      success: true,
      message: `Reminder logged as sent via ${notificationType}`,
      data: log,
      smsText: message,
      // Provide url encoded string for frontend WhatsApp link
      whatsappUrl: `https://wa.me/91${student.parentPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getNotificationsLog,
  getRemindersList,
  sendReminder
};
