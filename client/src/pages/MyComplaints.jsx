import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyComplaints } from '../services/complaintAPI';
import { StatusBadge, PriorityBadge } from '../components/Badges';
import { LoadingSpinner, AlertMessage } from '../components/CommonUI';
import { PlusCircle, Search, Filter, Image as ImageIcon, MapPin, Calendar } from 'lucide-react';

export const MyComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const loadComplaints = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getMyComplaints();
      if (res && res.complaints) {
        setComplaints(res.complaints);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch complaints.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, []);

  const filteredComplaints = complaints.filter((item) => {
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    const matchesSearch =
      !search ||
      item.title?.toLowerCase().includes(search.toLowerCase()) ||
      item.category?.toLowerCase().includes(search.toLowerCase()) ||
      item.description?.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="page-wrapper">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>My Filed Complaints</h1>
          <p className="text-sm text-muted">Track the resolution lifecycle of all your reported issues</p>
        </div>
        <Link to="/citizen/create-complaint" className="btn btn-primary">
          <PlusCircle size={18} /> File New Complaint
        </Link>
      </div>

      <AlertMessage type="danger" message={error} onClose={() => setError('')} />

      {/* Filters bar */}
      <div className="card mb-6" style={{ padding: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
            <Search
              size={18}
              color="#94a3b8"
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              className="form-control"
              placeholder="Search by title, keyword, category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={18} color="#64748b" />
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: 'auto' }}
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Complaints List */}
      {loading ? (
        <LoadingSpinner text="Fetching your complaints..." size="lg" />
      ) : filteredComplaints.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📋</div>
          <h3 className="font-bold text-main">No Complaints Found</h3>
          <p className="text-sm text-muted mt-1 mb-4">
            {search || statusFilter !== 'All'
              ? 'Try adjusting your search query or status filter.'
              : 'You have not submitted any complaints yet.'}
          </p>
          <Link to="/citizen/create-complaint" className="btn btn-primary btn-sm">
            <PlusCircle size={16} /> File a Complaint
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {filteredComplaints.map((item) => (
            <div key={item._id} className="card flex flex-col justify-between" style={{ padding: '1.25rem' }}>
              <div>
                {item.image && (
                  <div style={{ width: '100%', height: '160px', borderRadius: '8px', overflow: 'hidden', marginBottom: '1rem', backgroundColor: '#f1f5f9' }}>
                    <img
                      src={item.image}
                      alt={item.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                )}

                <div className="flex items-center gap-2 mb-2">
                  <StatusBadge status={item.status} />
                  <PriorityBadge priority={item.priority} />
                  <span className="badge" style={{ background: '#f1f5f9', color: '#475569' }}>
                    {item.category}
                  </span>
                </div>

                <h3 className="font-bold text-main text-base mb-1" style={{ lineHeight: 1.3 }}>
                  {item.title}
                </h3>

                <p className="text-sm text-muted mb-3" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {item.description}
                </p>

                {item.location?.address && (
                  <div className="flex items-center gap-1 text-xs text-muted mb-2">
                    <MapPin size={14} className="flex-shrink-0" />
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.location.address}
                    </span>
                  </div>
                )}
              </div>

              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem', marginTop: '0.75rem' }} className="flex justify-between items-center">
                <span className="text-xs text-muted flex items-center gap-1">
                  <Calendar size={12} /> {new Date(item.createdAt).toLocaleDateString()}
                </span>
                <Link to={`/citizen/complaint/${item._id}`} className="btn btn-outline btn-sm">
                  View Timeline
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
