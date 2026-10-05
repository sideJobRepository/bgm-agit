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

    /* 알림 창(SweetAlert2, utils/toast.ts). 다른 모달·확인창보다 위에 */
    .swal2-container {
        z-index: 10000 !important;
        padding: 16px;
    }

    /* 흰 창. 색은 아이콘(종류별)과 버튼(보라) 두 곳에만 쓴다 */
    .swal2-popup.bgm-alert {
        width: min(360px, calc(100vw - 32px));
        padding: 28px 22px 22px;
        border-radius: 18px;
        background: #fff;
        box-shadow: 0 18px 48px rgba(0, 0, 0, 0.18);
        font-family: inherit;
    }

    .bgm-alert .swal2-icon {
        margin: 0 auto;
        font-size: 14px;
    }

    .bgm-alert .swal2-title {
        margin: 16px 0 6px;
        padding: 0;
        color: #222;
        font-size: 19px;
        font-weight: 700;
        line-height: 1.3;
    }

    /* 성공 아이콘의 도는 가림막(흰 반원)을 없앤다. 남으면 로딩 고리처럼 보인다 */
    .bgm-alert .swal2-success-circular-line-left,
    .bgm-alert .swal2-success-circular-line-right,
    .bgm-alert .swal2-success-fix {
        display: none !important;
    }

    /* 버튼 포커스 테두리는 옅게 */
    .bgm-alert .swal2-styled:focus,
    .bgm-alert .swal2-styled:focus-visible {
        box-shadow: 0 0 0 3px rgba(72, 39, 104, 0.22) !important;
    }

    .bgm-alert .swal2-styled:hover {
        filter: brightness(1.08);
        background-image: none !important;
    }

    .bgm-alert .swal2-html-container {
        margin: 0;
        padding: 0 4px;
        color: #424548;
        font-size: 15px;
        line-height: 1.5;
        word-break: keep-all;
        white-space: pre-line;
        max-height: 50vh;
        overflow-y: auto;
    }

    .bgm-alert .swal2-actions {
        width: 100%;
        margin-top: 20px;
    }

    .bgm-alert .swal2-styled {
        min-width: 140px;
        margin: 0 4px;
        padding: 11px 22px;
        border-radius: 10px;
        font-size: 15px;
        font-weight: 700;
        box-shadow: 0 2px 6px rgba(72, 39, 104, 0.18);
    }

    /* 폰: 여백·아이콘을 조금 줄이고 버튼을 한 줄에 꽉 채워 누르기 쉽게(최소 44px 높이) */
    @media (max-width: 844px) {
        .swal2-popup.bgm-alert {
            padding: 24px 16px 16px;
        }

        .bgm-alert .swal2-icon {
            font-size: 12px;
        }

        .bgm-alert .swal2-title {
            font-size: 17px;
        }

        .bgm-alert .swal2-html-container {
            font-size: 14px;
        }

        .bgm-alert .swal2-actions {
            width: 100%;
            flex-wrap: nowrap;
            gap: 8px;
        }

        .bgm-alert .swal2-styled {
            flex: 1;
            min-height: 44px;
            margin: 0;
        }
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
