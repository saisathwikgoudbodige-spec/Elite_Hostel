import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useToast } from '../../context/ToastContext';
import { FileText, Download, CalendarDays } from 'lucide-react';

const ReportsPage = () => {
  const toast = useToast();
  const [daily, setDaily] = useState(null);
  const [monthly, setMonthly] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      const [dailyRes, monthlyRes] = await Promise.all([
        axios.get('/api/reports/daily'),
        axios.get('/api/reports/monthly')
      ]);
      setDaily(dailyRes.data?.data || null);
      setMonthly(monthlyRes.data?.data || null);
    } catch (err) {
      toast.error('Unable to load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReports(); }, []);

  const downloadReport = (type, format) => {
    window.open(`/api/reports/export?type=${type}&format=${format}`, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Reports</h1>
          <p className="text-slate-500 mt-1">View daily and monthly collections, pending dues, and export reports.</p>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-500">Loading report data...</div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Daily Report</h2>
                <p className="text-sm text-slate-500">Payments collected today</p>
              </div>
              <button onClick={() => downloadReport('daily', 'csv')} className="inline-flex items-center gap-2 rounded-2xl bg-sky-500 text-white px-4 py-2 text-sm hover:bg-sky-600 transition-colors">
                <Download size={16} /> CSV
              </button>
            </div>
            {daily ? (
              <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                <p>Total Payments: <strong>{daily.count}</strong></p>
                <p>Total Collected: <strong>₹{daily.totalCollected.toLocaleString()}</strong></p>
              </div>
            ) : (
              <p className="text-slate-500">No daily report available.</p>
            )}
          </div>

          <div className="rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Monthly Report</h2>
                <p className="text-sm text-slate-500">Current monthly overview</p>
              </div>
              <button onClick={() => downloadReport('monthly', 'csv')} className="inline-flex items-center gap-2 rounded-2xl bg-sky-500 text-white px-4 py-2 text-sm hover:bg-sky-600 transition-colors">
                <Download size={16} /> CSV
              </button>
            </div>
            {monthly ? (
              <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                <p>Active Students: <strong>{monthly.activeStudents}</strong></p>
                <p>Paid Students: <strong>{monthly.paidStudents}</strong></p>
                <p>Unpaid Students: <strong>{monthly.unpaidStudents}</strong></p>
                <p>Total Collected: <strong>₹{monthly.totalCollected.toLocaleString()}</strong></p>
                <p>Pending Dues: <strong>₹{monthly.totalDuesPending.toLocaleString()}</strong></p>
              </div>
            ) : (
              <p className="text-slate-500">No monthly report available.</p>
            )}
          </div>

          <div className="rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 p-6 shadow-sm xl:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Export Options</h2>
                <p className="text-sm text-slate-500">Download detailed fee and student reports.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => downloadReport('daily', 'pdf')} className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 text-white px-4 py-2 text-sm hover:bg-slate-700 transition-colors">
                  <FileText size={16} /> Daily PDF
                </button>
                <button onClick={() => downloadReport('monthly', 'pdf')} className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 text-white px-4 py-2 text-sm hover:bg-slate-700 transition-colors">
                  <FileText size={16} /> Monthly PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
