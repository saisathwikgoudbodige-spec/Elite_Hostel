import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useToast } from '../../context/ToastContext';
import { CheckCircle2, XCircle, ImageIcon } from 'lucide-react';

const OwnerPaymentRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reasons, setReasons] = useState({});
  const [actionLoading, setActionLoading] = useState(null);
  const toast = useToast();

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/payments/requests');
      setRequests(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load payment requests', err);
      toast.error('Unable to load pending payment requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      await axios.patch(`/api/payments/${id}/approve`);
      toast.success('Payment approved');
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve payment');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDecline = async (id) => {
    setActionLoading(id);
    try {
      await axios.patch(`/api/payments/${id}/decline`, { reason: reasons[id] || 'Declined by owner' });
      toast.success('Payment declined');
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to decline payment');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Payment Requests</h1>
        <p className="text-slate-500 mt-1">Review all pending payment submissions and approve or decline them.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : requests.length === 0 ? (
        <div className="rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 p-8 text-center text-slate-500">
          No payment requests pending review.
        </div>
      ) : (
        <div className="grid gap-4">
          {requests.map((payment) => {
            const student = payment.student || {};
            return (
              <div key={payment._id} className="rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 p-6 shadow-sm">
                <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={student.photo || 'https://via.placeholder.com/70'}
                      alt={student.name}
                      className="h-16 w-16 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-lg font-semibold text-slate-900 dark:text-white">{student.name || 'Student'}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Room {student.roomNumber || 'N/A'}</p>
                      <p className="text-sm text-slate-400">Student ID: {student.studentId || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3 items-center text-sm text-slate-500 dark:text-slate-400">
                    <span className="px-3 py-2 rounded-2xl bg-slate-100 dark:bg-slate-900/60">Mode: {payment.paymentMode}</span>
                    <span className="px-3 py-2 rounded-2xl bg-slate-100 dark:bg-slate-900/60">Amount: ₹{payment.amountPaid?.toLocaleString()}</span>
                    <span className="px-3 py-2 rounded-2xl bg-slate-100 dark:bg-slate-900/60">Date: {new Date(payment.paymentDate).toLocaleDateString('en-IN')}</span>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Transaction ID</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{payment.transactionId || 'N/A'}</p>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Remarks</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{payment.remarks || 'No remarks provided'}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Screenshot</p>
                    {payment.screenshotUrl ? (
                      <a href={payment.screenshotUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sky-600 hover:underline">
                        <ImageIcon size={16} /> View screenshot
                      </a>
                    ) : (
                      <p className="text-sm text-slate-500 dark:text-slate-400">No screenshot provided.</p>
                    )}
                  </div>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-[1fr_auto] items-end">
                  <textarea
                    rows={2}
                    placeholder="Decline reason (optional)"
                    value={reasons[payment._id] || ''}
                    onChange={(e) => setReasons((prev) => ({ ...prev, [payment._id]: e.target.value }))}
                    className="w-full rounded-3xl border border-slate-200 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-900/60 p-4 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleApprove(payment._id)}
                      disabled={actionLoading === payment._id}
                      className="inline-flex items-center gap-2 rounded-3xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-50"
                    >
                      <CheckCircle2 size={16} /> Approve
                    </button>
                    <button
                      onClick={() => handleDecline(payment._id)}
                      disabled={actionLoading === payment._id}
                      className="inline-flex items-center gap-2 rounded-3xl bg-rose-500 px-4 py-3 text-sm font-semibold text-white hover:bg-rose-600 disabled:opacity-50"
                    >
                      <XCircle size={16} /> Decline
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OwnerPaymentRequests;
