const Payment = require('../models/Payment');
const Student = require('../models/Student');
const Setting = require('../models/Setting');
const { calculateFeeDetails } = require('../utils/feeCalculator');
const { generatePaymentReceipt } = require('../utils/pdfGenerator');

// @desc    Record a new payment
// @route   POST /api/payments
// @access  Private/Owner
const recordPayment = async (req, res, next) => {
  try {
    const { studentId, amountPaid, paymentDate, paymentMode, transactionId, remarks } = req.body;

    if (!studentId || amountPaid === undefined) {
      res.status(400);
      return next(new Error('Please provide studentId and amountPaid'));
    }

    // Find student
    const student = await Student.findOne({ studentId });
    if (!student) {
      res.status(404);
      return next(new Error(`Student with ID ${studentId} not found`));
    }

    if (student.status !== 'Active') {
      res.status(400);
      return next(new Error(`Cannot record payment. Student status is currently ${student.status}.`));
    }

    // Create payment record
    const payment = await Payment.create({
      student: student._id,
      studentId,
      amountPaid: Number(amountPaid),
      paymentDate: paymentDate || new Date(),
      paymentMode,
      transactionId: transactionId || '',
      remarks: remarks || ''
    });

    // Recalculate fee details
    const studentPayments = await Payment.find({ student: student._id });
    const feeDetails = calculateFeeDetails(student, studentPayments);

    res.status(201).json({
      success: true,
      message: 'Payment recorded successfully',
      data: payment,
      feeDetails
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all payments history
// @route   GET /api/payments
// @access  Private/Owner
const getPaymentHistory = async (req, res, next) => {
  try {
    const { search } = req.query;

    let query = {};

    if (search) {
      // Find students matching name, studentId, or roomNumber
      const studentsMatching = await Student.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { studentId: { $regex: search, $options: 'i' } },
          { roomNumber: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');

      const studentIds = studentsMatching.map(s => s._id);
      query.student = { $in: studentIds };
    }

    const payments = await Payment.find(query)
      .populate('student', 'name studentId roomNumber email phone')
      .sort({ paymentDate: -1 });

    res.json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get payments for a specific student
// @route   GET /api/payments/student/:studentId
// @access  Private (Owner or Own Student)
const getPaymentsByStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.studentId);
    if (!student) {
      res.status(404);
      return next(new Error('Student not found'));
    }

    // Authorize student to view only their own records
    if (req.userRole === 'student' && req.user._id.toString() !== student._id.toString()) {
      res.status(403);
      return next(new Error('Unauthorized to view this payment history'));
    }

    const payments = await Payment.find({ student: student._id }).sort({ paymentDate: -1 });

    res.json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Generate PDF Receipt
// @route   GET /api/payments/:id/receipt
// @access  Private (Owner or Student of this payment)
const getReceiptPdf = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id).populate('student');
    if (!payment) {
      res.status(404);
      return next(new Error('Payment record not found'));
    }

    const student = payment.student;

    // Check authorization
    if (req.userRole === 'student' && req.user._id.toString() !== student._id.toString()) {
      res.status(403);
      return next(new Error('Unauthorized to view this receipt'));
    }

    // Get hostel settings
    let settings = await Setting.findOne();
    if (!settings) {
      settings = { hostelName: 'Premium Hostel' };
    }

    // Calculate updated fee details up to the payment's date
    const allPayments = await Payment.find({ student: student._id });
    const feeDetails = calculateFeeDetails(student, allPayments, payment.paymentDate);

    // Set Response Headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="receipt-${payment._id}.pdf"`);

    generatePaymentReceipt(payment, student, feeDetails, settings, res);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  recordPayment,
  getPaymentHistory,
  getPaymentsByStudent,
  getReceiptPdf
};
