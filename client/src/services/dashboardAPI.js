import api from './api';

export const getAdminDashboard = async () => {
  const response = await api.get('/dashboard/admin');
  return response.data;
};

export const getOfficerDashboard = async () => {
  const response = await api.get('/dashboard/officer');
  return response.data;
};

export const getCitizenDashboard = async () => {
  const response = await api.get('/dashboard/citizen');
  return response.data;
};

export const getRecentComplaints = async () => {
  const response = await api.get('/dashboard/recent');
  return response.data;
};

export const getDashboardAnalytics = async () => {
  const response = await api.get('/dashboard/analytics');
  return response.data;
};

export const getDashboardActivity = async () => {
  const response = await api.get('/dashboard/activity');
  return response.data;
};
