const express = require('express');
const router = express.Router();
const { registerOwner, registerStudent, loginStudent, loginOwner, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Owner registration
router.post('/register/owner', registerOwner);

// Student self registration with file uploads
router.post('/register', upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'documentScan', maxCount: 1 },
  { name: 'collegeIdScan', maxCount: 1 }
]), registerStudent);

// Login endpoints
router.post('/login/student', loginStudent);
router.post('/login/owner', loginOwner);

// Current user profile
router.get('/me', protect, getMe);

module.exports = router;
