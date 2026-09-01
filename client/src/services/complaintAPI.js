import api from './api';

export const createComplaint = async (formData) => {
  const response = await api.post('/complaints/create', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getMyComplaints = async () => {
  const response = await api.get('/complaints/my');
  return response.data;
};

export const getAllComplaints = async (params = {}) => {
  const response = await api.get('/complaints', { params });
  return response.data;
};

export const getComplaints = getAllComplaints;

export const getComplaintById = async (id) => {
  const response = await api.get(`/complaints/${id}`);
  return response.data;
};

export const updateComplaint = async (id, data) => {
  const response = await api.put(`/complaints/${id}`, data);
  return response.data;
};

export const deleteComplaint = async (id) => {
  const response = await api.delete(`/complaints/${id}`);
  return response.data;
};

export const getComplaintStats = async () => {
  const response = await api.get('/complaints/stats');
  return response.data;
};
