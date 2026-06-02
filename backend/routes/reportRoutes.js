const express = require('express');
const router = express.Router();
const {
  getDailyReport,
  getMonthlyReport,
  getStudentReport,
  exportReport
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

// Protect all report endpoints to admin/owner accounts only
router.use(protect);
router.use(authorize('owner'));

router.get('/daily', getDailyReport);
router.get('/monthly', getMonthlyReport);
router.get('/student/:studentId', getStudentReport);
router.get('/export', exportReport);

module.exports = router;
