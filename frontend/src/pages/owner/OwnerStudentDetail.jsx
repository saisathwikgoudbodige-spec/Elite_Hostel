import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, FileText, ImageIcon, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

const statusBadge = (status) => {
  const mapping = {
    approved: 'bg-emerald-100 text-emerald-700',
    pending: 'bg-amber-100 text-amber-700',
    declined: 'bg-rose-100 text-rose-700'
  };
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${mapping[status] || mapping.pending}`}>
      {status === 'approved' ? 'Approved' : status === 'declined' ? 'Declined' : 'Pending review'}
    </span>
  );
};

const OwnerStudentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStudent = async () => {
      try {
        const res = await axios.get(`/api/students/${id}`);
        setStudent(res.data?.data || null);
      } catch (err) {
        console.error('Failed to load student:', err);
      } finally {
        setLoading(false);
      }
    };
    loadStudent();
  }, [id]);

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
        <p className="text-slate-500">Student not found or could not be loaded.</p>
      </div>
    );
  }

  const feeDetails = student.feeDetails || {};
  const balanceDue = feeDetails.pendingAmount || 0;
  const advanceAmount = feeDetails.advanceAmount || 0;
  const totalDue = feeDetails.totalDue || 0;
  const totalPaid = feeDetails.totalPaid || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/owner/dashboard')}
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
        >
          <ArrowLeft size={18} /> Back
        </button>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">{student.name}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Student ID: {student.studentId}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 p-6 shadow-sm">
          <div className="flex flex-col items-center gap-4 text-center">
            <img
              className="h-32 w-32 rounded-full object-cover"
              src={student.photo || 'https://via.placeholder.com/150'}
              alt={student.name}
            />
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wider text-slate-400">Room Number</p>
              <p className="text-xl font-semibold text-slate-900 dark:text-white">{student.roomNumber || 'Not assigned'}</p>
            </div>
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wider text-slate-400">Fee Cycle</p>
              <p className="text-sm text-slate-700 dark:text-slate-300">
                {student.feeCycleType === 'joining_date' ? 'From joining date' : `Fixed day ${student.dueDay}`}
              </p>
            </div>
            <div className="rounded-3xl bg-slate-50 dark:bg-slate-900/60 p-4">
              <p className="text-xs uppercase tracking-wider text-slate-400">Status</p>
              <p className="mt-2 text-lg font-bold text-slate-900 dark:text-white">{student.status}</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Student Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600 dark:text-slate-300">
            {[
              ['Full name', student.name],
              ['Room number', student.roomNumber || '—'],
              ['Course', student.course],
              ['Branch', student.branch],
              ['College', student.college],
              ['Phone', student.phone],
              ['Guardian', student.parentOrGuardianName],
              ['Guardian phone', student.parentPhone],
              ['Aadhaar', student.aadhaarNumber || '—'],
              ['Joining date', student.joiningDate ? new Date(student.joiningDate).toLocaleDateString('en-IN') : '—'],
              ['Monthly fee', `₹${student.monthlyFee?.toLocaleString()}`],
              ['Security deposit', `₹${student.securityDeposit?.toLocaleString()}`],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl bg-slate-50 dark:bg-slate-900/60 p-4">
                <p className="text-[10px] uppercase tracking-wide text-slate-400">{label}</p>
                <p className="mt-2 font-semibold text-slate-800 dark:text-slate-100">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Outstanding Balance</p>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white">₹{balanceDue.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">Months since joining</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{feeDetails.monthsElapsed || 0}</p>
            </div>
          </div>
          <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
            <div className="flex items-center justify-between">
              <span>Total due</span>
              <strong>₹{totalDue.toLocaleString()}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span>Total paid</span>
              <strong>₹{totalPaid.toLocaleString()}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span>Balance due</span>
              <strong>₹{balanceDue.toLocaleString()}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span>Advance</span>
              <strong>₹{advanceAmount.toLocaleString()}</strong>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Payment History</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">All payments recorded for this student.</p>
            </div>
            <div className="rounded-full bg-slate-100 dark:bg-slate-900/60 px-3 py-1 text-xs font-semibold text-slate-500">{student.payments?.length || 0} records</div>
          </div>
          {student.payments?.length === 0 ? (
            <div className="rounded-3xl bg-slate-50 dark:bg-slate-900/60 p-8 text-center text-slate-500">No payments yet.</div>
          ) : (
            <div className="space-y-3">
              {student.payments.map((payment) => (
                <div key={payment._id} className="rounded-3xl bg-slate-50 dark:bg-slate-900/60 p-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">₹{payment.amountPaid.toLocaleString()}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{new Date(payment.paymentDate).toLocaleDateString('en-IN')}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                      <span>{payment.paymentMode}</span>
                      <span>{statusBadge(payment.status)}</span>
                      <span>Txn: {payment.transactionId || 'N/A'}</span>
                    </div>
                  </div>
                  {payment.screenshotUrl && (
                    <div className="mt-3">
                      <a href={payment.screenshotUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sky-600 hover:underline text-sm">
                        <ImageIcon size={16} /> View screenshot
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OwnerStudentDetail;
