import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { User, ShieldCheck, MapPin, Phone, Mail, FileText } from 'lucide-react';

const StudentProfile = () => {
  const { user } = useAuth();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?._id) return;
      try {
        const res = await axios.get(`/api/students/${user._id}`);
        setStudent(res.data?.data || null);
      } catch (err) {
        console.error('Error loading profile', err);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [user]);

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
        <p className="text-slate-500">Cannot load profile data.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">My Profile</h1>
          <p className="text-slate-500 mt-1">Review your profile and guardian details.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 p-6 shadow-sm">
          <div className="flex items-center gap-3 text-sky-500 mb-4"><User size={22} /></div>
          <p className="text-sm text-slate-400 uppercase tracking-wide">Full Name</p>
          <p className="text-lg font-semibold text-slate-900 dark:text-white">{student.name}</p>

          <div className="mt-5 space-y-4 text-sm text-slate-600 dark:text-slate-300">
            <div>
              <p className="font-semibold text-slate-700 dark:text-white">Email</p>
              <p>{student.email}</p>
            </div>
            <div>
              <p className="font-semibold text-slate-700 dark:text-white">Phone</p>
              <p>{student.phone}</p>
            </div>
            <div>
              <p className="font-semibold text-slate-700 dark:text-white">Aadhaar</p>
              <p>{student.aadhaarNumber}</p>
            </div>
            <div>
              <p className="font-semibold text-slate-700 dark:text-white">Status</p>
              <p>{student.status}</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 p-6 shadow-sm">
          <div className="flex items-center gap-3 text-emerald-500 mb-4"><ShieldCheck size={22} /></div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Guardian & Academic Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600 dark:text-slate-300">
            <div className="space-y-2">
              <p className="font-semibold text-slate-700 dark:text-white">Guardian Name</p>
              <p>{student.parentOrGuardianName}</p>
            </div>
            <div className="space-y-2">
              <p className="font-semibold text-slate-700 dark:text-white">Relationship</p>
              <p>{student.guardianRelationship}</p>
            </div>
            <div className="space-y-2">
              <p className="font-semibold text-slate-700 dark:text-white">Guardian Phone</p>
              <p>{student.parentPhone}</p>
            </div>
            <div className="space-y-2">
              <p className="font-semibold text-slate-700 dark:text-white">College</p>
              <p>{student.college}</p>
            </div>
            <div className="space-y-2">
              <p className="font-semibold text-slate-700 dark:text-white">Course / Branch</p>
              <p>{student.course} / {student.branch}</p>
            </div>
            <div className="space-y-2">
              <p className="font-semibold text-slate-700 dark:text-white">Year of Study</p>
              <p>{student.yearOfStudy}</p>
            </div>
          </div>
          <div className="mt-6 space-y-4 text-sm text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-2"><MapPin size={16} /><span className="font-semibold text-slate-700 dark:text-white">Address</span></div>
            <p>{student.address}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
