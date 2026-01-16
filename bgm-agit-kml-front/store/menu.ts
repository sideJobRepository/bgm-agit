import { create } from 'zustand';



interface MenuStore {
  menu: any | null;
  setMenu: (menu: any) => void;
  clearMenu: () => void;
}


export const useKmlMenuStore = create<MenuStore>((set) => ({
  menu: null,
  setMenu: (menu) => set({menu}),
  clearMenu: () => set({menu: null}),
}))