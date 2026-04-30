import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  name: string;
  roles: string[];
}

interface UserStore {
  user: User | null;
  isLoggingOut: boolean;
  setUser: (user: User | null) => void;
  clearUser: () => void;
  setLoggingOut: (value: boolean) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  isLoggingOut: false,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
  setLoggingOut: (value) => set({ isLoggingOut: value }),
}));

interface RecordUser {
  id: number;
  nickName: string;
}

interface RecordUserStore {
  recordUser: RecordUser[] | [];
  setRecordUser: (recordUser: RecordUser[]) => void;
}

export const useRecordUserStore = create<RecordUserStore>((set) => ({
  recordUser: [],
  setRecordUser: (recordUser) => set({ recordUser }),
}));
