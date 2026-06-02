import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  LayoutDashboard, Users, Bed, CreditCard, FileText, 
  Settings, LogOut, Sun, Moon, Bell, Menu, X, IndianRupee 
} from 'lucide-react';

const Sidebar = () => {
  const { role, logout, user } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const ownerLinks = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/students', label: 'Students', icon: Users },
    { to: '/admin/rooms', label: 'Rooms', icon: Bed },
    { to: '/admin/payments', label: 'Payments', icon: CreditCard },
    { to: '/admin/expenses', label: 'Expenses', icon: IndianRupee },
    { to: '/admin/reports', label: 'Reports', icon: FileText },
    { to: '/admin/notifications', label: 'Notifications', icon: Bell },
    { to: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  const studentLinks = [
    { to: '/student/dashboard', label: 'My Dashboard', icon: LayoutDashboard },
    { to: '/student/profile', label: 'My Profile', icon: Users },
  ];

  const links = role === 'owner' ? ownerLinks : studentLinks;

  const toggleSidebar = () => setIsOpen(!isOpen);

  const linkClass = ({ isActive }) => 
    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
      isActive 
        ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20' 
        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'
    }`;

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="lg:hidden fixed top-4 left-4 z-40">
        <button 
          onClick={toggleSidebar} 
          className="p-2.5 rounded-xl bg-white dark:bg-slate-800 shadow-md text-slate-800 dark:text-white"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar Panel */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700/50 flex flex-col z-35 transition-transform duration-300 lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Brand / Title */}
        <div className="h-20 flex items-center px-6 border-b border-slate-100 dark:border-slate-700/50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-sky-500 text-white">
              <Bed size={20} />
            </div>
            <span className="font-extrabold text-lg text-slate-800 dark:text-white tracking-wide">
              EliteHostel
            </span>
          </div>
        </div>

        {/* User Info Card */}
        <div className="p-4 mx-4 mt-6 rounded-2xl bg-slate-50 dark:bg-slate-700/30 border border-slate-100 dark:border-slate-700/20">
          <p className="text-xs font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
            {role === 'owner' ? 'Administrator' : 'Student'}
          </p>
          <h4 className="font-bold text-slate-800 dark:text-white truncate">
            {user?.name || 'Loading...'}
          </h4>
          {role === 'student' && (
            <p className="text-xs text-slate-400 truncate">ID: {user?.studentId}</p>
          )}
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-4 mt-6 space-y-1.5 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink 
                key={link.to} 
                to={link.to} 
                className={linkClass}
                onClick={() => setIsOpen(false)}
              >
                <Icon size={18} />
                <span className="font-semibold text-sm">{link.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-700/50 space-y-2">
          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-all font-semibold text-sm"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>

          {/* Logout */}
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all font-semibold text-sm"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          onClick={toggleSidebar} 
          className="lg:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30"
        />
      )}
    </>
  );
};

export default Sidebar;
