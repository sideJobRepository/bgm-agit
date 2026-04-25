import { create } from 'zustand';

export interface RoleItem {
  memberId: number;
  roleId: number;
  memberName: string;
  roleName: string;
  memberEmail: string;
  memberPhoneNo: string;
  memberLoginType: string;
}

export interface RolePage {
  content: RoleItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

interface RoleStore {
  role: RolePage | null;
  setRole: (role: RolePage) => void;
}

export const useRoleStore = create<RoleStore>((set) => ({
  role: null,
  setRole: (role) => set({ role }),
}));
