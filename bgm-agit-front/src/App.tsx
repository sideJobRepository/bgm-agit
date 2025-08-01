import { theme } from './styles/theme.ts';
import './App.css';
import { ThemeProvider } from 'styled-components';
import { GlobalStyle } from './styles/GlobalStyle.ts';
import { RecoilRoot } from 'recoil';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout.tsx';
import MainPage from './pages/MainPage.tsx';
import About from './pages/About.tsx';
import Detail from './pages/Detail.tsx';
import Error from './pages/Error.tsx';
import Notice from './pages/Notice.tsx';
import ScrollToTop from './components/layout/ScrollToTop.tsx';
import KakaoRedirectPage from './pages/KakaoRedirectPage.tsx';
import { ToastContainer } from 'react-toastify';
import ReservationList from './pages/ReservationList.tsx';
import Role from './pages/Role.tsx';
import NoticeDetail from './pages/NoticeDetail.tsx';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <RecoilRoot>
        <ToastContainer position="top-center" autoClose={3000} />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/oauth/kakao/callback" element={<KakaoRedirectPage />} />
            <Route path="/oauth/kakao/logout" element={<KakaoRedirectPage />} />
            <Route path="/error" element={<Error />} />
            <Route path="/" element={<Layout />}>
              <Route index element={<MainPage />} />
              <Route path="about" element={<About />} />
              <Route path="detail/*" element={<Detail />} />
              <Route path="notice" element={<Notice mainGb={true} />} />
              <Route path="/noticeDetail" element={<NoticeDetail />} />
              <Route path="reservationList" element={<ReservationList />} />
              <Route path="role" element={<Role />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </RecoilRoot>
    </ThemeProvider>
  );
}

export default App;
