import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Users, DollarSign, Clock, CheckCircle2, AlertTriangle, TrendUp, Eye } from 'lucide-react';

const statusBadge = (statusColor) => {
  if (statusColor === 'green') return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">Paid</span>;
  if (statusColor === 'yellow') return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">Due soon</span>;
  return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-700">Overdue</span>;
};

const OwnerDashboard = () => {
  const [students, setStudents] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [studentsRes, paymentsRes] = await Promise.all([
          axios.get('/api/students'),
          axios.get('/api/payments')
        ]);

        setStudents(studentsRes.data.data || []);
        setPayments(paymentsRes.data.data || []);
      } catch (err) {
        console.error('Failed to load owner dashboard', err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  const activeStudents = students.filter((student) => student.status === 'Active');
  const now = new Date();

  const totalPaidThisMonth = payments
    .filter((payment) => payment.status === 'approved')
    .filter((payment) => {
      const paidDate = new Date(payment.paymentDate);
      return paidDate.getFullYear() === now.getFullYear() && paidDate.getMonth() === now.getMonth();
    })
    .reduce((sum, payment) => sum + (payment.amountPaid || 0), 0);

  const totalPendingCollection = activeStudents.reduce((sum, student) => {
    const pending = student.feeDetails?.pendingAmount || 0;
    return sum + pending;
  }, 0);

  const dueThisMonth = activeStudents.filter((student) => {
    const nextDue = student.feeDetails?.nextDueDate ? new Date(student.feeDetails.nextDueDate) : null;
    const pending = student.feeDetails?.pendingAmount || 0;
    if (!nextDue || pending <= 0) return false;
    const diffDays = Math.ceil((nextDue - now) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7;
  }).length;

  const overdue = activeStudents.filter((student) => {
    const nextDue = student.feeDetails?.nextDueDate ? new Date(student.feeDetails.nextDueDate) : null;
    const pending = student.feeDetails?.pendingAmount || 0;
    return nextDue && pending > 0 && nextDue < now;
  }).length;

  const paidThisMonthCount = activeStudents.filter((student) => (student.feeDetails?.pendingAmount || 0) === 0).length;
  const totalStudents = activeStudents.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Owner Dashboard</h1>
        <p className="text-slate-500 mt-1">Track student payments, dues, and scheduled collections from one place.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <div className="rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="rounded-2xl bg-sky-500 text-white p-3"><Users size={20} /></div>
            <span className="text-xs uppercase tracking-wide text-slate-400">Total Students</span>
          </div>
          <p className="text-4xl font-extrabold text-slate-900 dark:text-white">{totalStudents}</p>
        </div>

        <div className="rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="rounded-2xl bg-emerald-500 text-white p-3"><CheckCircle2 size={20} /></div>
            <span className="text-xs uppercase tracking-wide text-slate-400">Paid This Month</span>
          </div>
          <p className="text-4xl font-extrabold text-slate-900 dark:text-white">{paidThisMonthCount}</p>
        </div>

        <div className="rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="rounded-2xl bg-amber-500 text-white p-3"><Clock size={20} /></div>
            <span className="text-xs uppercase tracking-wide text-slate-400">Due This Month</span>
          </div>
          <p className="text-4xl font-extrabold text-slate-900 dark:text-white">{dueThisMonth}</p>
        </div>

        <div className="rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="rounded-2xl bg-rose-500 text-white p-3"><AlertTriangle size={20} /></div>
            <span className="text-xs uppercase tracking-wide text-slate-400">Overdue</span>
          </div>
          <p className="text-4xl font-extrabold text-slate-900 dark:text-white">{overdue}</p>
        </div>

        <div className="rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="rounded-2xl bg-emerald-500 text-white p-3"><TrendUp size={20} /></div>
            <span className="text-xs uppercase tracking-wide text-slate-400">Total Collected</span>
          </div>
          <p className="text-4xl font-extrabold text-slate-900 dark:text-white">₹{totalPaidThisMonth.toLocaleString()}</p>
        </div>

        <div className="rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="rounded-2xl bg-slate-500 text-white p-3"><DollarSign size={20} /></div>
            <span className="text-xs uppercase tracking-wide text-slate-400">Pending Collection</span>
          </div>
          <p className="text-4xl font-extrabold text-slate-900 dark:text-white">₹{totalPendingCollection.toLocaleString()}</p>
        </div>
      </div>

      <div className="rounded-3xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Student Balances</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Review payments and upcoming due dates by student.</p>
          </div>
          <button
            onClick={() => navigate('/owner/payments/requests')}
            className="rounded-2xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-600"
          >
            Review Pending Payments
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr>
                {['Photo', 'Name', 'Room No', 'Monthly Fee', 'Due Date', 'Amount Due', 'Status', 'Action'].map((label) => (
                  <th key={label} className="px-4 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {students.map((student) => {
                const dueDate = student.feeDetails?.nextDueDate ? new Date(student.feeDetails.nextDueDate).toLocaleDateString('en-IN') : 'N/A';
                const dueAmount = student.feeDetails?.pendingAmount ?? 0;
                return (
                  <tr key={student._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-4 py-4 align-middle">
                      <img
                        src={student.photo || 'https://via.placeholder.com/40'}
                        alt={student.name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    </td>
                    <td className="px-4 py-4 align-middle">
                      <button
                        onClick={() => navigate(`/owner/students/${student._id}`)}
                        className="text-sky-600 hover:underline font-semibold"
                      >
                        {student.name}
                      </button>
                    </td>
                    <td className="px-4 py-4 align-middle text-sm text-slate-600 dark:text-slate-300">{student.roomNumber || 'N/A'}</td>
                    <td className="px-4 py-4 align-middle text-sm font-semibold text-slate-800 dark:text-slate-100">₹{student.monthlyFee?.toLocaleString()}</td>
                    <td className="px-4 py-4 align-middle text-sm text-slate-600 dark:text-slate-300">{dueDate}</td>
                    <td className="px-4 py-4 align-middle text-sm text-slate-800 dark:text-slate-100">₹{dueAmount.toLocaleString()}</td>
                    <td className="px-4 py-4 align-middle">{statusBadge(student.feeDetails?.statusColor)}</td>
                    <td className="px-4 py-4 align-middle">
                      <button
                        onClick={() => navigate(`/owner/students/${student._id}`)}
                        className="rounded-2xl bg-slate-100 dark:bg-slate-700 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;
