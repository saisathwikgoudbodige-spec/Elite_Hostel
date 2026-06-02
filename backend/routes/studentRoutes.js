const express = require('express');
const router = express.Router();
const {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  approveStudent,
  rejectOrDeactivateStudent,
  deleteStudent
} = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/auth');

// All student routes require logging in
router.use(protect);

// Fetch student detail - accessible by Owner or the student themselves
router.get('/:id', getStudentById);

// Owner-only administration endpoints
router.use(authorize('owner'));

router.route('/')
  .get(getStudents)
  .post(createStudent);

router.route('/:id')
  .put(updateStudent)
  .delete(deleteStudent);

router.put('/:id/approve', approveStudent);
router.put('/:id/reject', rejectOrDeactivateStudent);

module.exports = router;
