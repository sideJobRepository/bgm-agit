import { theme } from './styles/theme.ts';
import './App.css';
import { ThemeProvider } from 'styled-components';
import { GlobalStyle } from './styles/GlobalStyle.ts';
import { RecoilRoot } from 'recoil';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import PageMeta from './components/layout/PageMeta.tsx';
import ClosedMenuGuard from './components/layout/ClosedMenuGuard.tsx';
import Layout from './components/layout/Layout.tsx';
import MainPage from './pages/MainPage.tsx';
import ScrollToTop from './components/layout/ScrollToTop.tsx';
import RedirectPage from './pages/RedirectPage.tsx';
import { ToastContainer } from 'react-toastify';

// 메인 외 화면은 들어갈 때 받는다. 전부 한 번에 묶으면 첫 JS 가 2.5MB(에디터·표 라이브러리 포함)였다
const About = lazy(() => import('./pages/About.tsx'));
const Detail = lazy(() => import('./pages/Detail.tsx'));
const Error = lazy(() => import('./pages/Error.tsx'));
const Notice = lazy(() => import('./pages/Notice.tsx'));
const ReservationList = lazy(() => import('./pages/ReservationList.tsx'));
const ReservationBoard = lazy(() => import('./pages/ReservationBoard.tsx'));
const Role = lazy(() => import('./pages/Role.tsx'));
const NoticeDetail = lazy(() => import('./pages/NoticeDetail.tsx'));
const Privacy = lazy(() => import('./pages/Privacy.tsx'));
const Terms = lazy(() => import('./pages/Terms.tsx'));
const RefundPolicy = lazy(() => import('./pages/RefundPolicy.tsx'));
const Free = lazy(() => import('./pages/Free.tsx'));
const FreeDetail = lazy(() => import('./pages/FreeDetail.tsx'));
const Inquiry = lazy(() => import('./pages/Inquiry.tsx'));
const InquiryDetail = lazy(() => import('./pages/InquiryDetail.tsx'));
const ServiceRequest = lazy(() => import('./pages/ServiceRequest.tsx'));
const ServiceRequestDetail = lazy(() => import('./pages/ServiceRequestDetail.tsx'));
const Guide = lazy(() => import('./pages/Guide.tsx'));
const Matches = lazy(() => import('./pages/Matches.tsx'));
const Review = lazy(() => import('./pages/Review.tsx'));
const ReviewDetail = lazy(() => import('./pages/ReviewDetail.tsx'));
const MyPage = lazy(() => import('./pages/MyPage.tsx'));
const MenuManage = lazy(() => import('./pages/MenuManage.tsx'));
const MurderGames = lazy(() => import('./pages/MurderGames.tsx'));
const MurderGameDetail = lazy(() => import('./pages/MurderGameDetail.tsx'));
const PlayRecords = lazy(() => import('./pages/PlayRecords.tsx'));
const PlayRecordDetail = lazy(() => import('./pages/PlayRecordDetail.tsx'));
const PlayHistory = lazy(() => import('./pages/PlayHistory.tsx'));
const PlayStats = lazy(() => import('./pages/PlayStats.tsx'));
const ClockTowerGames = lazy(() => import('./pages/ClockTowerGames.tsx'));
const ClockTowerGameDetail = lazy(() => import('./pages/ClockTowerGameDetail.tsx'));
const ClockTowerRecords = lazy(() => import('./pages/ClockTowerRecords.tsx'));
const ClockTowerRecordDetail = lazy(() => import('./pages/ClockTowerRecordDetail.tsx'));
const ClockTowerHistory = lazy(() => import('./pages/ClockTowerHistory.tsx'));
const ClockTowerStats = lazy(() => import('./pages/ClockTowerStats.tsx'));
const PaymentSuccess = lazy(() => import('./pages/PaymentSuccess.tsx'));
const PaymentFail = lazy(() => import('./pages/PaymentFail.tsx'));

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <RecoilRoot>
        <ToastContainer position="top-center" autoClose={3000} />
        <BrowserRouter>
          <ScrollToTop />
          <PageMeta />
          <ClosedMenuGuard>
            <Suspense fallback={null}>
              <Routes>
                <Route path="/oauth/:provider/callback" element={<RedirectPage />} />
                <Route path="/error" element={<Error />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/refund-policy" element={<RefundPolicy />} />
                <Route path="/" element={<Layout />}>
                  <Route index element={<MainPage />} />
                  <Route path="about" element={<About />} />
                  <Route path="detail/*" element={<Detail />} />
                  <Route path="notice" element={<Notice mainGb={true} />} />
                  <Route path="/noticeDetail" element={<NoticeDetail />} />
                  <Route path="reservationList" element={<ReservationList />} />
                  <Route path="reservation-board" element={<ReservationBoard />} />
                  <Route path="payment/success" element={<PaymentSuccess />} />
                  <Route path="payment/fail" element={<PaymentFail />} />
                  <Route path="role" element={<Role />} />
                  <Route path="free" element={<Free />} />
                  <Route path="/freeDetail" element={<FreeDetail />} />
                  <Route path="inquiry" element={<Inquiry />} />
                  <Route path="/inquiryDetail" element={<InquiryDetail />} />
                  <Route path="service-request" element={<ServiceRequest />} />
                  <Route path="/serviceRequestDetail" element={<ServiceRequestDetail />} />
                  <Route path="guide" element={<Guide />} />
                  <Route path="matches" element={<Matches />} />
                  <Route path="my-academy" element={<MyPage />} />
                  <Route path="review" element={<Review />} />
                  <Route path="review/:id" element={<ReviewDetail />} />
                  <Route path="menuManage" element={<MenuManage />} />
                  <Route path="murder-games" element={<MurderGames />} />
                  <Route path="/murderGameDetail" element={<MurderGameDetail />} />
                  <Route path="play-records" element={<PlayRecords />} />
                  <Route path="/playRecordDetail" element={<PlayRecordDetail />} />
                  <Route path="play-history" element={<PlayHistory />} />
                  <Route path="play-stats" element={<PlayStats />} />
                  <Route path="clocktower-games" element={<ClockTowerGames />} />
                  <Route path="/clockTowerGameDetail" element={<ClockTowerGameDetail />} />
                  <Route path="clocktower-records" element={<ClockTowerRecords />} />
                  <Route path="/clockTowerRecordDetail" element={<ClockTowerRecordDetail />} />
                  <Route path="clocktower-history" element={<ClockTowerHistory />} />
                  <Route path="clocktower-stats" element={<ClockTowerStats />} />
                </Route>
              </Routes>
            </Suspense>
          </ClosedMenuGuard>
        </BrowserRouter>
      </RecoilRoot>
    </ThemeProvider>
  );
}

export default App;
