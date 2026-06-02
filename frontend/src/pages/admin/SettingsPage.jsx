import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useToast } from '../../context/ToastContext';
import { Settings, Save } from 'lucide-react';

const SettingsPage = () => {
  const toast = useToast();
  const [settings, setSettings] = useState({ hostelName: '', ownerEmail: '', upiId: '', defaultFeeCycleType: 'joining_date', defaultDueDay: 5 });
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const res = await axios.get('/api/settings');
      setSettings(res.data?.data || settings);
    } catch (err) {
      toast.error('Unable to load settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSettings(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put('/api/settings', settings);
      toast.success('Settings updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update settings');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Settings</h1>
          <p className="text-slate-500 mt-1">Update hostel configuration and fee cycle defaults.</p>
        </div>
      </div>

      <div className="rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 p-6 shadow-sm">
        {loading ? (
          <p className="text-slate-500">Loading settings...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Hostel Name</label>
              <input className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-sm text-slate-900 dark:text-white" value={settings.hostelName} onChange={(e) => setSettings((prev) => ({ ...prev, hostelName: e.target.value }))} required />
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Owner Email</label>
                <input type="email" className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-sm text-slate-900 dark:text-white" value={settings.ownerEmail} onChange={(e) => setSettings((prev) => ({ ...prev, ownerEmail: e.target.value }))} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">UPI ID</label>
                <input className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-sm text-slate-900 dark:text-white" value={settings.upiId} onChange={(e) => setSettings((prev) => ({ ...prev, upiId: e.target.value }))} />
              </div>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Default Fee Cycle</label>
                <select className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-sm text-slate-900 dark:text-white" value={settings.defaultFeeCycleType} onChange={(e) => setSettings((prev) => ({ ...prev, defaultFeeCycleType: e.target.value }))}>
                  <option value="joining_date">Joining Date Based</option>
                  <option value="fixed_date">Fixed Monthly Date</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Default Due Day</label>
                <input type="number" min="1" max="31" className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-sm text-slate-900 dark:text-white" value={settings.defaultDueDay} onChange={(e) => setSettings((prev) => ({ ...prev, defaultDueDay: Number(e.target.value) }))} />
              </div>
            </div>
            <button className="inline-flex items-center gap-2 rounded-2xl bg-sky-500 text-white px-6 py-3 font-semibold hover:bg-sky-600 transition-colors">
              <Save size={16} /> Save Settings
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
