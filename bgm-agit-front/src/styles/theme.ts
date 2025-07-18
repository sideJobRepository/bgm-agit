export const theme = {
  colors: {
    topBg: '#FCF8E6',
    menuColor: '#2E2E2E',
    subMenuColor: '#424548',
    purpleColor: '#482768',
    white: '#FFFFFF',
    bg: '#ffffff',
    border: '#e5e5e5',
    text: '#222',
    topLine: '#093A6E',
    kakao: '#FDDC3F',
    liteGray: '#66696D',
  },
  sizes: {
    bigLarge: '22px',
    menu: '20px',
    large: '18px',
    medium: '16px',
    small: '14px',
  },
  weight: {
    bold: '700',
    semiBold: '600',
  },
  device: {
    mobile: '(max-width: 844px)',
    tablet: '(max-width: 1280px)',
    desktop: '(min-width: 1281px)',
  },
} as const;

export type ThemeType = typeof theme;
