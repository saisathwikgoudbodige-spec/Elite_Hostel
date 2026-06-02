const Student = require('../models/Student');
const Payment = require('../models/Payment');
const Room = require('../models/Room');
const Expense = require('../models/Expense');
const { calculateFeeDetails } = require('../utils/feeCalculator');
const PDFDocument = require('pdfkit');

// Helper to escape CSV cell contents
const escapeCSV = (val) => {
  if (val === undefined || val === null) return '';
  let str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    str = str.replace(/"/g, '""');
    return `"${str}"`;
  }
  return str;
};

// @desc    Get daily collection summary
// @route   GET /api/reports/daily
// @access  Private/Owner
const getDailyReport = async (req, res, next) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const payments = await Payment.find({
      paymentDate: { $gte: todayStart, $lte: todayEnd }
    }).populate('student', 'name studentId roomNumber');

    const totalCollected = payments.reduce((sum, p) => sum + p.amountPaid, 0);

    res.json({
      success: true,
      data: {
        date: new Date().toLocaleDateString('en-IN'),
        count: payments.length,
        totalCollected,
        payments
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get monthly collection and dues summary
// @route   GET /api/reports/monthly
// @access  Private/Owner
const getMonthlyReport = async (req, res, next) => {
  try {
    const students = await Student.find({ status: 'Active' });
    const payments = await Payment.find();
    
    let totalCollected = 0;
    let totalDuesPending = 0;
    let countPaid = 0;
    let countUnpaid = 0;

    const studentSummaries = students.map(student => {
      const studentPayments = payments.filter(p => p.student.toString() === student._id.toString());
      const feeDetails = calculateFeeDetails(student, studentPayments);
      
      totalCollected += feeDetails.totalPaid;
      totalDuesPending += feeDetails.pendingAmount;

      if (feeDetails.pendingAmount === 0) {
        countPaid++;
      } else {
        countUnpaid++;
      }

      return {
        name: student.name,
        studentId: student.studentId,
        roomNumber: student.roomNumber,
        monthlyFee: student.monthlyFee,
        totalPaid: feeDetails.totalPaid,
        pendingAmount: feeDetails.pendingAmount,
        statusColor: feeDetails.statusColor
      };
    });

    res.json({
      success: true,
      data: {
        activeStudents: students.length,
        paidStudents: countPaid,
        unpaidStudents: countUnpaid,
        totalCollected,
        totalDuesPending,
        studentSummaries
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get report for specific student
// @route   GET /api/reports/student/:studentId
// @access  Private/Owner
const getStudentReport = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.studentId);
    if (!student) {
      res.status(404);
      return next(new Error('Student not found'));
    }

    const payments = await Payment.find({ student: student._id }).sort({ paymentDate: -1 });
    const feeDetails = calculateFeeDetails(student, payments);

    res.json({
      success: true,
      data: {
        student,
        feeDetails,
        payments
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Export report as CSV or PDF
// @route   GET /api/reports/export
// @access  Private/Owner
const exportReport = async (req, res, next) => {
  try {
    const { type, format, studentId } = req.query;

    if (!type || !format) {
      res.status(400);
      return next(new Error('Please specify report type and format (csv or pdf)'));
    }

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      
      if (type === 'daily') {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const payments = await Payment.find({
          paymentDate: { $gte: todayStart, $lte: todayEnd }
        }).populate('student', 'name studentId roomNumber');

        res.setHeader('Content-Disposition', 'attachment; filename="daily_payments_report.csv"');
        
        let csv = 'Payment Date,Student ID,Student Name,Room Number,Amount Paid,Payment Mode,Transaction ID,Remarks\n';
        payments.forEach(p => {
          const date = new Date(p.paymentDate).toLocaleDateString('en-IN');
          const sId = p.student ? p.student.studentId : p.studentId;
          const sName = p.student ? p.student.name : 'Unknown';
          const room = p.student ? p.student.roomNumber : '';
          
          csv += `${escapeCSV(date)},${escapeCSV(sId)},${escapeCSV(sName)},${escapeCSV(room)},${escapeCSV(p.amountPaid)},${escapeCSV(p.paymentMode)},${escapeCSV(p.transactionId)},${escapeCSV(p.remarks)}\n`;
        });
        return res.send(csv);

      } else if (type === 'monthly') {
        const students = await Student.find({ status: 'Active' });
        const payments = await Payment.find();
        
        res.setHeader('Content-Disposition', 'attachment; filename="monthly_fees_report.csv"');
        
        let csv = 'Student ID,Student Name,Room Number,Monthly Fee,Total Paid,Pending Dues,Advance Amount,Due Status\n';
        students.forEach(student => {
          const studentPayments = payments.filter(p => p.student.toString() === student._id.toString());
          const details = calculateFeeDetails(student, studentPayments);
          
          csv += `${escapeCSV(student.studentId)},${escapeCSV(student.name)},${escapeCSV(student.roomNumber)},${escapeCSV(student.monthlyFee)},${escapeCSV(details.totalPaid)},${escapeCSV(details.pendingAmount)},${escapeCSV(details.advanceAmount)},${escapeCSV(details.statusColor.toUpperCase())}\n`;
        });
        return res.send(csv);

      } else if (type === 'student' && studentId) {
        const student = await Student.findById(studentId);
        if (!student) {
          res.status(404);
          return next(new Error('Student not found'));
        }
        const payments = await Payment.find({ student: student._id }).sort({ paymentDate: -1 });
        const details = calculateFeeDetails(student, payments);

        res.setHeader('Content-Disposition', `attachment; filename="report_${student.studentId}.csv"`);
        
        let csv = `Student Report: ${student.name} (${student.studentId})\n`;
        csv += `Monthly Fee: ₹${student.monthlyFee},Security Deposit: ₹${student.securityDeposit}\n`;
        csv += `Total Paid: ₹${details.totalPaid},Outstanding Dues: ₹${details.pendingAmount},Advance Credit: ₹${details.advanceAmount}\n\n`;
        csv += 'Payment Date,Receipt No,Amount Paid,Payment Mode,Transaction ID,Remarks\n';
        
        payments.forEach(p => {
          const date = new Date(p.paymentDate).toLocaleDateString('en-IN');
          csv += `${escapeCSV(date)},${escapeCSV(p._id)},${escapeCSV(p.amountPaid)},${escapeCSV(p.paymentMode)},${escapeCSV(p.transactionId)},${escapeCSV(p.remarks)}\n`;
        });
        return res.send(csv);
      }

    } else if (format === 'pdf') {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${type}_report.pdf"`);

      const doc = new PDFDocument({ size: 'A4', margin: 40 });
      doc.pipe(res);

      const primaryColor = '#0ea5e9';
      const textColor = '#334155';
      const borderColor = '#cbd5e1';

      // Header
      doc.fillColor(primaryColor).font('Helvetica-Bold').fontSize(20).text('Premium Hostel Reports', { align: 'center' });
      doc.fillColor(textColor).font('Helvetica').fontSize(10).text(`Generated on: ${new Date().toLocaleString('en-IN')}`, { align: 'center' });
      doc.moveDown(1.5);

      if (type === 'daily') {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const payments = await Payment.find({
          paymentDate: { $gte: todayStart, $lte: todayEnd }
        }).populate('student', 'name studentId roomNumber');
        const total = payments.reduce((sum, p) => sum + p.amountPaid, 0);

        doc.fontSize(14).font('Helvetica-Bold').text(`Daily Payment Collection Report`, { underline: true });
        doc.fontSize(10).font('Helvetica').text(`Total Transactions: ${payments.length}`);
        doc.text(`Total Amount Collected: INR ₹${total.toLocaleString('en-IN')}.00`);
        doc.moveDown();

        // Table headers
        let y = doc.y;
        doc.font('Helvetica-Bold');
        doc.text('Date', 40, y);
        doc.text('Student ID', 100, y);
        doc.text('Student Name', 180, y);
        doc.text('Room', 340, y);
        doc.text('Mode', 390, y);
        doc.text('Amount', 460, y, { width: 90, align: 'right' });
        doc.moveTo(40, y + 15).lineTo(550, y + 15).stroke(borderColor);
        doc.font('Helvetica');

        y += 20;
        payments.forEach(p => {
          const date = new Date(p.paymentDate).toLocaleDateString('en-IN');
          const sId = p.student ? p.student.studentId : p.studentId;
          const sName = p.student ? p.student.name : 'Unknown';
          const room = p.student ? p.student.roomNumber : '';
          
          doc.text(date, 40, y);
          doc.text(sId, 100, y);
          doc.text(sName.substring(0, 25), 180, y);
          doc.text(room, 340, y);
          doc.text(p.paymentMode, 390, y);
          doc.text(`₹${p.amountPaid}.00`, 460, y, { width: 90, align: 'right' });
          y += 18;
          
          if (y > doc.page.height - 50) {
            doc.addPage();
            y = 40;
          }
        });

      } else if (type === 'monthly') {
        const students = await Student.find({ status: 'Active' });
        const payments = await Payment.find();

        let totalCollected = 0;
        let totalPending = 0;

        doc.fontSize(14).font('Helvetica-Bold').text(`Monthly Fees and Pending Dues Summary`, { underline: true });
        doc.moveDown(0.5);

        let y = doc.y;
        doc.font('Helvetica-Bold');
        doc.text('Student ID', 40, y);
        doc.text('Student Name', 120, y);
        doc.text('Room', 280, y);
        doc.text('Monthly Fee', 330, y, { align: 'right', width: 70 });
        doc.text('Paid', 410, y, { align: 'right', width: 60 });
        doc.text('Pending Dues', 480, y, { align: 'right', width: 70 });
        doc.moveTo(40, y + 15).lineTo(550, y + 15).stroke(borderColor);
        doc.font('Helvetica');

        y += 20;
        students.forEach(student => {
          const studentPayments = payments.filter(p => p.student.toString() === student._id.toString());
          const details = calculateFeeDetails(student, studentPayments);
          
          totalCollected += details.totalPaid;
          totalPending += details.pendingAmount;

          doc.text(student.studentId, 40, y);
          doc.text(student.name.substring(0, 25), 120, y);
          doc.text(student.roomNumber || '-', 280, y);
          doc.text(`₹${student.monthlyFee}`, 330, y, { align: 'right', width: 70 });
          doc.text(`₹${details.totalPaid}`, 410, y, { align: 'right', width: 60 });
          doc.text(`₹${details.pendingAmount}`, 480, y, { align: 'right', width: 70 });
          y += 18;

          if (y > doc.page.height - 80) {
            doc.addPage();
            y = 40;
          }
        });

        doc.moveDown();
        doc.font('Helvetica-Bold');
        doc.text(`Total Collections: ₹${totalCollected.toLocaleString('en-IN')}.00`, 40, y + 20);
        doc.text(`Total Dues Pending: ₹${totalPending.toLocaleString('en-IN')}.00`, 40, y + 35);
      }

      doc.end();
      return;
    }

    res.status(400);
    return next(new Error('Invalid export format'));
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDailyReport,
  getMonthlyReport,
  getStudentReport,
  exportReport
};
