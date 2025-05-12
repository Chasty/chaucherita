import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          // In a real app, this would be a call to Firebase/Supabase
          // Simulating API call with timeout
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Mock successful login
          if (email && password) {
            set({ 
              user: { id: '1', email, name: email.split('@')[0] },
              isAuthenticated: true,
              isLoading: false
            });
          } else {
            throw new Error("Invalid credentials");
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : "Login failed", 
            isLoading: false 
          });
        }
      },
      
      register: async (email, password, name) => {
        set({ isLoading: true, error: null });
        try {
          // In a real app, this would be a call to Firebase/Supabase
          // Simulating API call with timeout
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Mock successful registration
          if (email && password) {
            set({ 
              user: { id: '1', email, name },
              isAuthenticated: true,
              isLoading: false
            });
          } else {
            throw new Error("Invalid registration data");
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : "Registration failed", 
            isLoading: false 
          });
        }
      },
      
      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
      
      clearError: () => {
        set({ error: null });
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);