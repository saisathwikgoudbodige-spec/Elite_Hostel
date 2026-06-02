import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useToast } from '../../context/ToastContext';
import { Bell, Send, MessageSquare } from 'lucide-react';

const NotificationsPage = () => {
  const toast = useToast();
  const [reminders, setReminders] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [remRes, logRes] = await Promise.all([
        axios.get('/api/notifications/reminders'),
        axios.get('/api/notifications')
      ]);
      setReminders(remRes.data?.data || []);
      setLogs(logRes.data?.data || []);
    } catch (err) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSend = async (studentId, type) => {
    try {
      await axios.post('/api/notifications/send', { studentId, type });
      toast.success('Reminder sent successfully');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reminder');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Notifications</h1>
          <p className="text-slate-500 mt-1">Send fee reminders and view sent notification logs.</p>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-500">Loading notification data...</div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4 text-sky-500"><Bell size={22} /></div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Students Needing Reminders</h2>
            {reminders.length === 0 ? (
              <div className="text-slate-500">No outstanding dues at the moment.</div>
            ) : (
              <div className="space-y-3">
                {reminders.map((student) => (
                  <div key={student._id} className="rounded-3xl bg-slate-50 dark:bg-slate-900 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{student.name}</p>
                        <p className="text-sm text-slate-500">{student.studentId} • Room {student.roomNumber || 'N/A'}</p>
                        <p className="text-sm text-slate-500">Due: ₹{student.pendingAmount.toLocaleString()}</p>
                      </div>
                      <button onClick={() => handleSend(student._id, 'WhatsApp')} className="inline-flex items-center gap-2 rounded-2xl bg-sky-500 text-white px-3 py-2 text-xs font-semibold hover:bg-sky-600 transition-colors">
                        <Send size={14} /> Send
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4 text-emerald-500"><MessageSquare size={22} /></div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Notification Log</h2>
            {logs.length === 0 ? (
              <div className="text-slate-500">No notifications have been logged yet.</div>
            ) : (
              <div className="space-y-3">
                {logs.slice(0, 8).map((log) => (
                  <div key={log._id} className="rounded-3xl bg-slate-50 dark:bg-slate-900 p-4">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{log.recipientName}</p>
                    <p className="text-sm text-slate-500">{log.type} • {new Date(log.sentDate).toLocaleDateString('en-IN')}</p>
                    <p className="text-sm text-slate-500 mt-2">{log.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
