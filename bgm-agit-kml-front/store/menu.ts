import { create } from 'zustand';

interface SubMenuItem {
  id: string;
  icon: string;
  menuName: string;
  menuLink: string;
  menuOrders: number;
  parentMenuId: string;
}

interface MenuItem {
  icon: string;
  id: string;
  menuLink: string;
  menuName: string;
  menuOrders: number;
  subMenus: SubMenuItem[];
}

interface MenuStore {
  menu: MenuItem[] | null;
  setMenu: (menu: MenuItem[]) => void;
  clearMenu: () => void;
}

export const useKmlMenuStore = create<MenuStore>((set) => ({
  menu: null,
  setMenu: (menu) => set({ menu }),
  clearMenu: () => set({ menu: null }),
}));
