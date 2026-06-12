import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null, accessToken: null, refreshToken: null, isAuthenticated: false,
      login: (user, accessToken, refreshToken) =>
        set({ user, accessToken, refreshToken, isAuthenticated: true }),
      setUser: u => set({ user: u }),
      setTokens: (a, r) => set({ accessToken: a, refreshToken: r }),
      logout: () => set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false }),
    }),
    {
      name: 'bh-auth',
      // sessionStorage = each tab has its own isolated auth
      // Tab A logged in as Hospital, Tab B can login as Donor — independent
      storage: createJSONStorage(() => sessionStorage),
      partialize: s => ({
        user: s.user, accessToken: s.accessToken,
        refreshToken: s.refreshToken, isAuthenticated: s.isAuthenticated,
      }),
      merge: (p, c) => ({ ...c, ...p }),
    }
  )
)
