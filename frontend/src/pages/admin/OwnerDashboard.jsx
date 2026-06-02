import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import {
  Users, Bed, IndianRupee, AlertTriangle, TrendingUp,
  UserCheck, UserX, Clock, CreditCard, ArrowUpRight
} from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, sub, color, trend }) => (
  <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-all group">
    <div className="flex items-start justify-between mb-3">
      <div className={`p-2.5 rounded-xl ${color} text-white shadow-lg`}>
        <Icon size={20} />
      </div>
      {trend && (
        <span className="flex items-center gap-1 text-xs font-semibold text-emerald-500">
          <ArrowUpRight size={14} />
          {trend}
        </span>
      )}
    </div>
    <p className="text-2xl font-extrabold text-slate-800 dark:text-white">{value}</p>
    <p className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-wider">{label}</p>
    {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
  </div>
);

const OwnerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalStudents: 0, activeStudents: 0, pendingStudents: 0, inactiveStudents: 0,
    totalRooms: 0, occupiedBeds: 0, totalBeds: 0,
    totalCollected: 0, totalDue: 0, recentPayments: [],
    overdueStudents: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentsRes, roomsRes, paymentsRes] = await Promise.all([
          axios.get('/api/students'),
          axios.get('/api/rooms'),
          axios.get('/api/payments')
        ]);

        const students = studentsRes.data?.data || [];
        const rooms = roomsRes.data?.data || [];
        const payments = paymentsRes.data?.data || [];

        const active = students.filter(s => s.status === 'Active');
        const pending = students.filter(s => s.status === 'Pending');
        const inactive = students.filter(s => s.status === 'Inactive');

        const totalBeds = rooms.reduce((sum, r) => sum + (r.totalBeds || 0), 0);
        const occupiedBeds = rooms.reduce((sum, r) => sum + (r.occupiedBeds || 0), 0);

        const totalCollected = payments.reduce((sum, p) => sum + (p.amountPaid || 0), 0);

        // Calculate total due for all active students
        let totalDue = 0;
        const overdueStudents = [];
        active.forEach(s => {
          const joinDate = new Date(s.joiningDate);
          const now = new Date();
          const monthsElapsed = (now.getFullYear() - joinDate.getFullYear()) * 12 + (now.getMonth() - joinDate.getMonth());
          const studentPayments = payments.filter(p => (p.student?._id || p.student) === s._id);
          const studentPaid = studentPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
          const due = Math.max(0, (monthsElapsed * s.monthlyFee) - studentPaid);
          totalDue += due;
          if (due > 0) {
            overdueStudents.push({ ...s, dueAmount: due });
          }
        });

        setStats({
          totalStudents: students.length,
          activeStudents: active.length,
          pendingStudents: pending.length,
          inactiveStudents: inactive.length,
          totalRooms: rooms.length,
          occupiedBeds,
          totalBeds,
          totalCollected,
          totalDue,
          recentPayments: payments.slice(0, 5),
          overdueStudents: overdueStudents.slice(0, 5)
        });
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">
          Welcome back, {user?.name} 👋
        </h1>
        <p className="text-slate-400 text-sm mt-1">Here's an overview of your hostel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Students" value={stats.totalStudents} color="bg-sky-500 shadow-sky-500/30" />
        <StatCard icon={UserCheck} label="Active Students" value={stats.activeStudents} color="bg-emerald-500 shadow-emerald-500/30" />
        <StatCard icon={Clock} label="Pending Approval" value={stats.pendingStudents} color="bg-amber-500 shadow-amber-500/30" />
        <StatCard icon={Bed} label="Room Occupancy" value={`${stats.occupiedBeds}/${stats.totalBeds}`} sub={`${stats.totalRooms} rooms`} color="bg-indigo-500 shadow-indigo-500/30" />
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard icon={IndianRupee} label="Total Collected" value={`₹${stats.totalCollected.toLocaleString()}`} color="bg-emerald-500 shadow-emerald-500/30" />
        <StatCard icon={AlertTriangle} label="Total Due" value={`₹${stats.totalDue.toLocaleString()}`} color="bg-rose-500 shadow-rose-500/30" />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Payments */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-700/50">
            <h2 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <CreditCard size={18} className="text-sky-500" />
              Recent Payments
            </h2>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
            {stats.recentPayments.length === 0 ? (
              <p className="p-5 text-sm text-slate-400 text-center">No payments recorded yet</p>
            ) : (
              stats.recentPayments.map((p, i) => (
                <div key={p._id || i} className="px-5 py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                      {p.student?.name || 'Student'}
                    </p>
                    <p className="text-xs text-slate-400">{new Date(p.paidDate || p.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className="text-sm font-bold text-emerald-500">+₹{p.amount?.toLocaleString()}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Overdue Students */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-700/50">
            <h2 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <AlertTriangle size={18} className="text-rose-500" />
              Students with Dues
            </h2>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
            {stats.overdueStudents.length === 0 ? (
              <p className="p-5 text-sm text-slate-400 text-center">All dues cleared! 🎉</p>
            ) : (
              stats.overdueStudents.map((s, i) => (
                <div key={s._id || i} className="px-5 py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{s.name}</p>
                    <p className="text-xs text-slate-400">Room {s.roomNumber || 'N/A'} • {s.studentId}</p>
                  </div>
                  <span className="text-sm font-bold text-rose-500">₹{s.dueAmount?.toLocaleString()}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;
