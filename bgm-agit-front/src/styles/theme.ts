// 색은 palette 한 곳에서 정한다. 포인트 색을 바꾸려면 primary 계열만 고치면 된다.
const palette = {
  primary: '#2F5BEA',
  primaryHover: '#2449C4',
  primarySoft: '#EEF2FE',
  onPrimary: '#FFFFFF',

  bg: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceAlt: '#F2F4F7',
  surfaceSunken: '#F7F8FA',
  footer: '#16181D',

  textStrong: '#16181D',
  textBody: '#344054',
  textMuted: '#5B6270',
  textSubtle: '#8A919E',

  border: '#E4E7EC',
  borderStrong: '#D0D5DD',

  success: '#1A7D55',
  danger: '#FF5E57',
  info: '#093A6E',
} as const;

export const theme = {
  colors: {
    ...palette,

    // 아래는 예전 키. 화면들이 아직 이 이름을 쓰고 있어서 새 palette 값으로 이어 둔다
    topBg: palette.bg,
    subBgColor: palette.surfaceAlt,
    subTextBoxColor: palette.surfaceAlt,
    activeMenuColor: palette.primary,
    subMenuColor: palette.textStrong,
    bottomBg: palette.footer,
    menuColor: '#2E2E2E',
    subColor: '#424548',
    purpleColor: '#482768',
    blueColor: palette.info,
    redColor: palette.danger,
    greenColor: palette.success,
    basicColor: palette.surfaceAlt,
    bronzeColor: palette.textStrong,
    yellowColor: '#FBE157',
    noticeColor: palette.primary,
    softColor: palette.surfaceSunken,
    lineColor: '#D9D9D9',
    navColor: '#757575',
    labelGb: 'rgba(66, 69, 72, 0.6)',
    white: '#FFFFFF',
    text: '#222',
    kakao: '#FDDC3F',
    black: '#000000',

    whiteColor: '#ffffff',
    blackColor: '#000000',
    grayColor: '#757575',
    inputColor: '#1d1d1f',
    writeBgColor: '#4A90E2',
  },
  fonts: {
    body: "'Pretendard', sans-serif",
    // 예전 제목 폰트(Jua·Bungee) 자리. 지금은 본문과 같은 Pretendard 로 통일
    display: "'Pretendard', sans-serif",
  },
  radius: {
    sm: '6px',
    md: '10px',
    lg: '16px',
    pill: '999px',
  },
  shadow: {
    sm: '0 1px 2px rgba(16, 24, 40, 0.05)',
    md: '0 4px 16px rgba(16, 24, 40, 0.08)',
    lg: '0 18px 48px rgba(16, 24, 40, 0.18)',
  },
  space: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    xxl: '32px',
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
  desktop: {
    sizes: {
      titleSize: '52px',
      h1Size: '36px',
      h2Size: '30px',
      h3Size: '24px',
      h4Size: '20px',
      h5Size: '18px',
      xl: '16px',
      md: '14px',
      sm: '12px',
      xs: '10px',
    },
  },
  mobile: {
    sizes: {
      titleSize: '32px',
      h1Size: '32px',
      h2Size: '26px',
      h3Size: '20px',
      h4Size: '16px',
      h5Size: '14px',
      xl: '12px',
      md: '10px',
      sm: '8px',
      xs: '6px',
    },
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
export type themeThemeType = ThemeType;
