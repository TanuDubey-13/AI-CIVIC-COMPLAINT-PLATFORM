import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCitizenDashboard } from '../services/dashboardAPI';
import { StatusBadge, PriorityBadge } from '../components/Badges';
import { LoadingSpinner, AlertMessage } from '../components/CommonUI';
import {
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  PlusCircle,
  ArrowRight,
  TrendingUp,
  MapPin,
} from 'lucide-react';

export const CitizenDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getCitizenDashboard();
      if (res && res.data) {
        setData(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load citizen dashboard');
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
        <LoadingSpinner text="Loading your civic dashboard..." size="lg" />
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Citizen Dashboard</h1>
          <p className="text-sm text-muted">Overview of your reported civic issues and real-time status</p>
        </div>
        <Link to="/citizen/create-complaint" className="btn btn-primary">
          <PlusCircle size={18} /> File New Complaint
        </Link>
      </div>

      <AlertMessage type="danger" message={error} onClose={() => setError('')} />

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#dbeafe', color: '#1d4ed8' }}>
            <FileText size={24} />
          </div>
          <div className="stat-info">
            <h4>Total Filed</h4>
            <p>{data?.totalComplaintsSubmitted || 0}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
            <Clock size={24} />
          </div>
          <div className="stat-info">
            <h4>Pending Review</h4>
            <p>{data?.pending || 0}</p>
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
          <div className="stat-icon" style={{ background: '#dcfce7', color: '#16a34a' }}>
            <CheckCircle size={24} />
          </div>
          <div className="stat-info">
            <h4>Resolved</h4>
            <p>{data?.resolved || 0}</p>
          </div>
        </div>
      </div>

      {/* Recent Complaints Section */}
      <div className="card mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Recent Complaints</h2>
          <Link to="/citizen/my-complaints" className="text-sm font-semibold flex items-center gap-1">
            View All <ArrowRight size={14} />
          </Link>
        </div>

        {!data?.recentComplaints || data.recentComplaints.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#64748b' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📭</div>
            <h3 className="font-bold text-main">No Complaints Filed Yet</h3>
            <p className="text-sm text-muted mt-1 mb-4">Have an issue in your neighborhood? Submit it in seconds.</p>
            <Link to="/citizen/create-complaint" className="btn btn-primary btn-sm">
              <PlusCircle size={16} /> File Your First Complaint
            </Link>
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
                  <th>Reported Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {data.recentComplaints.map((item) => (
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
                        to={`/citizen/complaint/${item.complaintId || item._id}`}
                        className="btn btn-outline btn-sm"
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Category Distribution if available */}
      {data?.categoryDistribution && data.categoryDistribution.length > 0 && (
        <div className="card">
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem' }}>
            Complaints by Category
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            {data.categoryDistribution.map((cat) => (
              <div
                key={cat.category}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  padding: '0.5rem 0.875rem',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <span className="text-sm font-semibold">{cat.category}</span>
                <span className="badge" style={{ background: '#e2e8f0', color: '#334155' }}>
                  {cat.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
