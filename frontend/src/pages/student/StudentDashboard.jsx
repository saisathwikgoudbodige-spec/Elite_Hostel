import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { CreditCard, Users, Clock, FileText } from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [student, setStudent] = useState(null);
  const [feeDetails, setFeeDetails] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStudent = async () => {
      if (!user?._id) return;
      try {
        const [studentRes, paymentsRes] = await Promise.all([
          axios.get(`/api/students/${user._id}`),
          axios.get(`/api/payments/student/${user._id}`)
        ]);
        setStudent(studentRes.data?.data || null);
        setFeeDetails(studentRes.data?.feeDetails || null);
        setPayments(paymentsRes.data?.data || []);
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Welcome back, {student.name}</h1>
          <p className="text-slate-500 mt-1">Your current hostel fee status and recent payments are shown below.</p>
        </div>
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
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{feeDetails?.nextDueDate ? new Date(feeDetails.nextDueDate).toLocaleDateString('en-IN') : 'N/A'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Student Summary</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm text-slate-600 dark:text-slate-300">
            <div>
              <p className="font-semibold text-slate-700 dark:text-white">Room</p>
              <p>{student.roomNumber || 'Not assigned yet'}</p>
            </div>
            <div>
              <p className="font-semibold text-slate-700 dark:text-white">Joined</p>
              <p>{student.joiningDate ? new Date(student.joiningDate).toLocaleDateString('en-IN') : '—'}</p>
            </div>
            <div>
              <p className="font-semibold text-slate-700 dark:text-white">Course</p>
              <p>{student.course} / {student.branch}</p>
            </div>
            <div>
              <p className="font-semibold text-slate-700 dark:text-white">Guardian</p>
              <p>{student.parentOrGuardianName}</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Payment History</h2>
          </div>
          {payments.length === 0 ? (
            <p className="text-sm text-slate-500">No payments found yet.</p>
          ) : (
            <div className="space-y-3">
              {payments.slice(0, 5).map((payment) => (
                <div key={payment._id} className="rounded-2xl bg-slate-50 dark:bg-slate-900 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-white">₹{payment.amountPaid.toLocaleString()}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{payment.paymentMode} • {new Date(payment.paymentDate).toLocaleDateString('en-IN')}</p>
                    </div>
                    <p className="text-xs text-slate-400">Txn: {payment.transactionId || 'N/A'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
