const PDFDocument = require('pdfkit');

/**
 * Generates a beautiful PDF payment receipt and writes it to the output stream
 * @param {Object} payment - Mongoose payment doc
 * @param {Object} student - Mongoose student doc
 * @param {Object} feeDetails - Calculated fee details for the student
 * @param {Object} settings - Global settings (hostel name, etc.)
 * @param {Object} outStream - Writable stream (usually HTTP response)
 */
function generatePaymentReceipt(payment, student, feeDetails, settings, outStream) {
  const doc = new PDFDocument({ size: 'A5', margin: 30 }); // A5 is perfect for receipts
  doc.pipe(outStream);

  const primaryColor = '#0ea5e9'; // Sky blue
  const textColor = '#334155'; // Slate 700
  const lightTextColor = '#64748b'; // Slate 500
  const borderColor = '#cbd5e1'; // Slate 200

  // Border Around Receipt
  doc.rect(15, 15, doc.page.width - 30, doc.page.height - 30)
     .lineWidth(1)
     .stroke(borderColor);

  // Header Block
  doc.fillColor(primaryColor)
     .font('Helvetica-Bold')
     .fontSize(18)
     .text(settings.hostelName || 'Premium Hostel', 30, 30, { align: 'center' });

  doc.fillColor(lightTextColor)
     .font('Helvetica')
     .fontSize(9)
     .text('Official Fee Payment Receipt', 30, 52, { align: 'center' });

  // Draw Divider Line
  doc.moveTo(30, 68)
     .lineTo(doc.page.width - 30, 68)
     .lineWidth(1)
     .stroke(borderColor);

  // Left Column Info (Receipt details)
  doc.fillColor(textColor)
     .font('Helvetica-Bold')
     .fontSize(9)
     .text('Receipt No: ', 30, 85)
     .font('Helvetica')
     .text(payment._id.toString().substring(0, 10).toUpperCase(), 95, 85);

  doc.font('Helvetica-Bold')
     .text('Payment Date: ', 30, 100)
     .font('Helvetica')
     .text(new Date(payment.paymentDate).toLocaleDateString('en-IN'), 95, 100);

  doc.font('Helvetica-Bold')
     .text('Payment Mode: ', 30, 115)
     .font('Helvetica')
     .text(payment.paymentMode, 95, 115);

  if (payment.transactionId) {
    doc.font('Helvetica-Bold')
       .text('Txn ID: ', 30, 130)
       .font('Helvetica')
       .text(payment.transactionId, 95, 130);
  }

  // Right Column Info (Student details)
  const rightColX = 230;
  doc.font('Helvetica-Bold')
     .text('Student Name: ', rightColX, 85)
     .font('Helvetica')
     .text(student.name, rightColX + 75, 85);

  doc.font('Helvetica-Bold')
     .text('Student ID: ', rightColX, 100)
     .font('Helvetica')
     .text(student.studentId, rightColX + 75, 100);

  doc.font('Helvetica-Bold')
     .text('Room Number: ', rightColX, 115)
     .font('Helvetica')
     .text(student.roomNumber || 'Unallocated', rightColX + 75, 115);

  doc.font('Helvetica-Bold')
     .text('Contact Phone: ', rightColX, 130)
     .font('Helvetica')
     .text(student.phone, rightColX + 75, 130);

  // Draw Divider Line
  doc.moveTo(30, 155)
     .lineTo(doc.page.width - 30, 155)
     .lineWidth(1)
     .stroke(borderColor);

  // Table Header
  doc.fillColor(primaryColor)
     .font('Helvetica-Bold')
     .fontSize(10)
     .text('Description', 35, 165)
     .text('Amount (INR)', doc.page.width - 130, 165, { align: 'right' });

  // Table Content
  doc.fillColor(textColor)
     .font('Helvetica')
     .fontSize(9)
     .text('Hostel Monthly Accommodation Fee', 35, 185)
     .text(`₹${payment.amountPaid.toLocaleString('en-IN')}.00`, doc.page.width - 130, 185, { align: 'right' });

  if (payment.remarks) {
    doc.fillColor(lightTextColor)
       .fontSize(8)
       .text(`Remarks: ${payment.remarks}`, 35, 205);
  }

  // Total Box / Highlight Box
  doc.rect(30, doc.page.height - 180, doc.page.width - 60, 40)
     .fillOpacity(0.05)
     .fill(primaryColor);

  doc.fillOpacity(1.0)
     .fillColor(textColor)
     .font('Helvetica-Bold')
     .fontSize(11)
     .text('Total Amount Paid:', 40, doc.page.height - 165)
     .fillColor(primaryColor)
     .fontSize(12)
     .text(`INR ₹${payment.amountPaid.toLocaleString('en-IN')}.00`, doc.page.width - 170, doc.page.height - 165, { align: 'right' });

  // Balance info
  doc.fillColor(textColor)
     .font('Helvetica')
     .fontSize(8)
     .text(`Net Outstanding Dues (post-transaction): `, 35, doc.page.height - 120);

  const pendingText = feeDetails.pendingAmount > 0 
    ? `₹${feeDetails.pendingAmount.toLocaleString('en-IN')}.00 (Pending)`
    : `₹${feeDetails.advanceAmount.toLocaleString('en-IN')}.00 (Advance Credit)`;
  
  doc.font('Helvetica-Bold')
     .text(pendingText, 210, doc.page.height - 120);

  // Signatures
  doc.fillColor(lightTextColor)
     .font('Helvetica')
     .fontSize(8)
     .text('Generated Automatically', 30, doc.page.height - 70)
     .text('Hostel Warden/Authorized Signatory', doc.page.width - 180, doc.page.height - 70, { align: 'right' });

  // End Doc
  doc.end();
}

module.exports = {
  generatePaymentReceipt
};
