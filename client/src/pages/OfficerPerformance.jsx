import React, { useState, useEffect } from 'react';
import { getOfficerPerformance } from '../services/officerAPI';
import { LoadingSpinner, AlertMessage } from '../components/CommonUI';
import { Award, CheckCircle, Clock, Zap, TrendingUp, Calendar } from 'lucide-react';

export const OfficerPerformance = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadPerformance = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getOfficerPerformance();
      if (res && res.data) {
        setData(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load performance metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPerformance();
  }, []);

  if (loading) {
    return (
      <div className="page-wrapper" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingSpinner text="Computing performance metrics..." size="lg" />
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="mb-6">
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Officer Performance Analytics</h1>
        <p className="text-sm text-muted">Your track record of civic task resolutions and turnaround efficiency</p>
      </div>

      <AlertMessage type="danger" message={error} onClose={() => setError('')} />

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#dcfce7', color: '#16a34a' }}>
            <Award size={24} />
          </div>
          <div className="stat-info">
            <h4>Resolution Rate</h4>
            <p>{data?.resolutionRate || 0}%</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#dbeafe', color: '#1d4ed8' }}>
            <CheckCircle size={24} />
          </div>
          <div className="stat-info">
            <h4>Total Resolved</h4>
            <p>{data?.totalResolved || 0}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
            <Clock size={24} />
          </div>
          <div className="stat-info">
            <h4>Avg Resolution Time</h4>
            <p>{data?.averageResolutionTime || 0} <span style={{ fontSize: '1rem', fontWeight: 500 }}>days</span></p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fee2e2', color: '#dc2626' }}>
            <Zap size={24} />
          </div>
          <div className="stat-info">
            <h4>Critical/High Resolved</h4>
            <p>{data?.highPriorityResolved || 0}</p>
          </div>
        </div>
      </div>

      {/* Monthly and Weekly Breakdown Cards */}
      <div className="grid grid-2 gap-6">
        <div className="card">
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem' }} className="flex items-center gap-2">
            <Calendar size={18} /> Monthly Resolutions (Last 12 Months)
          </h2>
          {!data?.monthlyPerformance || data.monthlyPerformance.length === 0 ? (
            <div className="text-sm text-muted p-4 text-center">No monthly history recorded yet.</div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Year - Month</th>
                    <th>Complaints Assigned</th>
                  </tr>
                </thead>
                <tbody>
                  {data.monthlyPerformance.map((m, idx) => (
                    <tr key={idx}>
                      <td>
                        {m._id.year} - {String(m._id.month).padStart(2, '0')}
                      </td>
                      <td className="font-bold">{m.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card">
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem' }} className="flex items-center gap-2">
            <TrendingUp size={18} /> Recent 7 Days Activity
          </h2>
          {!data?.weeklyPerformance || data.weeklyPerformance.length === 0 ? (
            <div className="text-sm text-muted p-4 text-center">No recent 7-day assignments recorded.</div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Day</th>
                    <th>Count</th>
                  </tr>
                </thead>
                <tbody>
                  {data.weeklyPerformance.map((w, idx) => (
                    <tr key={idx}>
                      <td>
                        {w._id.year}-{String(w._id.month).padStart(2, '0')}-{String(w._id.day).padStart(2, '0')}
                      </td>
                      <td className="font-bold">{w.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
