import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getOfficerDashboard } from '../services/officerAPI';
import { StatusBadge, PriorityBadge } from '../components/Badges';
import { LoadingSpinner, AlertMessage } from '../components/CommonUI';
import {
  CheckSquare,
  Clock,
  CheckCircle,
  AlertOctagon,
  Calendar,
  ArrowRight,
  TrendingUp,
  Award,
} from 'lucide-react';

export const OfficerDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getOfficerDashboard();
      if (res && res.data) {
        setData(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load officer dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="page-wrapper" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingSpinner text="Loading officer workbench..." size="lg" />
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Field Officer Dashboard</h1>
          <p className="text-sm text-muted">Manage assigned complaints, log field visits, and report resolutions</p>
        </div>
        <Link to="/officer/complaints" className="btn btn-primary">
          <CheckSquare size={18} /> View All Assigned Tasks
        </Link>
      </div>

      <AlertMessage type="danger" message={error} onClose={() => setError('')} />

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#dbeafe', color: '#1d4ed8' }}>
            <CheckSquare size={24} />
          </div>
          <div className="stat-info">
            <h4>Total Assigned</h4>
            <p>{data?.totalAssigned || 0}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#ede9fe', color: '#7c3aed' }}>
            <TrendingUp size={24} />
          </div>
          <div className="stat-info">
            <h4>In Progress</h4>
            <p>{data?.inProgress || 0}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fee2e2', color: '#dc2626' }}>
            <AlertOctagon size={24} />
          </div>
          <div className="stat-info">
            <h4>High Priority</h4>
            <p>{data?.highPriority || 0}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#dcfce7', color: '#16a34a' }}>
            <CheckCircle size={24} />
          </div>
          <div className="stat-info">
            <h4>Resolved</h4>
            <p>{data?.resolved || 0}</p>
          </div>
        </div>
      </div>

      {/* Recent Assigned Complaints */}
      <div className="card mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Priority Action Queue</h2>
          <Link to="/officer/complaints" className="text-sm font-semibold flex items-center gap-1">
            View All <ArrowRight size={14} />
          </Link>
        </div>

        {!data?.recentAssignedComplaints || data.recentAssignedComplaints.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#64748b' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>✨</div>
            <h3 className="font-bold text-main">No Assigned Complaints Pending</h3>
            <p className="text-sm text-muted mt-1">All assigned complaints have been addressed or no new tasks assigned.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Assigned Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {data.recentAssignedComplaints.map((item) => (
                  <tr key={item.complaintId || item._id}>
                    <td>
                      <div className="font-semibold text-main">{item.title}</div>
                    </td>
                    <td>{item.category}</td>
                    <td>
                      <PriorityBadge priority={item.priority} />
                    </td>
                    <td>
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="text-xs text-muted">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <Link
                        to={`/officer/complaint/${item.complaintId || item._id}`}
                        className="btn btn-primary btn-sm"
                      >
                        Action
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Performance Summary Banner */}
      <div className="card flex items-center justify-between flex-wrap gap-4" style={{ background: '#f8fafc' }}>
        <div className="flex items-center gap-3">
          <div className="stat-icon" style={{ background: '#fef3c7', color: '#b45309' }}>
            <Award size={24} />
          </div>
          <div>
            <h3 className="font-bold text-sm">Average Resolution Efficiency</h3>
            <p className="text-xs text-muted">Average time taken from assignment to resolution: <strong>{data?.averageResolutionTime || 0} days</strong></p>
          </div>
        </div>
        <Link to="/officer/performance" className="btn btn-outline btn-sm">
          View Performance Report
        </Link>
      </div>
    </div>
  );
};
