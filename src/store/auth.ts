import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { UserSession } from '@/types/auth';

interface AuthState {
  user: UserSession | null;
  token: string | null;
  isAuthenticated: boolean;
  
  // Actions
  setAuth: (token: string, user: UserSession) => void;
  logout: () => void;
  updateUser: (user: Partial<UserSession>) => void;
  getDashboardRoute: () => string;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (token: string, user: UserSession) => {
        set({
          token,
          user,
          isAuthenticated: true,
        });
        
        // Also set as cookie for middleware
        if (typeof window !== 'undefined') {
          document.cookie = `auth-token=${token}; path=/; max-age=${7 * 24 * 60 * 60}`; // 7 days
        }
      },

      logout: () => {
        // Call logout API to clear server-side cookie
        fetch('/api/auth/logout', { method: 'POST' }).catch(() => {
          // Ignore errors, proceed with client-side logout
        });

        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
        
        // Clear cookie
        if (typeof window !== 'undefined') {
          document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          // Redirect to home page
          window.location.href = '/';
        }
      },

      updateUser: (userData: Partial<UserSession>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, ...userData },
          });
        }
      },

      getDashboardRoute: () => {
        const user = get().user;
        if (!user) return '/auth';
        
        switch (user.role) {
          case 'admin':
            return '/dashboard/admin';
          case 'shipper':
            return '/dashboard/shipper';
          case 'carrier':
          case 'driver':
            return '/dashboard/carrier';
          default:
            return '/auth';
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Helper function to get auth headers for API calls
export const getAuthHeaders = (): Record<string, string> => {
  const token = useAuthStore.getState().token;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Helper function for authenticated fetch
export const fetchWithAuth = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeaders(),
    ...options.headers,
  };

  return fetch(url, {
    ...options,
    headers,
  });
};