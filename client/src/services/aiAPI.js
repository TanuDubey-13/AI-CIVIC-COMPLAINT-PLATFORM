const API_BASE_URL = '/api/ai';

export const analyzeComplaint = async (payload) => {
  return { success: true, message: 'AI analysis endpoint ready', payload };
};
