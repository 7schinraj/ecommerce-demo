import { create } from 'zustand';

const AUTH_USER_KEY = 'user';
const AUTH_REFRESH_KEY = 'refresh';

export const useAuthStore = create((set, get) => ({
  user: (() => {
    try {
      const stored = localStorage.getItem(AUTH_USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  })(),
  accessToken: null,
  refreshToken: localStorage.getItem(AUTH_REFRESH_KEY) || null,
  isAuthenticated: () => !!get().user && (!!get().accessToken || !!get().refreshToken),

  setAuth: (user, accessToken, refreshToken) => {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    if (refreshToken) {
      localStorage.setItem(AUTH_REFRESH_KEY, refreshToken);
    }
    set({
      user,
      accessToken,
      ...(refreshToken ? { refreshToken } : {}),
    });
  },

  updateAccessToken: (accessToken) => {
    set({ accessToken });
  },

  clearAuth: () => {
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem(AUTH_REFRESH_KEY);
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
    });
  },
}));
