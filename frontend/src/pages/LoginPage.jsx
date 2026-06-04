import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Bed, Eye, EyeOff, LogIn } from 'lucide-react';

const LoginPage = () => {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [type, setType] = useState('owner');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(email, password, type);
    if (result?.success) {
      const redirectPath = type === 'owner' ? '/admin/dashboard' : '/student/dashboard';
      navigate(redirectPath);
    } else {
      toast.error(result?.message || 'Login failed');
    }
    setLoading(false);

  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 p-4">
      {/* Background orbs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl animate-pulse-subtle" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse-subtle" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-3">
            <div className="p-3 rounded-2xl bg-sky-500 text-white shadow-lg shadow-sky-500/30">
              <Bed size={28} />
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-wide">EliteHostel</h1>
          </div>
          <p className="text-slate-400 text-sm">Hostel Fee Management System</p>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          {/* Role Toggle */}
          <div className="flex bg-white/5 rounded-2xl p-1 mb-6">
            <button
              type="button"
              onClick={() => setType('owner')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                type === 'owner'
                  ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/25'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Owner / Admin
            </button>
            <button
              type="button"
              onClick={() => setType('student')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                type === 'student'
                  ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/25'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Student
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">Email</label>
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">Password</label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl transition-all duration-300 shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn size={18} />
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-400 text-sm">
              Student?{' '}
              <Link to="/register" className="text-sky-400 hover:text-sky-300 font-semibold transition-colors">
                Register here
              </Link>
            </p>
            <p className="text-slate-400 text-sm mt-2">
              New hostel owner?{' '}
              <Link to="/register/owner" className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors">
                Create admin account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
