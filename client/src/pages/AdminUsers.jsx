import React, { useState, useEffect } from 'react';
import * as adminAPI from '../services/adminAPI';
import { RoleBadge } from '../components/Badges';
import { LoadingSpinner, AlertMessage } from '../components/CommonUI';
import {
  Users,
  Search,
  Filter,
  UserX,
  UserCheck,
  Edit,
  Trash2,
  X,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('');

  // Edit Modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    phone: '',
    role: 'citizen',
    isActive: true,
  });
  const [editLoading, setEditLoading] = useState(false);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      if (activeFilter) params.isActive = activeFilter;

      const res = await adminAPI.getAllUsers(params);
      if (res && res.users) {
        setUsers(res.users);
      }
    } catch (err) {
      setError(err.message || 'Failed to load user directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [roleFilter, activeFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadUsers();
  };

  const handleToggleBlock = async (user) => {
    try {
      if (user.isActive) {
        await adminAPI.blockUser(user.id);
        setSuccess(`User ${user.email} has been blocked.`);
      } else {
        await adminAPI.unblockUser(user.id);
        setSuccess(`User ${user.email} has been unblocked.`);
      }
      loadUsers();
    } catch (err) {
      setError(err.message || 'Failed to update user block status.');
    }
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setEditFormData({
      name: user.name || '',
      phone: user.phone || '',
      role: user.role || 'citizen',
      isActive: user.isActive !== false,
    });
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setError('');
    try {
      await adminAPI.updateUserById(selectedUser.id, editFormData);
      setSuccess('User updated successfully.');
      setEditModalOpen(false);
      loadUsers();
    } catch (err) {
      setError(err.message || 'Failed to update user details.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this user account?')) return;

    try {
      await adminAPI.deleteUser(id);
      setSuccess('User account deleted.');
      loadUsers();
    } catch (err) {
      setError(err.message || 'Failed to delete user.');
    }
  };

  return (
    <div className="page-wrapper">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>User Management Directory</h1>
          <p className="text-sm text-muted">Manage system users, modify roles, block abuse, and audit verified accounts</p>
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
              placeholder="Search by name, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>

          <select
            className="form-select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{ width: 'auto' }}
          >
            <option value="">All Roles</option>
            <option value="citizen">Citizen</option>
            <option value="officer">Officer</option>
            <option value="admin">Admin</option>
          </select>

          <select
            className="form-select"
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
            style={{ width: 'auto' }}
          >
            <option value="">All Statuses</option>
            <option value="true">Active Only</option>
            <option value="false">Blocked / Inactive</option>
          </select>

          <button type="submit" className="btn btn-secondary btn-sm">
            Search
          </button>
        </form>
      </div>

      {/* Users Table */}
      {loading ? (
        <LoadingSpinner text="Loading user directory..." size="lg" />
      ) : users.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>👥</div>
          <h3 className="font-bold text-main">No Users Found</h3>
          <p className="text-sm text-muted mt-1">Try adjusting search query or filters.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Account Status</th>
                <th>Email Verified</th>
                <th>Registered</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="font-bold text-main">{u.name}</div>
                    <div className="text-xs text-muted">{u.email}</div>
                  </td>
                  <td className="text-xs">{u.phone || 'N/A'}</td>
                  <td>
                    <RoleBadge role={u.role} />
                  </td>
                  <td>
                    {u.isActive ? (
                      <span className="badge badge-resolved">Active</span>
                    ) : (
                      <span className="badge badge-rejected">Blocked</span>
                    )}
                  </td>
                  <td>
                    {u.isVerified ? (
                      <span className="badge badge-resolved flex items-center gap-1">
                        <CheckCircle2 size={12} /> Yes
                      </span>
                    ) : (
                      <span className="badge badge-low flex items-center gap-1">
                        <AlertCircle size={12} /> No
                      </span>
                    )}
                  </td>
                  <td className="text-xs text-muted">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(u)}
                        className="btn btn-outline btn-sm"
                        title="Edit User"
                      >
                        <Edit size={14} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleBlock(u)}
                        className={`btn btn-sm ${u.isActive ? 'btn-secondary' : 'btn-success'}`}
                        title={u.isActive ? 'Block User' : 'Unblock User'}
                      >
                        {u.isActive ? <UserX size={14} color="#dc2626" /> : <UserCheck size={14} />}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteUser(u.id)}
                        className="btn btn-danger btn-sm"
                        title="Delete User"
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

      {/* Edit User Modal */}
      {editModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="font-bold text-base">Edit User Profile</h3>
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
                  <label className="form-label" htmlFor="editName">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="editName"
                    className="form-control"
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="editPhone">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="editPhone"
                    className="form-control"
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  />
                </div>

                <div className="grid grid-2 gap-3">
                  <div className="form-group">
                    <label className="form-label" htmlFor="editRole">
                      Role
                    </label>
                    <select
                      id="editRole"
                      className="form-select"
                      value={editFormData.role}
                      onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                    >
                      <option value="citizen">Citizen</option>
                      <option value="officer">Officer</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="editStatus">
                      Active Status
                    </label>
                    <select
                      id="editStatus"
                      className="form-select"
                      value={editFormData.isActive}
                      onChange={(e) => setEditFormData({ ...editFormData, isActive: e.target.value === 'true' })}
                    >
                      <option value="true">Active</option>
                      <option value="false">Blocked / Inactive</option>
                    </select>
                  </div>
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
                  {editLoading ? 'Saving...' : 'Update User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
