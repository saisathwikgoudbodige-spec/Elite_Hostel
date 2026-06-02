import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Sidebar />
      <main className="lg:ml-64 min-h-screen p-4 md:p-6 lg:p-8 pt-16 lg:pt-8">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
