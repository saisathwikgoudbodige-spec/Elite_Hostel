import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layouts
import DashboardLayout from './components/DashboardLayout';

// Public Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OwnerRegisterPage from './pages/OwnerRegisterPage';

// Owner Pages
import OwnerDashboard from './pages/admin/OwnerDashboard';
import StudentsPage from './pages/admin/StudentsPage';
import RoomsPage from './pages/admin/RoomsPage';
import PaymentsPage from './pages/admin/PaymentsPage';
import ExpensesPage from './pages/admin/ExpensesPage';
import ReportsPage from './pages/admin/ReportsPage';
import NotificationsPage from './pages/admin/NotificationsPage';
import SettingsPage from './pages/admin/SettingsPage';
import OwnerDashboardPage from './pages/owner/OwnerDashboard';
import OwnerStudentDetail from './pages/owner/OwnerStudentDetail';
import OwnerPaymentRequests from './pages/owner/OwnerPaymentRequests';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import StudentProfile from './pages/student/StudentProfile';
import SubmitPayment from './pages/student/SubmitPayment';

// Route Guards
const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, role, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-slate-900">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-slate-500 dark:text-slate-400 font-medium">Loading...</span>
        </div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to={role === 'owner' ? '/admin/dashboard' : '/student/dashboard'} replace />;
  }
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, role, loading } = useAuth();
  if (loading) return null;
  if (user) {
    return <Navigate to={role === 'owner' ? '/admin/dashboard' : '/student/dashboard'} replace />;
  }
  return children;
};

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/register/owner" element={<PublicRoute><OwnerRegisterPage /></PublicRoute>} />

      {/* Owner/Admin Routes */}
      <Route path="/admin" element={<PrivateRoute allowedRoles={['owner']}><DashboardLayout /></PrivateRoute>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<OwnerDashboard />} />
        <Route path="students" element={<StudentsPage />} />
        <Route path="rooms" element={<RoomsPage />} />
        <Route path="payments" element={<PaymentsPage />} />
        <Route path="expenses" element={<ExpensesPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      <Route path="/owner" element={<PrivateRoute allowedRoles={['owner']}><DashboardLayout /></PrivateRoute>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<OwnerDashboardPage />} />
        <Route path="students" element={<StudentsPage />} />
        <Route path="students/:id" element={<OwnerStudentDetail />} />
        <Route path="payments/requests" element={<OwnerPaymentRequests />} />
        <Route path="rooms" element={<RoomsPage />} />
        <Route path="payments" element={<PaymentsPage />} />
        <Route path="expenses" element={<ExpensesPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Student Routes */}
      <Route path="/student" element={<PrivateRoute allowedRoles={['student']}><DashboardLayout /></PrivateRoute>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="profile" element={<StudentProfile />} />
        <Route path="payments/submit" element={<SubmitPayment />} />
      </Route>

      {/* Default redirect */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
