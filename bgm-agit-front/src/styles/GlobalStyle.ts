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

    /* 모바일 가로 세로 깨지는 문제 수정 */
    .react-confirm-alert-overlay {
        width: 100vw;
        height: 100vh;
        
    }

    /*CK 에디터 css*/
    .ck-content p {
        margin: 0 0 1em;
    }

    .ck-content ul,
    .ck-content ol {
        padding-left: 1.5em;
        margin: 0 0 1em;
    }

    .ck-content ul {
        list-style: disc;
    }

    .ck-content ol {
        list-style: decimal;
    }

    .ck-content li {
        margin-bottom: 0.25em;
    }

    /* 이미지 side */
    .ck-content .image-style-side {
        float: right;
        margin-left: 16px;
        margin-bottom: 16px;
    }

    /* 이미지 정렬 */
    .ck-content .image-style-align-center {
        margin-left: auto;
        margin-right: auto;
    }

    .ck-content .image-style-align-right {
        margin-left: auto;
        margin-right: 0;
    }

    /* 이미지 기본 */
    .ck-content img {
        max-width: 100%;
        height: auto;
        display: block;
    }

    /* float 해제 */
    .ck-content::after {
        content: '';
        display: block;
        clear: both;
    }
`;
