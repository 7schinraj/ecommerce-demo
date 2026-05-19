import api from '../../../services/api';
import { API_ROUTES } from '../../../config';

export const authApi = {
  login: async ({ email, password }) => {
    const response = await api.post(API_ROUTES.auth.login, { email, password });
    return response.data.data;
  },

  signup: async ({ username, email, password, role = 'customer' }) => {
    const response = await api.post(API_ROUTES.auth.signup, {
      username,
      email,
      password,
      role,
    });
    return response.data.data;
  },
};

export default authApi;
