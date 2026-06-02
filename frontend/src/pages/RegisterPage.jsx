import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import axios from 'axios';
import {
  Bed, User, Users, Phone, Mail, Lock, School, MapPin,
  Calendar, IndianRupee, FileText, ChevronRight, ChevronLeft,
  CheckCircle, Upload, Eye, EyeOff
} from 'lucide-react';

const STEPS = [
  { title: 'Personal Details', icon: User },
  { title: 'Guardian Info', icon: Users },
  { title: 'Academic Info', icon: School },
  { title: 'Hostel & Fee', icon: Bed },
  { title: 'Review & Submit', icon: CheckCircle },
];

const initialForm = {
  name: '', dateOfBirth: '', gender: '', aadhaarNumber: '',
  parentOrGuardianName: '', guardianRelationship: 'Father', parentPhone: '',
  phone: '', email: '', password: '', confirmPassword: '',
  college: '', course: '', branch: '', yearOfStudy: 1,
  address: '', roomNumber: '', monthlyFee: '', securityDeposit: '',
  joiningDate: new Date().toISOString().split('T')[0],
  feeCycleType: 'joining_date', dueDay: 1,
};

const RegisterPage = () => {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [photo, setPhoto] = useState(null);
  const [documentScan, setDocumentScan] = useState(null);
  const [collegeIdScan, setCollegeIdScan] = useState(null);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [availableRooms, setAvailableRooms] = useState([]);

  useEffect(() => {
    axios.get('/api/rooms/available').then(r => {
      if (r.data?.rooms) setAvailableRooms(r.data.rooms);
    }).catch(() => {});
  }, []);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const validateStep = () => {
    switch (step) {
      case 0:
        if (!form.name || !form.dateOfBirth || !form.gender || !form.aadhaarNumber) {
          toast.error('Please fill all personal details');
          return false;
        }
        if (form.aadhaarNumber.length !== 12 || !/^\d{12}$/.test(form.aadhaarNumber)) {
          toast.error('Aadhaar must be exactly 12 digits');
          return false;
        }
        return true;
      case 1:
        if (!form.parentOrGuardianName || !form.parentPhone || !form.phone || !form.email || !form.password) {
          toast.error('Please fill all guardian & contact details');
          return false;
        }
        if (form.password !== form.confirmPassword) {
          toast.error('Passwords do not match');
          return false;
        }
        if (form.password.length < 6) {
          toast.error('Password must be at least 6 characters');
          return false;
        }
        return true;
      case 2:
        if (!form.college || !form.course || !form.branch || !form.address) {
          toast.error('Please fill all academic details');
          return false;
        }
        return true;
      case 3:
        if (!form.monthlyFee || !form.securityDeposit || !form.joiningDate) {
          toast.error('Please fill all hostel & fee details');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const next = () => { if (validateStep()) setStep(s => Math.min(s + 1, 4)); };
  const prev = () => setStep(s => Math.max(s - 1, 0));

  const handleSubmit = async () => {
    setLoading(true);
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (key !== 'confirmPassword') formData.append(key, value);
    });
    if (photo) formData.append('photo', photo);
    if (documentScan) formData.append('documentScan', documentScan);
    if (collegeIdScan) formData.append('collegeIdScan', collegeIdScan);

    const result = await register(formData);
    if (result.success) {
      toast.success(result.message || 'Registration successful! Awaiting approval.');
      navigate('/login');
    } else {
      toast.error(result.message || 'Registration failed');
    }
    setLoading(false);
  };

  const inputClass = "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all text-sm";
  const labelClass = "block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider";

  const FileUpload = ({ label, file, setFile, id }) => (
    <div>
      <label className={labelClass}>{label}</label>
      <label htmlFor={id} className="flex items-center gap-3 px-4 py-3 bg-white/5 border border-dashed border-white/20 rounded-xl cursor-pointer hover:border-sky-500/50 transition-colors">
        <Upload size={16} className="text-slate-400" />
        <span className="text-sm text-slate-400 truncate">{file ? file.name : 'Choose file...'}</span>
        <input id={id} type="file" className="hidden" accept="image/*,.pdf" onChange={(e) => setFile(e.target.files[0])} />
      </label>
    </div>
  );

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Full Name *</label>
              <input className={inputClass} value={form.name} onChange={set('name')} placeholder="John Doe" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Date of Birth *</label>
                <input type="date" className={inputClass} value={form.dateOfBirth} onChange={set('dateOfBirth')} />
              </div>
              <div>
                <label className={labelClass}>Gender *</label>
                <select className={inputClass} value={form.gender} onChange={set('gender')}>
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div>
              <label className={labelClass}>Aadhaar Number (12 digits) *</label>
              <input className={inputClass} value={form.aadhaarNumber} onChange={set('aadhaarNumber')} placeholder="123456789012" maxLength={12} />
            </div>
            <FileUpload label="Profile Photo (optional)" file={photo} setFile={setPhoto} id="photo-upload" />
          </div>
        );
      case 1:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Guardian Name *</label>
                <input className={inputClass} value={form.parentOrGuardianName} onChange={set('parentOrGuardianName')} placeholder="Guardian Name" />
              </div>
              <div>
                <label className={labelClass}>Relationship *</label>
                <select className={inputClass} value={form.guardianRelationship} onChange={set('guardianRelationship')}>
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Guardian">Guardian</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Guardian Phone *</label>
                <input className={inputClass} value={form.parentPhone} onChange={set('parentPhone')} placeholder="9876543210" />
              </div>
              <div>
                <label className={labelClass}>Your Phone *</label>
                <input className={inputClass} value={form.phone} onChange={set('phone')} placeholder="9876543210" />
              </div>
            </div>
            <div>
              <label className={labelClass}>Email *</label>
              <input type="email" className={inputClass} value={form.email} onChange={set('email')} placeholder="you@example.com" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Password *</label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} className={inputClass + ' pr-10'} value={form.password} onChange={set('password')} placeholder="Min 6 chars" />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className={labelClass}>Confirm Password *</label>
                <input type="password" className={inputClass} value={form.confirmPassword} onChange={set('confirmPassword')} placeholder="Re-enter" />
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <div>
              <label className={labelClass}>College Name *</label>
              <input className={inputClass} value={form.college} onChange={set('college')} placeholder="ABC Engineering College" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Course *</label>
                <input className={inputClass} value={form.course} onChange={set('course')} placeholder="B.Tech" />
              </div>
              <div>
                <label className={labelClass}>Branch *</label>
                <input className={inputClass} value={form.branch} onChange={set('branch')} placeholder="Computer Science" />
              </div>
            </div>
            <div>
              <label className={labelClass}>Year of Study *</label>
              <select className={inputClass} value={form.yearOfStudy} onChange={set('yearOfStudy')}>
                {[1, 2, 3, 4, 5].map(y => <option key={y} value={y}>Year {y}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Permanent Address *</label>
              <textarea className={inputClass + ' resize-none'} rows={3} value={form.address} onChange={set('address')} placeholder="Full address" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FileUpload label="Aadhaar / ID Scan" file={documentScan} setFile={setDocumentScan} id="doc-upload" />
              <FileUpload label="College ID Scan" file={collegeIdScan} setFile={setCollegeIdScan} id="college-upload" />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Preferred Room</label>
              <select className={inputClass} value={form.roomNumber} onChange={set('roomNumber')}>
                <option value="">Auto-assign / Select later</option>
                {availableRooms.map(r => (
                  <option key={r._id} value={r.roomNumber}>
                    Room {r.roomNumber} — {r.type} (₹{r.rent}/mo, {r.capacity - (r.occupants?.length || 0)} beds free)
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Monthly Fee (₹) *</label>
                <input type="number" className={inputClass} value={form.monthlyFee} onChange={set('monthlyFee')} placeholder="5000" />
              </div>
              <div>
                <label className={labelClass}>Security Deposit (₹) *</label>
                <input type="number" className={inputClass} value={form.securityDeposit} onChange={set('securityDeposit')} placeholder="10000" />
              </div>
            </div>
            <div>
              <label className={labelClass}>Joining Date *</label>
              <input type="date" className={inputClass} value={form.joiningDate} onChange={set('joiningDate')} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Fee Cycle Type</label>
                <select className={inputClass} value={form.feeCycleType} onChange={set('feeCycleType')}>
                  <option value="joining_date">From Joining Date</option>
                  <option value="fixed_date">Fixed Monthly Date</option>
                </select>
              </div>
              {form.feeCycleType === 'fixed_date' && (
                <div>
                  <label className={labelClass}>Due Day of Month</label>
                  <input type="number" min={1} max={31} className={inputClass} value={form.dueDay} onChange={set('dueDay')} />
                </div>
              )}
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white mb-2">Review Your Information</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Name', form.name],
                ['DOB', form.dateOfBirth],
                ['Gender', form.gender],
                ['Aadhaar', form.aadhaarNumber ? `XXXX-XXXX-${form.aadhaarNumber.slice(-4)}` : ''],
                ['Guardian', `${form.parentOrGuardianName} (${form.guardianRelationship})`],
                ['Guardian Ph', form.parentPhone],
                ['Phone', form.phone],
                ['Email', form.email],
                ['College', form.college],
                ['Course', `${form.course} - ${form.branch}`],
                ['Year', form.yearOfStudy],
                ['Address', form.address],
                ['Room', form.roomNumber || 'Auto-assign'],
                ['Monthly Fee', `₹${form.monthlyFee}`],
                ['Security Dep.', `₹${form.securityDeposit}`],
                ['Joining', form.joiningDate],
                ['Fee Cycle', form.feeCycleType === 'joining_date' ? 'From Joining Date' : `Fixed Day ${form.dueDay}`],
              ].map(([label, value]) => (
                <div key={label} className="bg-white/5 rounded-lg px-3 py-2">
                  <p className="text-[10px] uppercase text-slate-400 font-semibold">{label}</p>
                  <p className="text-sm text-white truncate">{value}</p>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 p-4">
      <div className="absolute top-1/3 left-1/3 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl animate-pulse-subtle" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse-subtle" />

      <div className="relative w-full max-w-2xl">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-3 mb-2">
            <div className="p-3 rounded-2xl bg-sky-500 text-white shadow-lg shadow-sky-500/30">
              <Bed size={28} />
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-wide">EliteHostel</h1>
          </div>
          <p className="text-slate-400 text-sm">Student Self-Registration</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-1 mb-6">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <React.Fragment key={i}>
                <div
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    i === step
                      ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/25'
                      : i < step
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-white/5 text-slate-500'
                  }`}
                >
                  <Icon size={14} />
                  <span className="hidden sm:inline">{s.title}</span>
                  <span className="sm:hidden">{i + 1}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`w-6 h-0.5 ${i < step ? 'bg-emerald-500/50' : 'bg-white/10'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Form Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-6">{STEPS[step].title}</h2>

          {renderStep()}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            {step > 0 ? (
              <button
                type="button"
                onClick={prev}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 text-slate-300 hover:bg-white/10 font-semibold text-sm transition-all"
              >
                <ChevronLeft size={16} />
                Back
              </button>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 text-slate-300 hover:bg-white/10 font-semibold text-sm transition-all"
              >
                Back to Login
              </Link>
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={next}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold text-sm shadow-lg shadow-sky-500/25 transition-all"
              >
                Next
                <ChevronRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm shadow-lg shadow-emerald-500/25 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle size={16} />
                    Submit Registration
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
