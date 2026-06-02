const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingController');
const { protect, authorize } = require('../middleware/auth');

// All setting paths require a valid session
router.use(protect);

router.route('/')
  .get(getSettings)
  .put(authorize('owner'), updateSettings);

module.exports = router;
