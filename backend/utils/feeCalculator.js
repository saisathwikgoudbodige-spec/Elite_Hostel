/**
 * Helper to add months to a date, handling month-end roll-overs
 */
function addMonths(date, months) {
  const result = new Date(date);
  const expectedMonth = result.getMonth() + months;
  result.setMonth(expectedMonth);
  // Handle overflow (e.g. Jan 31 + 1 month => Feb 28, not Mar 3)
  if (result.getMonth() !== (expectedMonth % 12 + 12) % 12) {
    result.setDate(0); // Sets to last day of previous month
  }
  return result;
}

/**
 * Helper to get a fixed day for a specific year and month, capping at month end
 */
function getFixedDateForMonth(year, month, dueDay) {
  const date = new Date(year, month, dueDay);
  // If the month rolled over, cap to the last day of the target month
  if (date.getMonth() !== month) {
    return new Date(year, month + 1, 0);
  }
  return date;
}

/**
 * Generates all due dates from joining date to a target end date (inclusive)
 * Each due date is strictly after joiningDate.
 */
function getDueDates(joiningDate, feeCycleType, dueDay, endDate = new Date()) {
  const dueDates = [];
  const start = new Date(joiningDate);
  const end = new Date(endDate);

  if (start > end) return [];

  if (feeCycleType === 'joining_date') {
    let months = 1;
    let nextDue = addMonths(start, months);
    while (nextDue <= end) {
      dueDates.push(nextDue);
      months++;
      nextDue = addMonths(start, months);
    }
  } else {
    // Fixed monthly date
    let currYear = start.getFullYear();
    let currMonth = start.getMonth();
    const endYear = end.getFullYear();
    const endMonth = end.getMonth();

    // Iterate month by month from joining month to end month
    while (currYear < endYear || (currYear === endYear && currMonth <= endMonth)) {
      const candidate = getFixedDateForMonth(currYear, currMonth, dueDay);
      if (candidate > start && candidate <= end) {
        dueDates.push(candidate);
      }
      currMonth++;
      if (currMonth > 11) {
        currMonth = 0;
        currYear++;
      }
    }
  }
  return dueDates;
}

/**
 * Computes the next due date relative to a target date (usually today)
 */
function getNextDueDate(joiningDate, feeCycleType, dueDay, targetDate = new Date()) {
  const start = new Date(joiningDate);
  const target = new Date(targetDate);

  if (feeCycleType === 'joining_date') {
    let months = 1;
    let nextDue = addMonths(start, months);
    while (nextDue <= target) {
      months++;
      nextDue = addMonths(start, months);
    }
    return nextDue;
  } else {
    let currYear = target.getFullYear();
    let currMonth = target.getMonth();
    let candidate = getFixedDateForMonth(currYear, currMonth, dueDay);

    if (candidate <= target || candidate <= start) {
      // If candidate is in the past or before joining, get next month
      currMonth++;
      if (currMonth > 11) {
        currMonth = 0;
        currYear++;
      }
      candidate = getFixedDateForMonth(currYear, currMonth, dueDay);
    }
    return candidate;
  }
}

/**
 * Calculates complete fee and payment stats for a student
 * @param {Object} student - Mongoose Student object
 * @param {Array} payments - Array of Mongoose Payment objects for this student
 * @param {Date} targetDate - Relative evaluation date (defaults to today)
 */
function calculateFeeDetails(student, payments = [], targetDate = new Date()) {
  const { joiningDate, feeCycleType, dueDay, monthlyFee } = student;
  
  // 1. Total paid
  const totalPaid = payments.reduce((sum, p) => sum + p.amountPaid, 0);

  // 2. Due dates that have passed up to targetDate
  const dueDates = getDueDates(joiningDate, feeCycleType, dueDay, targetDate);
  const monthsElapsed = dueDates.length;
  
  // 3. Total amount due based on elapsed months
  const totalDue = monthsElapsed * monthlyFee;

  // 4. Pending and Advance calculation
  const pendingAmount = Math.max(0, totalDue - totalPaid);
  const advanceAmount = Math.max(0, totalPaid - totalDue);

  // 5. Next due date
  const nextDue = getNextDueDate(joiningDate, feeCycleType, dueDay, targetDate);

  // 6. Status color determination
  // Red (Overdue): Today is past a due date, and pendingAmount > 0
  // Yellow (Due within 3 days): The next due date is within 3 days (0 <= nextDue - today <= 3 days)
  // Green (Paid): All settled (pendingAmount <= 0) and not yellow
  let statusColor = 'green';
  const today = new Date(targetDate);
  today.setHours(0, 0, 0, 0);
  
  const nextDueNoTime = new Date(nextDue);
  nextDueNoTime.setHours(0, 0, 0, 0);

  const diffTime = nextDueNoTime - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (pendingAmount > 0) {
    statusColor = 'red';
  } else if (diffDays >= 0 && diffDays <= 3) {
    statusColor = 'yellow';
  } else {
    statusColor = 'green';
  }

  return {
    totalDue,
    totalPaid,
    pendingAmount,
    advanceAmount,
    monthsElapsed,
    dueDatesCount: monthsElapsed,
    dueDatesList: dueDates,
    nextDueDate: nextDue,
    statusColor
  };
}

module.exports = {
  getDueDates,
  getNextDueDate,
  calculateFeeDetails
};
