const express = require('express');
const router = express.Router();
const {
  recordPayment,
  getPaymentHistory,
  getPaymentsByStudent,
  getReceiptPdf
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');

// All payment routes require authentication
router.use(protect);

// Student/Owner shared routes
router.get('/:id/receipt', getReceiptPdf);
router.get('/student/:studentId', getPaymentsByStudent);

// Admin / Owner only routes
router.use(authorize('owner'));
router.route('/')
  .post(recordPayment)
  .get(getPaymentHistory);

module.exports = router;
