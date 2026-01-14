// src/styles/styled.d.ts
import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    device: {
      mobile: string;
      tablet: string;
      desktop: string;
    };
    colors: {
      whiteColor: string;
      blackColor: string;

      sideBgColor: string;
      mainBgColor: string;
      mainPageBgColor: string;
      menuColor: string;
      subMenuColor: string;
      alertColor: string;
      loginColor: string;
      loginBtColor: string;
      fileBgColor: string;
      fileBorderColor: string;
      inputTitleBgColor: string;

      subTextBoxColor: string;
      activeMenuColor: string;
      bottomBg: string;
      subColor: string;
      purpleColor: string;
      blueColor: string;
      redColor: string;
      greenColor: string;
      basicColor: string;
      bronzeColor: string;
      yellowColor: string;
      noticeColor: string;
      softColor: string;
      lineColor: string;
      navColor: string;
      labelGb: string;
      white: string;
      border: string;
      text: string;
      kakao: string;
      black: string;
      [key: string]: string;
    };
    desktop: {
      sizes: {
        h1Size: string;
        h2Size: string;
        h3Size: string;
        h4Size: string;
        h5Size: string;
        strongSize: string;
        menuSize: string;
        TopButtonSize: string;
        spanSize: string;
      };
    };
    mobile: {
      sizes: {
        h1Size: string;
        h2Size: string;
        h3Size: string;
        h4Size: string;
        h5Size: string;
        strongSize: string;
        menuSize: string;
        TopButtonSize: string;
        spanSize: string;
      };
    };
    weight: {
      bold: string;
      semiBold: string;
    };
  }
}
