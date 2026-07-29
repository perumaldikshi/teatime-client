import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Import Screens
import Login from './screens/Login';
import Sidebar from './components/Sidebar';
import NotificationListener from './components/NotificationListener';

// Employee Screens
import EmployeeDashboard from './screens/employee/Dashboard';
import OrderDrink from './screens/employee/Order';
import History from './screens/employee/History';
import Notifications from './screens/employee/Notifications';
import Profile from './screens/employee/Profile';

// Admin Screens
import AdminDashboard from './screens/admin/Dashboard';
import Employees from './screens/admin/Employees';
import TeaMaster from './screens/admin/TeaMaster';
import Reports from './screens/admin/Reports';
import Setup from './screens/admin/Setup';
import TimeSettings from './screens/admin/TimeSettings';
import BroadcastAlert from './screens/admin/BroadcastAlert';

// Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { token, user } = useAuth();
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }
  
  return (
    <div className="app-container">
      <NotificationListener />
      <Sidebar />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

// Root Dashboard redirect wrapper
const DashboardRedirect = () => {
  const { user } = useAuth();
  if (user?.role === 'admin') {
    return <AdminDashboard />;
  }
  return <EmployeeDashboard />;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />

      {/* Protected Routes */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <DashboardRedirect />
          </ProtectedRoute>
        } 
      />
      
      {/* Employee Specific Routes */}
      <Route 
        path="/order" 
        element={
          <ProtectedRoute allowedRoles={['employee']}>
            <OrderDrink />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/history" 
        element={
          <ProtectedRoute allowedRoles={['employee', 'admin']}>
            <History />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/notifications" 
        element={
          <ProtectedRoute allowedRoles={['employee']}>
            <Notifications />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } 
      />

      {/* Admin Specific Routes */}
      <Route 
        path="/employees" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Employees />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/tea-master" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <TeaMaster />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/reports" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Reports />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/setup" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Setup />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/setup/time" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <TimeSettings />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/setup/broadcast" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <BroadcastAlert />
          </ProtectedRoute>
        } 
      />

      {/* Catch-all Route redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <AppRoutes />
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}
