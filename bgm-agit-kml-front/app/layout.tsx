import type { Metadata } from "next";
import "./globals.css";
import ClientProviders from "./providers";
import AuthListener from "./AuthListener";

export const metadata: Metadata = {
  title: "BGM 아지트 kml",
  description: "BGM 아지트 kml 사이트",
  openGraph: {
    title: "BGM 아지트 kml",
    description: "BGM 아지트 kml 사이트",
    url: "https://bgmagit.co.kr/record",
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
      <ClientProviders>

          <main>{children}</main>
      </ClientProviders>
      </body>
    </html>
  );
}
