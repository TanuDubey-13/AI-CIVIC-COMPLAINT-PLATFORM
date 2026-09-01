<<<<<<< HEAD
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { ProtectedRoute } from './components/ProtectedRoute';

// Public Pages
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { VerifyEmail } from './pages/VerifyEmail';
import { Profile } from './pages/Profile';
import { NotificationsPage } from './pages/NotificationsPage';
import { NotFound } from './pages/NotFound';

// Citizen Pages
import { CitizenDashboard } from './pages/CitizenDashboard';
import { CreateComplaint } from './pages/CreateComplaint';
import { MyComplaints } from './pages/MyComplaints';
import { ComplaintDetails } from './pages/ComplaintDetails';

// Officer Pages
import { OfficerDashboard } from './pages/OfficerDashboard';
import { OfficerComplaints } from './pages/OfficerComplaints';
import { OfficerComplaintDetail } from './pages/OfficerComplaintDetail';
import { OfficerPerformance } from './pages/OfficerPerformance';

// Admin Pages
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminComplaints } from './pages/AdminComplaints';
import { AdminUsers } from './pages/AdminUsers';
import { AdminOfficers } from './pages/AdminOfficers';
import { AdminAnalytics } from './pages/AdminAnalytics';

function AppLayout({ children }) {
  const { isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="app-container">
      <Navbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
      <div className="main-content">
        {isAuthenticated && <Sidebar isOpen={sidebarOpen} />}
        <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
      </div>
    </div>
  );
}

function AppRoutes() {
  return (
    <AppLayout>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token?" element={<ResetPassword />} />
        <Route path="/verify-email/:token?" element={<VerifyEmail />} />

        {/* Authenticated User Shared Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/notifications" element={<NotificationsPage />} />
        </Route>

        {/* Citizen Portal */}
        <Route element={<ProtectedRoute allowedRoles={['citizen', 'admin']} />}>
          <Route path="/citizen/dashboard" element={<CitizenDashboard />} />
          <Route path="/citizen/create-complaint" element={<CreateComplaint />} />
          <Route path="/citizen/my-complaints" element={<MyComplaints />} />
          <Route path="/citizen/complaint/:id" element={<ComplaintDetails />} />
        </Route>

        {/* Officer Portal */}
        <Route element={<ProtectedRoute allowedRoles={['officer', 'admin']} />}>
          <Route path="/officer/dashboard" element={<OfficerDashboard />} />
          <Route path="/officer/complaints" element={<OfficerComplaints />} />
          <Route path="/officer/complaint/:id" element={<OfficerComplaintDetail />} />
          <Route path="/officer/performance" element={<OfficerPerformance />} />
        </Route>

        {/* Admin Portal */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/complaints" element={<AdminComplaints />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/officers" element={<AdminOfficers />} />
          <Route path="/admin/analytics" element={<AdminAnalytics />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppLayout>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
=======
import AppRoutes from "./routes/AppRoutes";


function App(){

return(

<AppRoutes/>

)

}


export default App;
>>>>>>> 0488c86f666544cf90ab8d11d465f34d47f64c49
