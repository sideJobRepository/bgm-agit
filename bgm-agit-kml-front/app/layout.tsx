import type { Metadata } from 'next';
import './globals.css';
import ClientLayout from '@/app/ClientLayout';
import StyledComponentsRegistry from '@/app/registry';
import KakaoProvider from '@/app/components/KakaoProvider';

declare global {
  interface Window {
    Kakao: any;
  }
}

export const metadata: Metadata = {
  metadataBase: new URL('https://bgmagit.co.kr'),
  title: {
    default: 'BGM 아지트 BML | 마작 기록 시스템',
    template: '%s | BGM 아지트 BML',
  },
  description:
    'BGM 아지트 BML — 대전 BGM 아지트의 마작 기록·랭킹·역만 기록 시스템',
  keywords: [
    'BGM 아지트',
    'BGM 아지트 BML',
    'BML',
    '마작 기록',
    '마작 랭킹',
    '대전 마작',
    '리치마작',
  ],
  applicationName: 'BGM 아지트 BML',
  authors: [{ name: 'BGM 아지트' }],
  creator: 'BGM 아지트',
  publisher: 'BGM 아지트',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://bgmagit.co.kr/record',
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    siteName: 'BGM 아지트 BML',
    title: 'BGM 아지트 BML | 마작 기록 시스템',
    description:
      'BGM 아지트 BML — 대전 BGM 아지트의 마작 기록·랭킹·역만 기록 시스템',
    url: 'https://bgmagit.co.kr/record',
    images: [
      {
        url: 'https://bgmagit.co.kr/record/og-image.png?v=20260429',
        width: 1200,
        height: 630,
        alt: 'BGM 아지트 BML',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BGM 아지트 BML | 마작 기록 시스템',
    description:
      'BGM 아지트 BML — 대전 BGM 아지트의 마작 기록·랭킹·역만 기록 시스템',
    images: ['https://bgmagit.co.kr/record/og-image.png?v=20260429'],
  },
  verification: {
    other: {
      'naver-site-verification': '0b1074878637f7749d20394f63daaf381db057b6',
    },
  },
  icons: {
    icon: '/record/favicon.ico',
    shortcut: '/record/favicon.ico',
  },
};
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': 'https://bgmagit.co.kr/record/#website',
      url: 'https://bgmagit.co.kr/record',
      name: 'BGM 아지트 BML',
      alternateName: ['BGM 아지트 마작 기록', 'BML', 'BGM 아지트 BML'],
      inLanguage: 'ko-KR',
      description:
        'BGM 아지트 BML — 대전 BGM 아지트의 마작 기록·랭킹·역만 기록 시스템',
      publisher: {
        '@id': 'https://bgmagit.co.kr/#organization',
      },
    },
    {
      '@type': 'Organization',
      '@id': 'https://bgmagit.co.kr/#organization',
      name: 'BGM 아지트',
      url: 'https://bgmagit.co.kr/',
      logo: 'https://bgmagit.co.kr/headerLogo.png',
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <StyledComponentsRegistry>
          <ClientLayout>{children}</ClientLayout>
        </StyledComponentsRegistry>
        <KakaoProvider />
      </body>
    </html>
  );
}
