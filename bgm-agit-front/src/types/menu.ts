export type SubMenu = {
  name: string;
  link: string;
  bgmAgitMainMenuId: number;
  bgmAgitSubMenuId: number;
};

export type MainMenu = {
  name: string;
  link?: string;
  bgmAgitMainMenuId: number;
  subMenu: SubMenu[];
};
