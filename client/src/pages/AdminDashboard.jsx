<<<<<<< HEAD
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
=======
import { useEffect, useState, useMemo } from "react";
import { getAllComplaints, updateStatus } from "../services/adminService";
import ComplaintChart from "../components/Charts/ComplaintChart";
import { formatCategory, groupAndCount } from "../utils/formatters";

export default function AdminDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ status: "", severity: "", category: "" });
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    loadComplaints();
  }, [filters]);

  const loadComplaints = async () => {
    setLoading(true);
    try {
      const activeFilters = Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v)
      );
      const res = await getAllComplaints(activeFilters);
      setComplaints(res.data.complaints || []);
    } catch {
      setError("Failed to load complaints.");
>>>>>>> 0488c86f666544cf90ab8d11d465f34d47f64c49
    } finally {
      setLoading(false);
    }
  };

<<<<<<< HEAD
  useEffect(() => {
    loadAdminData();
  }, []);

  if (loading) {
    return (
      <div className="page-wrapper" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingSpinner text="Loading city administration dashboard..." size="lg" />
=======
  const changeStatus = async (id, status) => {
    setUpdating(id);
    try {
      await updateStatus(id, status);
      loadComplaints();
    } catch {
      setError("Failed to update status.");
    } finally {
      setUpdating(null);
    }
  };

  const stats = useMemo(() => ({
    total: complaints.length,
    pending: complaints.filter((c) => c.status === "pending").length,
    inProgress: complaints.filter((c) => c.status === "in_progress").length,
    resolved: complaints.filter((c) => c.status === "resolved").length,
  }), [complaints]);

  const categoryData = useMemo(() => groupAndCount(complaints, "category"), [complaints]);
  const severityData = useMemo(() => groupAndCount(complaints, "severity"), [complaints]);
  const statusData = useMemo(() => groupAndCount(complaints, "status"), [complaints]);

  if (loading && complaints.length === 0) {
    return (
      <div className="loading-spinner">
        <div className="spinner" />
        <p>Loading admin dashboard...</p>
>>>>>>> 0488c86f666544cf90ab8d11d465f34d47f64c49
      </div>
    );
  }

  return (
<<<<<<< HEAD
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
=======
    <div>
      <div className="page-header">
        <h1>Admin Dashboard</h1>
        <p>Manage and monitor all civic complaints</p>
      </div>

      {error && <div className="form-error">{error}</div>}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total</div>
          <div className="stat-value">{stats.total}</div>
        </div>
        <div className="stat-card pending">
          <div className="stat-label">Pending</div>
          <div className="stat-value">{stats.pending}</div>
        </div>
        <div className="stat-card progress">
          <div className="stat-label">In Progress</div>
          <div className="stat-value">{stats.inProgress}</div>
        </div>
        <div className="stat-card resolved">
          <div className="stat-label">Resolved</div>
          <div className="stat-value">{stats.resolved}</div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Complaints by Category</h3>
          <ComplaintChart data={categoryData} color="#2563eb" />
        </div>
        <div className="chart-card">
          <h3>Complaints by Severity</h3>
          <ComplaintChart data={severityData} color="#d97706" />
        </div>
        <div className="chart-card">
          <h3>Complaints by Status</h3>
          <ComplaintChart data={statusData} color="#059669" />
        </div>
      </div>

      <div className="filters-bar">
        <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="rejected">Rejected</option>
        </select>

        <select value={filters.severity} onChange={(e) => setFilters({ ...filters, severity: e.target.value })}>
          <option value="">All Severity</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>

        <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
          <option value="">All Categories</option>
          <option value="road_damage">Road Damage</option>
          <option value="streetlight">Street Light</option>
          <option value="garbage">Garbage</option>
          <option value="water_leakage">Water Leakage</option>
          <option value="other">Other</option>
        </select>
      </div>

      {complaints.length === 0 ? (
        <div className="empty-state">
          <h3>No complaints found</h3>
          <p>No complaints match the current filters.</p>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Title</th>
                <th>Category</th>
                <th>Severity</th>
                <th>Status</th>
                <th>Department</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map((complaint) => (
                <tr key={complaint._id}>
                  <td>
                    <img src={complaint.image} alt={complaint.title} className="table-thumb" />
                  </td>
                  <td style={{ fontWeight: 600 }}>{complaint.title}</td>
                  <td>{formatCategory(complaint.category)}</td>
                  <td>
                    <span className={`badge badge-${complaint.severity}`}>{complaint.severity}</span>
                  </td>
                  <td>
                    <span className={`badge badge-${complaint.status}`}>
                      {complaint.status?.replace("_", " ")}
                    </span>
                  </td>
                  <td>{complaint.department?.name || "—"}</td>
                  <td>
                    <select
                      className="status-select"
                      value={complaint.status}
                      disabled={updating === complaint._id}
                      onChange={(e) => changeStatus(complaint._id, e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
>>>>>>> 0488c86f666544cf90ab8d11d465f34d47f64c49
        </div>
      )}
    </div>
  );
<<<<<<< HEAD
};
=======
}
>>>>>>> 0488c86f666544cf90ab8d11d465f34d47f64c49
