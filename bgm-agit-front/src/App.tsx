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
import RedirectPage from './pages/RedirectPage.tsx';
import { ToastContainer } from 'react-toastify';
import ReservationList from './pages/ReservationList.tsx';
import Role from './pages/Role.tsx';
import NoticeDetail from './pages/NoticeDetail.tsx';
import Privacy from './pages/Privacy.tsx';
import Free from './pages/Free.tsx';
import FreeDetail from './pages/FreeDetail.tsx';
import Inquiry from './pages/Inquiry.tsx';
import InquiryDetail from './pages/InquiryDetail.tsx';
import Guide from './pages/Guide.tsx';
import Matches from './pages/Matches.tsx';
import Review from './pages/Review.tsx';
import ReviewDetail from './pages/ReviewDetail.tsx';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <RecoilRoot>
        <ToastContainer position="top-center" autoClose={3000} />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/oauth/:provider/callback" element={<RedirectPage />} />
            <Route path="/error" element={<Error />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/" element={<Layout />}>
              <Route index element={<MainPage />} />
              <Route path="about" element={<About />} />
              <Route path="detail/*" element={<Detail />} />
              <Route path="notice" element={<Notice mainGb={true} />} />
              <Route path="/noticeDetail" element={<NoticeDetail />} />
              <Route path="reservationList" element={<ReservationList />} />
              <Route path="role" element={<Role />} />
              <Route path="free" element={<Free />} />
              <Route path="/freeDetail" element={<FreeDetail />} />
              <Route path="inquiry" element={<Inquiry />} />
              <Route path="/inquiryDetail" element={<InquiryDetail />} />
              <Route path="guide" element={<Guide />} />
              <Route path="matches" element={<Matches />} />
              <Route path="review" element={<Review />} />
              <Route path="review/:id" element={<ReviewDetail />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </RecoilRoot>
    </ThemeProvider>
  );
}

export default App;
