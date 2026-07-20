const API_BASE_URL = '/api/complaints';

export const getComplaints = async () => {
  return { success: true, message: 'Complaint list endpoint ready' };
};

export const createComplaint = async (data) => {
  return { success: true, message: 'Complaint create endpoint ready', data };
};

export const getComplaintById = async (id) => {
  return { success: true, message: `Complaint ${id} endpoint ready` };
};
