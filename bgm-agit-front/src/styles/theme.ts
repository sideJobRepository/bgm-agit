export const theme = {
  colors: {
    topBg: '#FCF8E6',
    bottomBg: '#988271',
    menuColor: '#2E2E2E',
    subMenuColor: '#424548',
    purpleColor: '#482768',
    blueColor: '#093A6E',
    greenColor: '#1A7D55',
    basicColor: '#F2EDEA',
    bronzeColor: '#5C3A21',
    NoticeColor: '#988271',
    lineColor: '#D9D9D9',
    labelGb: 'rgba(66, 69, 72, 0.6)',
    white: '#FFFFFF',
    bg: '#ffffff',
    border: '#e5e5e5',
    text: '#222',
    kakao: '#FDDC3F',
    liteGray: '#66696D',
  },
  sizes: {
    ultra: '32px',
    extra: '28px',
    xxlarge: '26px',
    xlarge: '24px',
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
