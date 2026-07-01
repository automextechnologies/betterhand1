import { apiClient } from './client';

export const authApi = {
  login: async (credentials) => {
    const { data } = await apiClient.post('auth/login/', credentials);
    return data;
  },
  register: async (userData) => {
    const { data } = await apiClient.post('auth/register/', userData);
    return data;
  },
  getProfile: async () => {
    const { data } = await apiClient.get('auth/me/');
    return data;
  },
};
