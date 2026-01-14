import type { Metadata } from "next";
import "./globals.css";
import ClientProviders from "./providers";
import AuthListener from "./AuthListener";
import Sidebar from "@/app/components/Sidebar";
import styled from "styled-components";

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
          <Wrapper>
              <Sidebar/>
              <Main>{children}</Main>
          </Wrapper>
      </ClientProviders>
      </body>
    </html>
  );
}

const Wrapper = styled.div`
  display: flex;
  width: 100vw;
  height: 100vh;
`;

const Main = styled.main`
  flex: 1;
  overflow: auto;
`;