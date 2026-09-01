import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  Users,
  UserCheck,
  BarChart3,
  Bell,
  User,
  CheckSquare,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';

export const Sidebar = ({ isOpen }) => {
  const { user } = useAuth();
  const role = user?.role || 'citizen';

  const linkStyle = ({ isActive }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    color: isActive ? '#2563eb' : '#475569',
    backgroundColor: isActive ? '#eff6ff' : 'transparent',
    fontWeight: isActive ? 600 : 500,
    fontSize: '0.9375rem',
    textDecoration: 'none',
    transition: 'all 0.15s ease',
  });

  const citizenLinks = [
    { to: '/citizen/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { to: '/citizen/create-complaint', label: 'File Complaint', icon: <PlusCircle size={18} /> },
    { to: '/citizen/my-complaints', label: 'My Complaints', icon: <FileText size={18} /> },
  ];

  const officerLinks = [
    { to: '/officer/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { to: '/officer/complaints', label: 'Assigned Tasks', icon: <CheckSquare size={18} /> },
    { to: '/officer/performance', label: 'Performance', icon: <TrendingUp size={18} /> },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { to: '/admin/complaints', label: 'All Complaints', icon: <FileText size={18} /> },
    { to: '/admin/users', label: 'User Directory', icon: <Users size={18} /> },
    { to: '/admin/officers', label: 'Field Officers', icon: <UserCheck size={18} /> },
    { to: '/admin/analytics', label: 'City Analytics', icon: <BarChart3 size={18} /> },
  ];

  let currentLinks = citizenLinks;
  if (role === 'officer') currentLinks = officerLinks;
  if (role === 'admin') currentLinks = adminLinks;

  return (
    <aside
      style={{
        width: '240px',
        backgroundColor: '#ffffff',
        borderRight: '1px solid #e2e8f0',
        padding: '1.5rem 1rem',
        display: isOpen ? 'flex' : 'none',
        flexDirection: 'column',
        gap: '0.5rem',
        minHeight: 'calc(100vh - 65px)',
      }}
    >
      <div className="text-xs font-bold text-muted uppercase px-3 mb-2" style={{ letterSpacing: '0.05em' }}>
        {role === 'admin' ? 'Administration' : role === 'officer' ? 'Officer Portal' : 'Citizen Services'}
      </div>

      {currentLinks.map((link) => (
        <NavLink key={link.to} to={link.to} style={linkStyle}>
          {link.icon}
          <span>{link.label}</span>
        </NavLink>
      ))}

      <div className="text-xs font-bold text-muted uppercase px-3 mt-6 mb-2" style={{ letterSpacing: '0.05em' }}>
        Account & Alerts
      </div>

      <NavLink to="/notifications" style={linkStyle}>
        <Bell size={18} />
        <span>Notifications</span>
      </NavLink>

      <NavLink to="/profile" style={linkStyle}>
        <User size={18} />
        <span>My Profile</span>
      </NavLink>
    </aside>
  );
};
