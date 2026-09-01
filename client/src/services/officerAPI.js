import api from './api';

export const getOfficerDashboard = async () => {
  const response = await api.get('/officer/dashboard');
  return response.data;
};

export const getOfficerComplaints = async (params = {}) => {
  const response = await api.get('/officer/complaints', { params });
  return response.data;
};

export const getOfficerComplaintById = async (id) => {
  const response = await api.get(`/officer/complaints/${id}`);
  return response.data;
};

export const updateComplaintStatus = async (id, data) => {
  const response = await api.put(`/officer/complaints/${id}/status`, data);
  return response.data;
};

export const updateComplaintPriority = async (id, priority) => {
  const response = await api.put(`/officer/complaints/${id}/priority`, { priority });
  return response.data;
};

export const addOfficerNote = async (id, note) => {
  const response = await api.put(`/officer/complaints/${id}/note`, { note });
  return response.data;
};

export const markLocationVisited = async (id) => {
  const response = await api.put(`/officer/complaints/${id}/location-visit`);
  return response.data;
};

export const uploadProof = async (id, formData) => {
  const response = await api.put(`/officer/complaints/${id}/upload-proof`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getOfficerProfile = async () => {
  const response = await api.get('/officer/profile');
  return response.data;
};

export const updateOfficerProfile = async (formData) => {
  const response = await api.put('/officer/profile', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getOfficerPerformance = async () => {
  const response = await api.get('/officer/performance');
  return response.data;
};

export const getOfficerNotifications = async (params = {}) => {
  const response = await api.get('/officer/notifications', { params });
  return response.data;
};

export const markOfficerNotification = async (id) => {
  const response = await api.patch(`/officer/notifications/${id}/read`);
  return response.data;
};
