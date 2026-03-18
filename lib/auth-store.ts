import { create } from 'zustand';
import { User } from './types';
import { MOCK_USERS } from './mock-data';

interface AuthState {
  currentUser: User | null;
  login: (schoolId: string, birthday: string) => User | null;
  logout: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  currentUser: null,

  login: (schoolId, birthday) => {
    const user = MOCK_USERS.find(
      (u) => u.schoolId === schoolId && u.birthday === birthday
    );
    if (user) {
      set({ currentUser: user });
      return user;
    }
    return null;
  },

  logout: () => set({ currentUser: null }),

  setUser: (user) => set({ currentUser: user }),
}));
