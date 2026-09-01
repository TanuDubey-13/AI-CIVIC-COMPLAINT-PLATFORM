import React, { useState, useEffect } from 'react';
import * as adminAPI from '../services/adminAPI';
import { LoadingSpinner, AlertMessage } from '../components/CommonUI';
import {
  UserCheck,
  PlusCircle,
  Building,
  Mail,
  Phone,
  Edit,
  Trash2,
  X,
  Shield,
} from 'lucide-react';

export const AdminOfficers = () => {
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Create Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    department: '',
  });
  const [createLoading, setCreateLoading] = useState(false);

  // Edit Modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedOfficer, setSelectedOfficer] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    phone: '',
    department: '',
  });
  const [editLoading, setEditLoading] = useState(false);

  const loadOfficers = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await adminAPI.getAllOfficers();
      if (res && res.officers) {
        setOfficers(res.officers);
      }
    } catch (err) {
      setError(err.message || 'Failed to load field officers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOfficers();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!createFormData.name || !createFormData.email || !createFormData.password || !createFormData.phone) {
      setError('Name, email, password, and phone are required.');
      return;
    }

    setCreateLoading(true);
    setError('');
    try {
      await adminAPI.createOfficer(createFormData);
      setSuccess(`Officer account for ${createFormData.email} created successfully!`);
      setCreateModalOpen(false);
      setCreateFormData({ name: '', email: '', password: '', phone: '', department: '' });
      loadOfficers();
    } catch (err) {
      setError(err.message || 'Failed to create officer account.');
    } finally {
      setCreateLoading(false);
    }
  };

  const openEditModal = (officer) => {
    setSelectedOfficer(officer);
    setEditFormData({
      name: officer.name || '',
      phone: officer.phone || '',
      department: officer.department || '',
    });
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setError('');
    try {
      await adminAPI.updateOfficerById(selectedOfficer.id, editFormData);
      setSuccess('Officer updated successfully.');
      setEditModalOpen(false);
      loadOfficers();
    } catch (err) {
      setError(err.message || 'Failed to update officer.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteOfficer = async (id) => {
    if (!window.confirm('Are you sure you want to delete this officer account?')) return;

    try {
      await adminAPI.deleteOfficer(id);
      setSuccess('Officer account removed.');
      loadOfficers();
    } catch (err) {
      setError(err.message || 'Failed to delete officer.');
    }
  };

  return (
    <div className="page-wrapper">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Field Officers Management</h1>
          <p className="text-sm text-muted">Create officer accounts, assign municipal departments, and manage credentials</p>
        </div>
        <button
          type="button"
          onClick={() => setCreateModalOpen(true)}
          className="btn btn-primary"
        >
          <PlusCircle size={18} /> Create Officer Account
        </button>
      </div>

      <AlertMessage type="danger" message={error} onClose={() => setError('')} />
      <AlertMessage type="success" message={success} onClose={() => setSuccess('')} />

      {loading ? (
        <LoadingSpinner text="Loading officers..." size="lg" />
      ) : officers.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>👷</div>
          <h3 className="font-bold text-main">No Field Officers Registered</h3>
          <p className="text-sm text-muted mt-1 mb-4">Add your first field officer to start routing complaints.</p>
          <button
            type="button"
            onClick={() => setCreateModalOpen(true)}
            className="btn btn-primary btn-sm"
          >
            <PlusCircle size={16} /> Create Officer Account
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
          {officers.map((off) => (
            <div key={off.id} className="card flex flex-col justify-between" style={{ padding: '1.25rem' }}>
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '50%',
                      background: '#ede9fe',
                      color: '#7c3aed',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '1.125rem',
                    }}
                  >
                    {off.name?.charAt(0) || 'O'}
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-main">{off.name}</h3>
                    <span className="badge badge-officer">Field Officer</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.75rem' }}>
                  <div className="flex items-center gap-2 text-xs text-muted">
                    <Building size={14} /> <strong>Department:</strong> {off.department || 'General Operations'}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted">
                    <Mail size={14} /> {off.email}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted">
                    <Phone size={14} /> {off.phone || 'No phone'}
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem', marginTop: '1rem' }} className="flex justify-between items-center">
                <span className="text-xs text-muted">
                  Joined: {new Date(off.createdAt).toLocaleDateString()}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openEditModal(off)}
                    className="btn btn-outline btn-sm"
                    title="Edit Officer"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteOfficer(off.id)}
                    className="btn btn-danger btn-sm"
                    style={{ padding: '0.375rem 0.5rem' }}
                    title="Delete Officer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Officer Modal */}
      {createModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="font-bold text-base">Create New Field Officer</h3>
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label" htmlFor="createName">
                    Officer Full Name *
                  </label>
                  <input
                    type="text"
                    id="createName"
                    className="form-control"
                    placeholder="Officer John Smith"
                    value={createFormData.name}
                    onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-2 gap-3">
                  <div className="form-group">
                    <label className="form-label" htmlFor="createEmail">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="createEmail"
                      className="form-control"
                      placeholder="officer@city.gov"
                      value={createFormData.email}
                      onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="createPhone">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="createPhone"
                      className="form-control"
                      placeholder="+1 555 0192"
                      value={createFormData.phone}
                      onChange={(e) => setCreateFormData({ ...createFormData, phone: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-2 gap-3">
                  <div className="form-group">
                    <label className="form-label" htmlFor="createPassword">
                      Temporary Password *
                    </label>
                    <input
                      type="password"
                      id="createPassword"
                      className="form-control"
                      placeholder="••••••••"
                      value={createFormData.password}
                      onChange={(e) => setCreateFormData({ ...createFormData, password: e.target.value })}
                      minLength={8}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="createDept">
                      Department
                    </label>
                    <input
                      type="text"
                      id="createDept"
                      className="form-control"
                      placeholder="e.g. PWD / Waste Management"
                      value={createFormData.department}
                      onChange={(e) => setCreateFormData({ ...createFormData, department: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={createLoading}>
                  {createLoading ? 'Creating...' : 'Create Officer Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Officer Modal */}
      {editModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="font-bold text-base">Edit Officer Details</h3>
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label" htmlFor="editOffName">
                    Officer Full Name
                  </label>
                  <input
                    type="text"
                    id="editOffName"
                    className="form-control"
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="editOffPhone">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="editOffPhone"
                    className="form-control"
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="editOffDept">
                    Department
                  </label>
                  <input
                    type="text"
                    id="editOffDept"
                    className="form-control"
                    value={editFormData.department}
                    onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={editLoading}>
                  {editLoading ? 'Saving...' : 'Update Officer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
