export type SubMenu = {
  name: string;
  link: string;
};

export type MainMenu = {
  name: string;
  link?: string;
  subMenu: SubMenu[];
};
