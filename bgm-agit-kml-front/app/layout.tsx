import type { Metadata } from "next";
import "./globals.css";
import ClientLayout from '@/app/ClientLayout';
import StyledComponentsRegistry from '@/app/registry';

export const metadata: Metadata = {
  title: "BGM 아지트 BML",
  description: "BGM 아지트 BML 사이트",
  openGraph: {
    title: "BGM 아지트 BML",
    description: "BGM 아지트 BML 사이트",
    url: "https://bgmagit.co.kr/record",
    images: [
      {
        url: "https://bgmagit.co.kr/record/logo.png?v=20260122",
        width: 1200,
        height: 630,
        alt: "BGM 아지트 BML",
      },
    ],
  },
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
      <StyledComponentsRegistry>
       <ClientLayout>{children}</ClientLayout>
      </StyledComponentsRegistry>
      </body>
    </html>
  );
}
