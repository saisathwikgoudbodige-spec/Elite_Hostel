const express = require('express');
const router = express.Router();
const {
  getNotificationsLog,
  getRemindersList,
  sendReminder,
  getStudentNotifications
} = require('../controllers/notificationController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/student', authorize('student'), getStudentNotifications);
router.get('/reminders', authorize('owner'), getRemindersList);
router.post('/send', authorize('owner'), sendReminder);
router.get('/', authorize('owner'), getNotificationsLog);

module.exports = router;
