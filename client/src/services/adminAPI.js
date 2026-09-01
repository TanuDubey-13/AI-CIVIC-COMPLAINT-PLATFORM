import api from './api';

// User Management
export const getAllUsers = async (params = {}) => {
  const response = await api.get('/admin/users', { params });
  return response.data;
};

export const getUserById = async (id) => {
  const response = await api.get(`/admin/users/${id}`);
  return response.data;
};

export const updateUserById = async (id, data) => {
  const response = await api.put(`/admin/users/${id}`, data);
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await api.delete(`/admin/users/${id}`);
  return response.data;
};

export const blockUser = async (id) => {
  const response = await api.patch(`/admin/users/${id}/block`);
  return response.data;
};

export const unblockUser = async (id) => {
  const response = await api.patch(`/admin/users/${id}/unblock`);
  return response.data;
};

// Officer Management
export const createOfficer = async (data) => {
  const response = await api.post('/admin/officers', data);
  return response.data;
};

export const getAllOfficers = async () => {
  const response = await api.get('/admin/officers');
  return response.data;
};

export const getOfficerById = async (id) => {
  const response = await api.get(`/admin/officers/${id}`);
  return response.data;
};

export const updateOfficerById = async (id, data) => {
  const response = await api.put(`/admin/officers/${id}`, data);
  return response.data;
};

export const deleteOfficer = async (id) => {
  const response = await api.delete(`/admin/officers/${id}`);
  return response.data;
};

// Complaint Management
export const getAdminComplaints = async (params = {}) => {
  const response = await api.get('/admin/complaints', { params });
  return response.data;
};

export const getAdminComplaintById = async (id) => {
  const response = await api.get(`/admin/complaints/${id}`);
  return response.data;
};

export const assignComplaint = async (id, officerId) => {
  const response = await api.put(`/admin/complaints/${id}/assign`, { officerId });
  return response.data;
};

export const updateComplaintStatus = async (id, status) => {
  const response = await api.put(`/admin/complaints/${id}/status`, { status });
  return response.data;
};

export const deleteComplaint = async (id) => {
  const response = await api.delete(`/admin/complaints/${id}`);
  return response.data;
};

// Reports and Health
export const getAdminStatistics = async () => {
  const response = await api.get('/admin/statistics');
  return response.data;
};

export const getRecentUsersList = async () => {
  const response = await api.get('/admin/recent-users');
  return response.data;
};

export const getRecentComplaintsList = async () => {
  const response = await api.get('/admin/recent-complaints');
  return response.data;
};

export const getSystemHealthReport = async () => {
  const response = await api.get('/admin/system-health');
  return response.data;
};
