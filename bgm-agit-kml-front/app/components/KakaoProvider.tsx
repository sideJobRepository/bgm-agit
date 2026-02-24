'use client';

import Script from 'next/script';

export default function KakaoProvider() {
  return (
    <Script
      src="https://developers.kakao.com/sdk/js/kakao.js"
      strategy="afterInteractive"
      onLoad={() => {
        const w = window as any;
        if (w.Kakao && !w.Kakao.isInitialized()) {
          w.Kakao.init(process.env.NEXT_PUBLIC_KAKAO_JS_KEY);
        }
      }}
    />
  );
}
