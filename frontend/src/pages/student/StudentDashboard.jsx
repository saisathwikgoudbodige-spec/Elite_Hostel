import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { CreditCard, Users, Clock, Bell, ArrowUpRight } from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [student, setStudent] = useState(null);
  const [feeDetails, setFeeDetails] = useState(null);
  const [payments, setPayments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStudent = async () => {
      if (!user?._id) return;
      try {
        const [studentRes, paymentsRes, notificationsRes] = await Promise.all([
          axios.get(`/api/students/${user._id}`),
          axios.get(`/api/payments/student/${user._id}`),
          axios.get('/api/notifications/student')
        ]);

        setStudent(studentRes.data?.data || null);
        setFeeDetails(studentRes.data?.feeDetails || null);
        setPayments(paymentsRes.data?.data || []);
        setNotifications(notificationsRes.data?.data || []);
      } catch (err) {
        console.error('Failed to load student dashboard', err);
      } finally {
        setLoading(false);
      }
    };
    loadStudent();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">Unable to load your dashboard. Please refresh or contact the administrator.</p>
      </div>
    );
  }

  const nextDueDate = feeDetails?.nextDueDate ? new Date(feeDetails.nextDueDate) : null;
  const today = new Date();
  const daysUntilDue = nextDueDate ? Math.ceil((nextDueDate - today) / (1000 * 60 * 60 * 24)) : null;
  const dueColorClass = feeDetails?.pendingAmount > 0 && daysUntilDue !== null && daysUntilDue <= 3 ? 'text-rose-600' : 'text-emerald-600';
  const balanceText = feeDetails?.pendingAmount > 0
    ? `₹${feeDetails.pendingAmount.toLocaleString()}`
    : feeDetails?.advanceAmount > 0
      ? `Advance ₹${feeDetails.advanceAmount.toLocaleString()}`
      : "You're up to date!";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Welcome back, {student.name}</h1>
          <p className="text-slate-500 mt-1">Your current hostel fee status, recent payments, and notifications are shown below.</p>
        </div>
        <Link
          to="payments/submit"
          className="inline-flex items-center gap-2 rounded-3xl bg-sky-500 px-4 py-3 text-sm font-semibold text-white hover:bg-sky-600"
        >
          Submit Payment
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 p-6 shadow-sm">
          <div className="flex items-center gap-3 text-sky-500"><CreditCard size={20} /></div>
          <p className="text-xs uppercase tracking-wider text-slate-400 mt-4">Monthly Fee</p>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white">₹{student.monthlyFee?.toLocaleString()}</p>
        </div>
        <div className="rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 p-6 shadow-sm">
          <div className="flex items-center gap-3 text-emerald-500"><Users size={20} /></div>
          <p className="text-xs uppercase tracking-wider text-slate-400 mt-4">Status</p>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{student.status}</p>
        </div>
        <div className="rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 p-6 shadow-sm">
          <div className="flex items-center gap-3 text-amber-500"><Clock size={20} /></div>
          <p className="text-xs uppercase tracking-wider text-slate-400 mt-4">Next Due Date</p>
          <p className={`text-3xl font-extrabold ${dueColorClass}`}>{nextDueDate ? nextDueDate.toLocaleDateString('en-IN') : 'N/A'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Outstanding Balance</h2>
            <span className="text-sm text-slate-500 dark:text-slate-400">{feeDetails?.monthsElapsed || 0} months since joining</span>
          </div>
          <div className="space-y-3 text-slate-600 dark:text-slate-300">
            <div className="flex justify-between">
              <span>Total due</span>
              <strong>₹{(feeDetails?.totalDue || 0).toLocaleString()}</strong>
            </div>
            <div className="flex justify-between">
              <span>Total paid</span>
              <strong>₹{(feeDetails?.totalPaid || 0).toLocaleString()}</strong>
            </div>
            <div className="flex justify-between">
              <span>Balance due</span>
              <strong>₹{(feeDetails?.pendingAmount || 0).toLocaleString()}</strong>
            </div>
            <div className="flex justify-between">
              <span>Advance</span>
              <strong>₹{(feeDetails?.advanceAmount || 0).toLocaleString()}</strong>
            </div>
          </div>
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">{balanceText}</p>
        </div>

        <div className="rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Notifications</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Messages and reminders from your owner.</p>
            </div>
            <Bell className="text-slate-400" />
          </div>
          {notifications.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">No notifications yet.</p>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div key={notification._id} className="rounded-3xl bg-slate-50 dark:bg-slate-900/60 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm text-slate-700 dark:text-slate-100">{notification.message}</p>
                    <span className="text-[11px] uppercase tracking-wide text-slate-400">{new Date(notification.createdAt).toLocaleDateString('en-IN')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Payment History</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Recent submissions and their review status.</p>
          </div>
          <Link to="payments/submit" className="text-sky-600 hover:underline text-sm">Submit another</Link>
        </div>
        {payments.length === 0 ? (
          <p className="text-sm text-slate-500">No payments yet.</p>
        ) : (
          <div className="space-y-3">
            {payments.map((payment) => (
              <div key={payment._id} className="rounded-3xl bg-slate-50 dark:bg-slate-900 p-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">₹{payment.amountPaid.toLocaleString()}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{payment.paymentMode} • {new Date(payment.paymentDate).toLocaleDateString('en-IN')}</p>
                  </div>
                  <span className="rounded-full bg-slate-100 dark:bg-slate-700/60 px-3 py-1 text-xs text-slate-600 dark:text-slate-300">
                    {payment.status === 'approved' ? 'Approved ✓' : payment.status === 'declined' ? 'Declined ✗' : 'Pending review'}
                  </span>
                </div>
                {payment.screenshotUrl && (
                  <Link to={payment.screenshotUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 text-sky-600 hover:underline text-sm">
                    <ArrowUpRight size={14} /> View screenshot
                  </Link>
                )}
                {payment.status === 'declined' && payment.declineReason && (
                  <p className="mt-2 text-sm text-rose-500">Reason: {payment.declineReason}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
