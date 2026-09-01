import api from './api';

export const analyzeComplaint = async (data) => {
  const response = await api.post('/ai/analyze', data);
  return response.data;
};
