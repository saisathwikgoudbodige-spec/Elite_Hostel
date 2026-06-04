import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useNavigate } from 'react-router-dom';

const paymentMethods = ['Cash', 'UPI', 'Bank Transfer', 'Card'];

const SubmitPayment = () => {
  const { user } = useAuth();
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));
  const [transactionId, setTransactionId] = useState('');
  const [remarks, setRemarks] = useState('');
  const [screenshot, setScreenshot] = useState(null);
  const [preview, setPreview] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Only JPG, PNG, or WEBP images are allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be 5MB or less.');
      return;
    }
    setError('');
    setScreenshot(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!amount || Number(amount) <= 0) {
      setError('Please enter a valid amount.');
      return;
    }
    if (!paymentDate) {
      setError('Please select the payment date.');
      return;
    }
    if (paymentMode === 'UPI' && !screenshot) {
      setError('Please upload a UPI transaction screenshot.');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('studentId', user.studentId || '');
      formData.append('amount', amount);
      formData.append('paymentMode', paymentMode);
      formData.append('paymentDate', paymentDate);
      formData.append('transactionId', transactionId);
      formData.append('remarks', remarks);
      if (screenshot) {
        formData.append('screenshot', screenshot);
      }

      await axios.post('/api/payments/submit', formData);
      toast.success('Payment submitted for review');
      setSubmitted(true);
      setAmount('');
      setTransactionId('');
      setRemarks('');
      setScreenshot(null);
      setPreview('');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit payment.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-3xl mx-auto p-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700/50 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Payment submitted!</h1>
        <p className="text-slate-500 mt-3">Your payment has been sent to the owner for review. It will appear in your payment history as pending until approved.</p>
        <button
          onClick={() => {
            setSubmitted(false);
            navigate('/student/dashboard');
          }}
          className="mt-6 rounded-3xl bg-sky-500 px-5 py-3 text-white font-semibold hover:bg-sky-600"
        >
          Submit another payment
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Submit Payment</h1>
        <p className="text-slate-500 mt-1">Send a payment request and upload supporting UPI evidence when required.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-3xl p-6 shadow-sm">
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Payment Mode</label>
          <div className="grid grid-cols-2 gap-3">
            {paymentMethods.map((mode) => (
              <button
                type="button"
                key={mode}
                onClick={() => setPaymentMode(mode)}
                className={`rounded-3xl border px-4 py-3 text-sm font-semibold transition ${paymentMode === mode ? 'bg-sky-500 border-sky-500 text-white' : 'bg-slate-100 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'}`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Amount paid (₹)</label>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              type="number"
              min="0"
              className="w-full rounded-3xl border border-slate-200 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-900/60 px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Date of payment</label>
            <input
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              type="date"
              className="w-full rounded-3xl border border-slate-200 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-900/60 px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        {(paymentMode === 'UPI' || paymentMode === 'Bank Transfer' || paymentMode === 'Card') && (
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">Transaction ID / UTR number</label>
            <input
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              type="text"
              className="w-full rounded-3xl border border-slate-200 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-900/60 px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="Enter transaction ID"
            />
          </div>
        )}

        {paymentMode === 'UPI' && (
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">Upload UPI transaction screenshot</label>
            <label className="flex min-h-[160px] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-900/60 p-6 text-center cursor-pointer transition hover:border-sky-500">
              <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              <p className="text-sm text-slate-500 dark:text-slate-400">Drag & drop or click to upload</p>
              <p className="text-xs text-slate-400">JPG, PNG, WEBP only • max 5MB</p>
            </label>
            {preview && (
              <img src={preview} alt="Preview" className="rounded-3xl border border-slate-200 dark:border-slate-700/50 mt-2 max-h-48 object-contain" />
            )}
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Remarks (optional)</label>
          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            rows={4}
            className="w-full rounded-3xl border border-slate-200 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-900/60 px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            placeholder="Anything the owner should know"
          />
        </div>

        {error && <p className="text-sm text-rose-500">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center rounded-3xl bg-sky-500 px-6 py-3 text-sm font-semibold text-white hover:bg-sky-600 disabled:opacity-70"
        >
          {loading ? 'Submitting...' : 'Submit for Approval'}
        </button>
      </form>
    </div>
  );
};

export default SubmitPayment;
