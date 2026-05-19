// Application configuration settings

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const API_ROUTES = {
  auth: {
    signup: `${API_BASE_URL}/api/auth/signup/`,
    login: `${API_BASE_URL}/api/auth/login/`,
    refresh: `${API_BASE_URL}/api/auth/token/refresh/`,
    verify: `${API_BASE_URL}/api/auth/token/verify/`,
  },
  products: {
    base: `${API_BASE_URL}/api/v1/products/`,
  }
};
