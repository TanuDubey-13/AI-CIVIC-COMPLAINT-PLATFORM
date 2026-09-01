import React, { useState, useEffect } from 'react';
import * as adminAPI from '../services/adminAPI';
import { StatusBadge, PriorityBadge } from '../components/Badges';
import { LoadingSpinner, AlertMessage } from '../components/CommonUI';
import {
  Search,
  Filter,
  UserCheck,
  Trash2,
  Edit,
  Eye,
  CheckCircle,
  X,
  AlertTriangle,
  Building,
} from 'lucide-react';

export const AdminComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  // Assign Modal
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [selectedOfficerId, setSelectedOfficerId] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);

  // Status Modal
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('In Progress');
  const [statusLoading, setStatusLoading] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (categoryFilter) params.category = categoryFilter;
      if (priorityFilter) params.priority = priorityFilter;

      const [compRes, offRes] = await Promise.all([
        adminAPI.getAdminComplaints(params),
        adminAPI.getAllOfficers().catch(() => ({ officers: [] })),
      ]);

      if (compRes && compRes.complaints) {
        setComplaints(compRes.complaints);
      }
      if (offRes && offRes.officers) {
        setOfficers(offRes.officers);
      }
    } catch (err) {
      setError(err.message || 'Failed to load complaints.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, categoryFilter, priorityFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadData();
  };

  const openAssignModal = (complaint) => {
    setSelectedComplaint(complaint);
    setSelectedOfficerId(complaint.assignedOfficer?._id || complaint.assignedOfficer?.id || '');
    setAssignModalOpen(true);
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOfficerId) {
      setError('Please select an officer to assign.');
      return;
    }

    setAssignLoading(true);
    setError('');
    try {
      await adminAPI.assignComplaint(selectedComplaint.id || selectedComplaint._id, selectedOfficerId);
      setSuccess('Complaint assigned successfully!');
      setAssignModalOpen(false);
      loadData();
    } catch (err) {
      setError(err.message || 'Failed to assign complaint.');
    } finally {
      setAssignLoading(false);
    }
  };

  const openStatusModal = (complaint) => {
    setSelectedComplaint(complaint);
    setNewStatus(complaint.status || 'In Progress');
    setStatusModalOpen(true);
  };

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    setStatusLoading(true);
    setError('');
    try {
      await adminAPI.updateComplaintStatus(selectedComplaint.id || selectedComplaint._id, newStatus);
      setSuccess('Status updated successfully!');
      setStatusModalOpen(false);
      loadData();
    } catch (err) {
      setError(err.message || 'Failed to update status.');
    } finally {
      setStatusLoading(false);
    }
  };

  const handleDeleteComplaint = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this complaint?')) return;

    try {
      await adminAPI.deleteComplaint(id);
      setSuccess('Complaint deleted successfully.');
      loadData();
    } catch (err) {
      setError(err.message || 'Failed to delete complaint.');
    }
  };

  return (
    <div className="page-wrapper">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>City Complaints Registry</h1>
          <p className="text-sm text-muted">Administer all municipal complaints, assign field officers, and supervise status</p>
        </div>
      </div>

      <AlertMessage type="danger" message={error} onClose={() => setError('')} />
      <AlertMessage type="success" message={success} onClose={() => setSuccess('')} />

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
              placeholder="Search title, description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>

          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: 'auto' }}
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Rejected">Rejected</option>
          </select>

          <select
            className="form-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ width: 'auto' }}
          >
            <option value="">All Categories</option>
            <option value="Road Damage">Road Damage</option>
            <option value="Garbage">Garbage</option>
            <option value="Water Leakage">Water Leakage</option>
            <option value="Street Light">Street Light</option>
            <option value="Drainage">Drainage</option>
            <option value="Electricity">Electricity</option>
            <option value="Sewage">Sewage</option>
            <option value="Other">Other</option>
          </select>

          <button type="submit" className="btn btn-secondary btn-sm">
            Search
          </button>
        </form>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner text="Loading city complaints..." size="lg" />
      ) : complaints.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📭</div>
          <h3 className="font-bold text-main">No Complaints Found</h3>
          <p className="text-sm text-muted mt-1">Try clearing filters or search term.</p>
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
                <th>Assigned Officer</th>
                <th>Reported By</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map((c) => (
                <tr key={c.id || c._id}>
                  <td>
                    <div className="font-semibold text-main">{c.title}</div>
                    <div className="text-xs text-muted">ID: {c.id || c._id}</div>
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
                      <div>
                        <div className="font-semibold text-primary">{c.assignedOfficer.name}</div>
                        <div className="text-muted">{c.assignedOfficer.department || 'Officer'}</div>
                      </div>
                    ) : (
                      <span className="badge badge-pending">Unassigned</span>
                    )}
                  </td>
                  <td className="text-xs">
                    <div>{c.citizen?.name || 'Citizen'}</div>
                    <div className="text-muted">{c.citizen?.email}</div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openAssignModal(c)}
                        className="btn btn-outline btn-sm"
                        title="Assign Field Officer"
                      >
                        <UserCheck size={14} /> Assign
                      </button>

                      <button
                        type="button"
                        onClick={() => openStatusModal(c)}
                        className="btn btn-secondary btn-sm"
                        title="Update Status"
                      >
                        <Edit size={14} /> Status
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteComplaint(c.id || c._id)}
                        className="btn btn-danger btn-sm"
                        style={{ padding: '0.375rem 0.5rem' }}
                        title="Delete Complaint"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Assign Modal */}
      {assignModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="font-bold text-base">Assign Field Officer</h3>
              <button
                type="button"
                onClick={() => setAssignModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAssignSubmit}>
              <div className="modal-body">
                <p className="text-sm text-muted mb-4">
                  Assigning complaint: <strong>{selectedComplaint?.title}</strong>
                </p>

                <div className="form-group">
                  <label className="form-label" htmlFor="officerSelect">
                    Select Field Officer
                  </label>
                  <select
                    id="officerSelect"
                    className="form-select"
                    value={selectedOfficerId}
                    onChange={(e) => setSelectedOfficerId(e.target.value)}
                    required
                  >
                    <option value="">-- Choose an Officer --</option>
                    {officers.map((off) => (
                      <option key={off.id || off._id} value={off.id || off._id}>
                        {off.name} ({off.department || 'General Officer'}) - {off.email}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setAssignModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={assignLoading}>
                  {assignLoading ? 'Assigning...' : 'Confirm Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Status Modal */}
      {statusModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="font-bold text-base">Update Complaint Status</h3>
              <button
                type="button"
                onClick={() => setStatusModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleStatusSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label" htmlFor="statusSelect">
                    Select New Status
                  </label>
                  <select
                    id="statusSelect"
                    className="form-select"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setStatusModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={statusLoading}>
                  {statusLoading ? 'Updating...' : 'Save Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
