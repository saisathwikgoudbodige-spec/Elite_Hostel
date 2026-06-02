import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useToast } from '../../context/ToastContext';
import { IndianRupee, Plus, Trash2 } from 'lucide-react';

const ExpensesPage = () => {
  const toast = useToast();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', amount: '', category: '', date: '', remarks: '' });

  const fetchExpenses = async () => {
    try {
      const res = await axios.get('/api/expenses');
      setExpenses(res.data?.data || []);
    } catch (err) {
      toast.error('Unable to load expenses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchExpenses(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/expenses', form);
      toast.success('Expense added');
      setForm({ title: '', amount: '', category: '', date: '', remarks: '' });
      fetchExpenses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add expense');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense?')) return;
    try {
      await axios.delete(`/api/expenses/${id}`);
      toast.success('Expense removed');
      fetchExpenses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to delete expense');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Expense Tracker</h1>
          <p className="text-slate-500 mt-1">Track hostel expenses, categories, and summaries.</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 p-6 shadow-sm overflow-x-auto">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Expense Records</h2>
          {loading ? (
            <p className="text-slate-500">Loading expenses...</p>
          ) : expenses.length === 0 ? (
            <p className="text-slate-500">No expense records found.</p>
          ) : (
            <table className="min-w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="text-xs uppercase tracking-wide text-slate-400 border-b border-slate-200 dark:border-slate-700/50">
                <tr>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700/50">
                {expenses.map((expense) => (
                  <tr key={expense._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-4 py-3">{expense.title}</td>
                    <td className="px-4 py-3">{expense.category}</td>
                    <td className="px-4 py-3">₹{expense.amount.toLocaleString()}</td>
                    <td className="px-4 py-3">{new Date(expense.date).toLocaleDateString('en-IN')}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleDelete(expense._id)} className="text-rose-500 hover:text-rose-700 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Add Expense</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Title</label>
              <input className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-sm text-slate-900 dark:text-white" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Category</label>
              <input className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-sm text-slate-900 dark:text-white" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Amount</label>
              <input type="number" min="1" className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-sm text-slate-900 dark:text-white" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Date</label>
              <input type="date" className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-sm text-slate-900 dark:text-white" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Remarks</label>
              <textarea className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-sm text-slate-900 dark:text-white" rows="3" value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} />
            </div>
            <button className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 text-white px-4 py-3 font-semibold hover:bg-emerald-600 transition-colors">
              <Plus size={16} /> Add Expense
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ExpensesPage;
