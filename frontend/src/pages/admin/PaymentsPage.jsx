import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useToast } from '../../context/ToastContext';
import { CreditCard, Send, Search } from 'lucide-react';

const PaymentsPage = () => {
  const toast = useToast();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ studentId: '', amountPaid: '', paymentMode: 'UPI', transactionId: '', remarks: '' });

  const fetchPayments = async () => {
    try {
      const res = await axios.get('/api/payments');
      setPayments(res.data?.data || []);
    } catch (err) {
      toast.error('Failed to load payment history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPayments(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/payments', form);
      toast.success('Payment recorded successfully');
      setForm({ studentId: '', amountPaid: '', paymentMode: 'UPI', transactionId: '', remarks: '' });
      fetchPayments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not record payment');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Payments</h1>
          <p className="text-slate-500 mt-1">Record new payments and review historical transactions.</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 p-6 shadow-sm overflow-x-auto">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Recent Payments</h2>
          {loading ? (
            <p className="text-slate-500">Loading payments...</p>
          ) : payments.length === 0 ? (
            <p className="text-slate-500">No payments recorded yet.</p>
          ) : (
            <table className="min-w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="text-xs uppercase tracking-wide text-slate-400 border-b border-slate-200 dark:border-slate-700/50">
                <tr>
                  <th className="px-4 py-3">Student ID</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Mode</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700/50">
                {payments.map((payment) => (
                  <tr key={payment._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-4 py-3">{payment.studentId}</td>
                    <td className="px-4 py-3">₹{payment.amountPaid.toLocaleString()}</td>
                    <td className="px-4 py-3">{payment.paymentMode}</td>
                    <td className="px-4 py-3">{new Date(payment.paymentDate).toLocaleDateString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Add Payment</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Student ID</label>
              <input className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-sm text-slate-900 dark:text-white" value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Amount Paid</label>
              <input type="number" min="1" className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-sm text-slate-900 dark:text-white" value={form.amountPaid} onChange={(e) => setForm({ ...form, amountPaid: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Payment Mode</label>
              <select className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-sm text-slate-900 dark:text-white" value={form.paymentMode} onChange={(e) => setForm({ ...form, paymentMode: e.target.value })}>
                <option value="UPI">UPI</option>
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Card">Card</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Transaction ID</label>
              <input className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-sm text-slate-900 dark:text-white" value={form.transactionId} onChange={(e) => setForm({ ...form, transactionId: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Remarks</label>
              <textarea className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-sm text-slate-900 dark:text-white" rows="3" value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} />
            </div>
            <button className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-500 text-white px-4 py-3 font-semibold hover:bg-sky-600 transition-colors">
              <Send size={16} /> Record Payment
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PaymentsPage;
