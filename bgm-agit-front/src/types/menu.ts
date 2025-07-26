export type SubMenu = {
  name: string;
  link: string;
  bgmAgitMainMenuId: number;
};

export type MainMenu = {
  name: string;
  link?: string;
  subMenu: SubMenu[];
};
