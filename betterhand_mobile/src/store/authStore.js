import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useAuthStore = create((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isHydrated: false, // Wait until storage is loaded

  login: async (userData, tokens) => {
    await AsyncStorage.setItem('accessToken', tokens.access);
    await AsyncStorage.setItem('refreshToken', tokens.refresh);
    set({
      user: userData,
      accessToken: tokens.access,
      refreshToken: tokens.refresh,
      isAuthenticated: true,
    });
  },

  logout: async () => {
    await AsyncStorage.removeItem('accessToken');
    await AsyncStorage.removeItem('refreshToken');
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    });
  },

  setHydrated: () => set({ isHydrated: true }),
}));

// Hydrate store from AsyncStorage on startup
const hydrateAuth = async () => {
  try {
    const access = await AsyncStorage.getItem('accessToken');
    const refresh = await AsyncStorage.getItem('refreshToken');
    if (access && refresh) {
      useAuthStore.setState({
        accessToken: access,
        refreshToken: refresh,
        isAuthenticated: true,
        // Wait for profile fetch to populate `user` object properly, but set authenticated
      });
    }
  } catch (error) {
    console.error('Failed to hydrate auth state:', error);
  } finally {
    useAuthStore.getState().setHydrated();
  }
};

hydrateAuth();
