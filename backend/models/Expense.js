const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Expense title is required'],
    trim: true
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Utilities', 'Maintenance', 'Food', 'Salaries', 'Rent', 'Others'],
    default: 'Others'
  },
  date: {
    type: Date,
    default: Date.now,
    required: true
  },
  remarks: {
    type: String,
    trim: true,
    default: ''
  }
}, {
  timestamps: true
});

ExpenseSchema.index({ date: -1 });
ExpenseSchema.index({ category: 1 });

module.exports = mongoose.model('Expense', ExpenseSchema);
