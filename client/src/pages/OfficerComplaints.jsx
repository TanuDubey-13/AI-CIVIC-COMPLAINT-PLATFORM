import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getOfficerComplaints } from '../services/officerAPI';
import { StatusBadge, PriorityBadge } from '../components/Badges';
import { LoadingSpinner, AlertMessage } from '../components/CommonUI';
import { Search, Filter, Calendar, MapPin, CheckSquare, ArrowRight } from 'lucide-react';

export const OfficerComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  const loadComplaints = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (search) params.search = search;
      if (statusFilter !== 'All') params.status = statusFilter;
      if (priorityFilter !== 'All') params.priority = priorityFilter;

      const res = await getOfficerComplaints(params);
      if (res && res.complaints) {
        setComplaints(res.complaints);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch assigned complaints.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, [statusFilter, priorityFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadComplaints();
  };

  return (
    <div className="page-wrapper">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Assigned Civic Complaints</h1>
          <p className="text-sm text-muted">Field tasks assigned to your department for resolution</p>
        </div>
      </div>

      <AlertMessage type="danger" message={error} onClose={() => setError('')} />

      {/* Filter Bar */}
      <div className="card mb-6" style={{ padding: '1rem' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
            <Search
              size={18}
              color="#94a3b8"
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              className="form-control"
              placeholder="Search by title or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: 'auto' }}
            >
              <option value="All">All Statuses</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Rejected">Rejected</option>
            </select>

            <select
              className="form-select"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              style={{ width: 'auto' }}
            >
              <option value="All">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            <button type="submit" className="btn btn-secondary btn-sm">
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner text="Fetching assigned tasks..." size="lg" />
      ) : complaints.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🎉</div>
          <h3 className="font-bold text-main">No Assigned Complaints Match</h3>
          <p className="text-sm text-muted mt-1">All clear or try removing filters.</p>
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
                <th>Reported By</th>
                <th>Assigned Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map((c) => (
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
                    {c.citizen?.name || 'Citizen'}
                  </td>
                  <td className="text-xs text-muted">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <Link
                      to={`/officer/complaint/${c.id || c._id}`}
                      className="btn btn-primary btn-sm"
                    >
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
  );
};
