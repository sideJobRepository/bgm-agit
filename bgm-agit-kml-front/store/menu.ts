import { create } from 'zustand';

interface MenuItem {
  icon: string;
  id: string;
  menuLink: string;
  menuName: string;
  menuOrders: number;
}

interface MenuStore {
  menu: MenuItem[] | null;
  setMenu: (menu: MenuItem[]) => void;
  clearMenu: () => void;
}


export const useKmlMenuStore = create<MenuStore>((set) => ({
  menu: null,
  setMenu: (menu) => set({menu}),
  clearMenu: () => set({menu: null}),
}))