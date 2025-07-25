export const theme = {
  colors: {
    topBg: '#FCF8E6',
    subBgColor: '#F8EFD9',
    subTextBoxColor: '#F1E7CE',
    activeMenuColor: '#3D2D1E',
    subMenuColor: '#2C1E0F',
    bottomBg: '#988271',
    menuColor: '#2E2E2E',
    subColor: '#424548',
    purpleColor: '#482768',
    blueColor: '#093A6E',
    redColor: '#FF5E57',
    greenColor: '#1A7D55',
    basicColor: '#F2EDEA',
    bronzeColor: '#5C3A21',
    yellowColor: '#FBE157',
    noticeColor: '#988271',
    softColor: '#F8F9FA',
    lineColor: '#D9D9D9',
    navColor: '#757575',
    labelGb: 'rgba(66, 69, 72, 0.6)',
    white: '#FFFFFF',
    border: '#e5e5e5',
    text: '#222',
    kakao: '#FDDC3F',
    black: '#000000',
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
    xsmall: '12px',
    xxsmall: '10px',
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

export type themeThemeType = typeof theme;
