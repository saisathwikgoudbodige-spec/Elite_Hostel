const express = require('express');
const router = express.Router();
const {
  getRooms,
  getAvailableRooms,
  createRoom,
  updateRoom,
  deleteRoom
} = require('../controllers/roomController');
const { protect, authorize } = require('../middleware/auth');

// Public route to fetch available rooms for registration selection
router.get('/available', getAvailableRooms);

// Admin / Owner protected routes
router.use(protect);
router.use(authorize('owner'));

router.route('/')
  .get(getRooms)
  .post(createRoom);

router.route('/:id')
  .put(updateRoom)
  .delete(deleteRoom);

module.exports = router;
