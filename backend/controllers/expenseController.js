const Expense = require('../models/Expense');

// @desc    Get all expenses
// @route   GET /api/expenses
// @access  Private/Owner
const getExpenses = async (req, res, next) => {
  try {
    const { category, search } = req.query;
    let query = {};

    if (category) {
      query.category = category;
    }

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const expenses = await Expense.find(query).sort({ date: -1 });

    res.json({
      success: true,
      count: expenses.length,
      data: expenses
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create an expense
// @route   POST /api/expenses
// @access  Private/Owner
const createExpense = async (req, res, next) => {
  try {
    const { title, amount, category, date, remarks } = req.body;

    if (!title || !amount || !category) {
      res.status(400);
      return next(new Error('Please provide title, amount, and category'));
    }

    const expense = await Expense.create({
      title,
      amount: Number(amount),
      category,
      date: date || new Date(),
      remarks: remarks || ''
    });

    res.status(201).json({
      success: true,
      data: expense
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete an expense
// @route   DELETE /api/expenses/:id
// @access  Private/Owner
const deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      res.status(404);
      return next(new Error('Expense record not found'));
    }

    await Expense.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Expense record deleted successfully.'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get expense summary analytics
// @route   GET /api/expenses/summary
// @access  Private/Owner
const getExpenseSummary = async (req, res, next) => {
  try {
    // Category aggregation
    const aggregation = await Expense.aggregate([
      {
        $group: {
          _id: '$category',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    const totalExpense = aggregation.reduce((sum, item) => sum + item.totalAmount, 0);

    res.json({
      success: true,
      data: {
        totalExpense,
        categories: aggregation
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getExpenses,
  createExpense,
  deleteExpense,
  getExpenseSummary
};
