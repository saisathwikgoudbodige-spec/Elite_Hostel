const express = require('express');
const router = express.Router();
const {
  getNotificationsLog,
  getRemindersList,
  sendReminder
} = require('../controllers/notificationController');
const { protect, authorize } = require('../middleware/auth');

// Protect all reminder endpoints to owner accounts
router.use(protect);
router.use(authorize('owner'));

router.get('/', getNotificationsLog);
router.get('/reminders', getRemindersList);
router.post('/send', sendReminder);

module.exports = router;
