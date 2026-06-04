const express = require('express');
const router = express.Router();
const {
  recordPayment,
  getPaymentHistory,
  getPaymentsByStudent,
  getReceiptPdf,
  submitPayment,
  getPaymentRequests,
  approvePayment,
  declinePayment
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/paymentUpload');

// All payment routes require authentication
router.use(protect);

// Student-only payment submission
router.post('/submit', authorize('student'), upload.single('screenshot'), submitPayment);

// Owner-only pending request inbox and review actions
router.get('/requests', authorize('owner'), getPaymentRequests);
router.patch('/:id/approve', authorize('owner'), approvePayment);
router.patch('/:id/decline', authorize('owner'), declinePayment);

// Shared routes
router.get('/:id/receipt', getReceiptPdf);
router.get('/student/:studentId', getPaymentsByStudent);

// Admin / Owner only routes
router.use(authorize('owner'));
router.route('/')
  .post(recordPayment)
  .get(getPaymentHistory);

module.exports = router;
