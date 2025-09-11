import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`

    /* Pretendard Font 설정 */
    @font-face {
        font-family: 'Pretendard';
        src: url('/fonts/Pretendard-Regular.woff2') format('woff2');
        font-weight: 400;
        font-style: normal;
    }

    @font-face {
        font-family: 'Pretendard';
        src: url('/fonts/Pretendard-SemiBold.woff2') format('woff2');
        font-weight: 600;
        font-style: normal;
    }

    @font-face {
        font-family: 'Pretendard';
        src: url('/fonts/Pretendard-Bold.woff2') format('woff2');
        font-weight: 700;
        font-style: normal;
    }

    /* 기본 Reset 및 Global 스타일 */
    *, *::before, *::after {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
        -webkit-tap-highlight-color: transparent;
        
    }

    html, body, #root {
        overscroll-behavior: none;  /* 위/아래 체이닝 차단 */
    }

    body {
        font-family: 'Pretendard', sans-serif;
        overscroll-behavior-y: none;
        -webkit-overflow-scrolling: touch;
    }

    img {
        max-width: 100%;
        display: block;
    }

    a {
        text-decoration: none;
        color: inherit;
    }

    ul, ol {
        list-style: none;
    }
`;
