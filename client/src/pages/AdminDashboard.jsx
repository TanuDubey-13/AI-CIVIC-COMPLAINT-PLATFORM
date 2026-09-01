import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAdminDashboard } from '../services/dashboardAPI';
import * as adminAPI from '../services/adminAPI';
import { StatusBadge, PriorityBadge } from '../components/Badges';
import { LoadingSpinner, AlertMessage } from '../components/CommonUI';
import {
  Users,
  UserCheck,
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  Activity,
  Server,
  ArrowRight,
  TrendingUp,
  ShieldAlert,
} from 'lucide-react';

export const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [health, setHealth] = useState(null);
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAdminData = async () => {
    try {
      setLoading(true);
      setError('');
      const [dashRes, healthRes, complaintsRes] = await Promise.all([
        getAdminDashboard(),
        adminAPI.getSystemHealthReport().catch(() => null),
        adminAPI.getRecentComplaintsList().catch(() => ({ complaints: [] })),
      ]);

      if (dashRes && dashRes.data) {
        setData(dashRes.data);
      }
      if (healthRes && healthRes.data) {
        setHealth(healthRes.data);
      }
      if (complaintsRes && complaintsRes.complaints) {
        setRecentComplaints(complaintsRes.complaints);
      }
    } catch (err) {
      setError(err.message || 'Failed to load admin dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  if (loading) {
    return (
      <div className="page-wrapper" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingSpinner text="Loading city administration dashboard..." size="lg" />
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>City Administration Dashboard</h1>
          <p className="text-sm text-muted">Real-time civic monitoring, complaint routing, and platform infrastructure health</p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/admin/complaints" className="btn btn-primary btn-sm">
            Manage Complaints
          </Link>
          <Link to="/admin/officers" className="btn btn-secondary btn-sm">
            Manage Officers
          </Link>
        </div>
      </div>

      <AlertMessage type="danger" message={error} onClose={() => setError('')} />

      {/* Main Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#dbeafe', color: '#1d4ed8' }}>
            <FileText size={24} />
          </div>
          <div className="stat-info">
            <h4>Total Complaints</h4>
            <p>{data?.totalComplaints || 0}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
            <Clock size={24} />
          </div>
          <div className="stat-info">
            <h4>Pending Review</h4>
            <p>{data?.pendingComplaints || 0}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#ede9fe', color: '#7c3aed' }}>
            <TrendingUp size={24} />
          </div>
          <div className="stat-info">
            <h4>In Progress</h4>
            <p>{data?.inProgressComplaints || 0}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#dcfce7', color: '#16a34a' }}>
            <CheckCircle size={24} />
          </div>
          <div className="stat-info">
            <h4>Resolved</h4>
            <p>{data?.resolvedComplaints || 0}</p>
          </div>
        </div>
      </div>

      {/* Secondary Metric Cards (Users & Officers) */}
      <div className="grid grid-2 gap-6 mb-6">
        <div className="card flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="stat-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>
              <Users size={24} />
            </div>
            <div>
              <h3 className="font-bold text-base">Registered Citizens</h3>
              <p className="text-2xl font-extrabold text-main">{data?.totalCitizens || 0}</p>
            </div>
          </div>
          <Link to="/admin/users" className="btn btn-outline btn-sm">
            View Users <ArrowRight size={14} />
          </Link>
        </div>

        <div className="card flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="stat-icon" style={{ background: '#ede9fe', color: '#7c3aed' }}>
              <UserCheck size={24} />
            </div>
            <div>
              <h3 className="font-bold text-base">Active Field Officers</h3>
              <p className="text-2xl font-extrabold text-main">{data?.totalOfficers || 0}</p>
            </div>
          </div>
          <Link to="/admin/officers" className="btn btn-outline btn-sm">
            View Officers <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Recent Complaints Registry */}
      <div className="card mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Latest City Complaints Queue</h2>
          <Link to="/admin/complaints" className="text-sm font-semibold flex items-center gap-1">
            Open Registry <ArrowRight size={14} />
          </Link>
        </div>

        {recentComplaints.length === 0 ? (
          <div className="p-6 text-center text-sm text-muted">No complaints recorded yet.</div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Assigned Officer</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentComplaints.slice(0, 6).map((c) => (
                  <tr key={c.id || c._id}>
                    <td>
                      <div className="font-semibold text-main">{c.title}</div>
                    </td>
                    <td>{c.category}</td>
                    <td>
                      <PriorityBadge priority={c.priority} />
                    </td>
                    <td>
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="text-xs">
                      {c.assignedOfficer ? (
                        <span className="font-medium text-primary">{c.assignedOfficer.name}</span>
                      ) : (
                        <span className="text-muted italic">Unassigned</span>
                      )}
                    </td>
                    <td className="text-xs text-muted">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <Link to="/admin/complaints" className="btn btn-outline btn-sm">
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* System Health Status Card */}
      {health && (
        <div className="card" style={{ background: '#f8fafc', border: '1px solid #cbd5e1' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }} className="flex items-center gap-2">
            <Server size={18} color="#2563eb" /> Platform System Health
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', fontSize: '0.875rem' }}>
            <div>
              <span className="text-muted">MongoDB Atlas:</span>{' '}
              <strong style={{ color: health.mongoConnected ? '#16a34a' : '#dc2626' }}>
                {health.mongoConnected ? '● Connected' : '● Disconnected'}
              </strong>
            </div>
            <div>
              <span className="text-muted">Server Uptime:</span>{' '}
              <strong>{Math.round(health.serverUptime || 0)}s</strong>
            </div>
            <div>
              <span className="text-muted">Node Environment:</span>{' '}
              <strong>{health.environment}</strong>
            </div>
            <div>
              <span className="text-muted">Heap Memory:</span>{' '}
              <strong>{Math.round((health.memoryUsage?.heapUsed || 0) / (1024 * 1024))} MB</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
