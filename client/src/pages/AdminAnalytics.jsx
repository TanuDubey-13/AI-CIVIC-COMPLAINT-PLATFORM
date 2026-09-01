import React, { useState, useEffect } from 'react';
import { getDashboardAnalytics } from '../services/dashboardAPI';
import { LoadingSpinner, AlertMessage } from '../components/CommonUI';
import { BarChart3, PieChart, TrendingUp, Calendar, Layers } from 'lucide-react';

export const AdminAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getDashboardAnalytics();
      if (res && res.data) {
        setData(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="page-wrapper" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingSpinner text="Aggregating city-wide civic analytics..." size="lg" />
      </div>
    );
  }

  const totalComplaints = (data?.statusWise || []).reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div className="page-wrapper">
      <div className="mb-6">
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>City-wide Civic Analytics</h1>
        <p className="text-sm text-muted">Comprehensive aggregated data across categories, departments, priorities, and monthly volume</p>
      </div>

      <AlertMessage type="danger" message={error} onClose={() => setError('')} />

      {/* Grid of Analytics Breakdowns */}
      <div className="grid grid-2 gap-6 mb-6">
        {/* Category Breakdown */}
        <div className="card">
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem' }} className="flex items-center gap-2">
            <Layers size={18} /> Category Distribution
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {(data?.categoryWise || []).map((item) => {
              const pct = totalComplaints > 0 ? Math.round((item.count / totalComplaints) * 100) : 0;
              return (
                <div key={item.category}>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>{item.category}</span>
                    <span>{item.count} ({pct}%)</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: '#2563eb', borderRadius: '4px' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="card">
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem' }} className="flex items-center gap-2">
            <PieChart size={18} /> Status Distribution
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {(data?.statusWise || []).map((item) => {
              const pct = totalComplaints > 0 ? Math.round((item.count / totalComplaints) * 100) : 0;
              const colorMap = {
                Pending: '#d97706',
                Assigned: '#0284c7',
                'In Progress': '#7c3aed',
                Resolved: '#16a34a',
                Rejected: '#dc2626',
              };
              return (
                <div key={item.status}>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>{item.status}</span>
                    <span>{item.count} ({pct}%)</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: colorMap[item.status] || '#64748b', borderRadius: '4px' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Monthly Trends Table */}
      <div className="card mb-6">
        <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem' }} className="flex items-center gap-2">
          <Calendar size={18} /> 12-Month Incident Volume
        </h2>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Year</th>
                <th>Reported Volume</th>
              </tr>
            </thead>
            <tbody>
              {(data?.monthlyComplaints || []).map((m, idx) => (
                <tr key={idx}>
                  <td className="font-semibold">{m.month}</td>
                  <td className="text-muted">{m.year}</td>
                  <td className="font-bold text-primary">{m.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
