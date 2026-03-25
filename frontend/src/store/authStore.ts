import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserSession } from '../types';

interface AuthState {
  session: UserSession | null;
  setSession: (session: UserSession) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      session: null,

      setSession: (session) => {
        localStorage.setItem('o7tf_token', session.token);
        set({ session });
      },

      logout: () => {
        localStorage.removeItem('o7tf_token');
        set({ session: null });
      },
    }),
    { name: 'o7tf-auth' }
  )
);