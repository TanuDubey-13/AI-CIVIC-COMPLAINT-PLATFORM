const API_BASE_URL = '/api/auth';

export const login = async (credentials) => {
  return { success: true, message: 'Login endpoint ready', credentials };
};

export const register = async (userData) => {
  return { success: true, message: 'Register endpoint ready', userData };
};
