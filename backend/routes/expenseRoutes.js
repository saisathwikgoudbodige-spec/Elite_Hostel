const express = require('express');
const router = express.Router();
const {
  getExpenses,
  createExpense,
  deleteExpense,
  getExpenseSummary
} = require('../controllers/expenseController');
const { protect, authorize } = require('../middleware/auth');

// All expense routes require admin logins
router.use(protect);
router.use(authorize('owner'));

router.get('/summary', getExpenseSummary);

router.route('/')
  .get(getExpenses)
  .post(createExpense);

router.route('/:id')
  .delete(deleteExpense);

module.exports = router;
