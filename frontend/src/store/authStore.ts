// src/store/authStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '@/types'; // Using path alias

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean; // For initial auth check
  login: (userData: User, token: string) => void;
  signup: (userData: User, token: string) => void;
  logout: () => void;
  setUser: (userData: User | null) => void;
  checkAuth: () => void; // To explicitly check auth status if needed
  setIsLoading: (loading: boolean) => void; // To control loading state externally
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true, // Start true to allow for initial auth check

      login: (userData, token) => {
        set({ user: userData, token, isAuthenticated: true, isLoading: false });
      },

      signup: (userData, token) => {
        // In our backend, signup response includes user data and token
        set({ user: userData, token, isAuthenticated: true, isLoading: false });
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false, isLoading: false });
      },

      setUser: (userData) => {
        set({ user: userData, isAuthenticated: !!userData, isLoading: false });
      },

      setIsLoading: (loading) => {
        set({ isLoading: loading });
      },

      checkAuth: () => {
        const token = get().token;
        // This is a basic check. A more robust check would involve verifying the token with the backend.
        if (token) {
          set({ isAuthenticated: true, isLoading: false });
        } else {
          set({ user: null, token: null, isAuthenticated: false, isLoading: false });
        }
      }
    }),
    {
      name: 'auth-storage-ts',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user, token: state.token }), // Only persist user and token
      onRehydrateStorage: () => (state) => { // Handle initial loading state after rehydration
        if (state) {
            state.isLoading = false; // Set loading to false after rehydration attempt
            state.isAuthenticated = !!state.token; // Ensure isAuthenticated is correctly set
        }
      }
    }
  )
);

// Call checkAuth on initial load if you want to immediately update isLoading based on persisted token
// This helps ProtectedRoute to wait for this check.
// useAuthStore.getState().checkAuth();
// The onRehydrateStorage now helps manage isLoading state more effectively.