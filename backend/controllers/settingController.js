const Setting = require('../models/Setting');

// @desc    Get hostel settings
// @route   GET /api/settings
// @access  Private
const getSettings = async (req, res, next) => {
  try {
    let settings = await Setting.findOne();

    // Auto seed default settings if not exists
    if (!settings) {
      settings = await Setting.create({
        hostelName: 'Premium Hostel',
        ownerEmail: 'admin@hostel.com',
        upiId: 'merchant@upi',
        defaultFeeCycleType: 'joining_date',
        defaultDueDay: 5
      });
    }

    res.json({
      success: true,
      data: settings
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update hostel settings
// @route   PUT /api/settings
// @access  Private/Owner
const updateSettings = async (req, res, next) => {
  try {
    let settings = await Setting.findOne();

    if (!settings) {
      settings = new Setting(req.body);
    } else {
      Object.assign(settings, req.body);
    }

    await settings.save();

    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: settings
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getSettings,
  updateSettings
};
