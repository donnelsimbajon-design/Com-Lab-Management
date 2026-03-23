import { create } from 'zustand';
import { User } from './types';
import { generateToken, verifyToken, refreshToken, getSessionTimeRemaining } from './security/auth';
import { generateCsrfToken, clearCsrfToken } from './security/csrf';
import { logAudit } from './security/audit-log';
import { useAppStore } from './store';

interface AuthState {
  currentUser: User | null;
  token: string | null;
  csrfToken: string | null;
  sessionMinutes: number;
  isAuthenticated: boolean;

  login: (schoolId: string, birthday: string) => User | null;
  logout: () => void;
  setUser: (user: User) => void;
  refreshSession: () => boolean;
  checkSession: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  currentUser: null,
  token: null,
  csrfToken: null,
  sessionMinutes: 0,
  isAuthenticated: false,

  login: (schoolId, birthday) => {
    // Search the live Supabase-synced users array from the app store
    const users = useAppStore.getState().users;
    const user = users.find(
      (u) => u.schoolId === schoolId && u.birthday === birthday
    );
    if (user) {
      const token = generateToken(user.id, user.role, user.schoolId);
      const csrf = generateCsrfToken();
      set({
        currentUser: user,
        token,
        csrfToken: csrf,
        sessionMinutes: 30,
        isAuthenticated: true,
      });
      logAudit('LOGIN', user.id, user.name, user.role, `Logged in from school ID: ${schoolId}`);
      return user;
    }
    logAudit('LOGIN_FAILED', 'unknown', 'unknown', 'unknown', `Failed login attempt with ID: ${schoolId}`);
    return null;
  },

  logout: () => {
    const { currentUser } = get();
    if (currentUser) {
      logAudit('LOGOUT', currentUser.id, currentUser.name, currentUser.role, 'User logged out');
    }
    clearCsrfToken();
    set({
      currentUser: null,
      token: null,
      csrfToken: null,
      sessionMinutes: 0,
      isAuthenticated: false,
    });
  },

  setUser: (user) => set({ currentUser: user }),

  refreshSession: () => {
    const { token } = get();
    if (!token) return false;
    const newToken = refreshToken(token);
    if (newToken) {
      set({ token: newToken, sessionMinutes: 30 });
      return true;
    }
    // Session expired — force logout
    get().logout();
    return false;
  },

  checkSession: () => {
    const { token } = get();
    if (!token) return false;
    const remaining = getSessionTimeRemaining(token);
    if (remaining <= 0) {
      get().logout();
      return false;
    }
    set({ sessionMinutes: remaining });
    return true;
  },
}));
