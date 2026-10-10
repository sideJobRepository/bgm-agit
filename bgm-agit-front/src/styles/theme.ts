// 색은 palette 한 곳에서 정한다. 포인트 색을 바꾸려면 primary 계열만 고치면 된다.
const palette = {
  // 개편 전 갈색 계열(2026-10-10 보라 리디자인에서 되돌림). 화면 구조·파일 분리는 리디자인 것을 그대로 두고 색만 예전 값이다
  primary: '#988271',
  primaryHover: '#7F6B5C',
  // 선택·활성 칸, 예약 시간 강조 등의 옅은 바탕(베이지)
  primarySoft: '#F1E7CE',
  onPrimary: '#FFFFFF',

  // 보조 포인트. 배지·강조처럼 작은 곳에 쓴다(진갈색)
  accent: '#5C3A21',
  accentSoft: '#F8EFD9',
  accentText: '#5C3A21',

  bg: '#FFFFFF',
  surface: '#FFFFFF',
  // 상단 헤더 바탕(크림)
  header: '#FCF8E6',
  surfaceAlt: '#F2EDEA',
  surfaceSunken: '#F8F9FA',
  footer: '#988271',

  textStrong: '#222222',
  textBody: '#424548',
  textMuted: '#5B6270',
  textSubtle: '#8A919E',

  // 칸 경계가 또렷하게 보이도록 진하게 둔다. borderStrong 은 예전 입력칸·에디터 테두리(#c4c4c4)와 같은 값
  border: '#DCDCDC',
  borderStrong: '#C4C4C4',

  success: '#1A7D55',
  danger: '#FF5E57',
  info: '#093A6E',
} as const;

export const theme = {
  colors: {
    ...palette,

    // 아래는 예전 키. 화면들이 아직 이 이름을 쓰고 있어서 새 palette 값으로 이어 둔다
    topBg: palette.header,
    subBgColor: palette.accentSoft,
    subTextBoxColor: palette.primarySoft,
    activeMenuColor: '#3D2D1E',
    subMenuColor: '#2C1E0F',
    bottomBg: palette.footer,
    menuColor: '#2E2E2E',
    subColor: '#424548',
    purpleColor: '#482768',
    blueColor: palette.info,
    redColor: palette.danger,
    greenColor: palette.success,
    basicColor: palette.surfaceAlt,
    bronzeColor: palette.accent,
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
    // 제목 폰트. 한글 제목은 Jua, 영문 큰 제목(Reservation History 등)은 Bungee. index.html 에서 구글 폰트로 받는다
    display: "'Jua', sans-serif",
    displayEn: "'Bungee', sans-serif",
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
