import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../../context/ToastContext';
import {
  Search, UserCheck, UserX, Eye, Trash2, Filter, X, User
} from 'lucide-react';

const StudentsPage = () => {
  const toast = useToast();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedStudent, setSelectedStudent] = useState(null);

  const fetchStudents = async () => {
    try {
      const res = await axios.get('/api/students');
      setStudents(res.data?.data || []);
    } catch (err) {
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStudents(); }, []);

  const handleApprove = async (id) => {
    try {
      await axios.put(`/api/students/${id}/approve`);
      toast.success('Student approved');
      fetchStudents();
      setSelectedStudent(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve');
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.put(`/api/students/${id}/reject`);
      toast.success('Student rejected/deactivated');
      fetchStudents();
      setSelectedStudent(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;
    try {
      await axios.delete(`/api/students/${id}`);
      toast.success('Student deleted');
      fetchStudents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  const filtered = students.filter(s => {
    const matchSearch = s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.studentId?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statusBadge = (status) => {
    const cls = {
      Active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      Pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      Inactive: 'bg-slate-100 text-slate-600 dark:bg-slate-700/50 dark:text-slate-400',
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${cls[status] || cls.Inactive}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">Students</h1>
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 sm:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 transition-colors"
              placeholder="Search name, ID, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {/* Filter */}
          <select
            className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-white focus:outline-none focus:border-sky-500 transition-colors"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Pending">Pending</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr>
                {['ID', 'Name', 'Email', 'Phone', 'Room', 'Fee/Mo', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-sm text-slate-400">No students found</td>
                </tr>
              ) : (
                filtered.map(s => (
                  <tr key={s._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors">
                    <td className="px-4 py-3 text-sm font-mono text-slate-600 dark:text-slate-300">{s.studentId}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-slate-800 dark:text-white">{s.name}</td>
                    <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">{s.email}</td>
                    <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">{s.phone}</td>
                    <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">{s.roomNumber || '—'}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200">₹{s.monthlyFee?.toLocaleString()}</td>
                    <td className="px-4 py-3">{statusBadge(s.status)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => setSelectedStudent(s)} className="p-2 rounded-lg hover:bg-sky-50 dark:hover:bg-sky-900/20 text-sky-500 transition-colors" title="View Details">
                          <Eye size={16} />
                        </button>
                        {s.status === 'Pending' && (
                          <button onClick={() => handleApprove(s._id)} className="p-2 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-emerald-500 transition-colors" title="Approve">
                            <UserCheck size={16} />
                          </button>
                        )}
                        {s.status !== 'Inactive' && (
                          <button onClick={() => handleReject(s._id)} className="p-2 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 text-amber-500 transition-colors" title="Deactivate">
                            <UserX size={16} />
                          </button>
                        )}
                        <button onClick={() => handleDelete(s._id)} className="p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 text-rose-500 transition-colors" title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Detail Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" onClick={() => setSelectedStudent(null)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto border border-slate-200 dark:border-slate-700" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-sky-100 dark:bg-sky-900/30 text-sky-600">
                  <User size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800 dark:text-white">{selectedStudent.name}</h2>
                  <p className="text-xs text-slate-400">{selectedStudent.studentId}</p>
                </div>
              </div>
              <button onClick={() => setSelectedStudent(null)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <X size={18} className="text-slate-400" />
              </button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-3">
              {[
                ['Status', selectedStudent.status],
                ['Email', selectedStudent.email],
                ['Phone', selectedStudent.phone],
                ['Gender', selectedStudent.gender],
                ['DOB', selectedStudent.dateOfBirth ? new Date(selectedStudent.dateOfBirth).toLocaleDateString() : '—'],
                ['Aadhaar', selectedStudent.aadhaarNumber || '—'],
                ['Guardian', `${selectedStudent.parentOrGuardianName} (${selectedStudent.guardianRelationship})`],
                ['Guardian Ph', selectedStudent.parentPhone],
                ['College', selectedStudent.college],
                ['Course', `${selectedStudent.course} - ${selectedStudent.branch}`],
                ['Year', selectedStudent.yearOfStudy],
                ['Address', selectedStudent.address],
                ['Room', selectedStudent.roomNumber || 'Not assigned'],
                ['Monthly Fee', `₹${selectedStudent.monthlyFee?.toLocaleString()}`],
                ['Security Dep.', `₹${selectedStudent.securityDeposit?.toLocaleString()}`],
                ['Joining Date', selectedStudent.joiningDate ? new Date(selectedStudent.joiningDate).toLocaleDateString() : '—'],
                ['Fee Cycle', selectedStudent.feeCycleType === 'joining_date' ? 'From Joining Date' : `Fixed Day ${selectedStudent.dueDay}`],
              ].map(([label, val]) => (
                <div key={label} className="bg-slate-50 dark:bg-slate-700/30 rounded-lg px-3 py-2">
                  <p className="text-[10px] uppercase text-slate-400 font-bold">{label}</p>
                  <p className="text-sm text-slate-700 dark:text-slate-200 truncate">{val}</p>
                </div>
              ))}
            </div>
            {selectedStudent.status === 'Pending' && (
              <div className="p-6 border-t border-slate-100 dark:border-slate-700/50 flex gap-3">
                <button onClick={() => handleApprove(selectedStudent._id)} className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm transition-all">Approve</button>
                <button onClick={() => handleReject(selectedStudent._id)} className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-semibold text-sm transition-all">Reject</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentsPage;
