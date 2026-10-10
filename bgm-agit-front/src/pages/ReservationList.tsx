import { Wrapper } from '../styles';
import SearchBar from '../components/SearchBar.tsx';
import { useCallback, useEffect, useState } from 'react';
import { useMediaQuery } from 'react-responsive';
import { CheckCircle, CreditCard, Receipt, Share, XCircle } from 'phosphor-react';
import { useReservationListFetch, useUpdatePost } from '../recoil/fetch.ts';
import { useRecoilValue } from 'recoil';
import { reservationListDataState } from '../recoil/state/reservationState.ts';
import { userState } from '../recoil/state/userState.ts';
import { showConfirmModal } from '../components/confirmAlert.tsx';
import { toast } from '../utils/toast';
import type { Reservation } from '../types/reservation.ts';
import Pagination from '../components/Pagination.tsx';
import api from '../utils/axiosInstance.ts';
import PaymentCheckoutModal from '../components/payment/PaymentCheckoutModal.tsx';
import type { PaymentOrderResponse } from '../types/tossPayments.ts';
import { todayYmd, toLocalYmd } from '../utils/date.ts';
import { theme } from '../styles/theme.ts';
import {
  NoticeBox,
  ListBox,
  CardGrid,
  Card,
  CardTable,
  Header,
  HeaderLeft,
  HeaderPlace,
  HeaderDate,
  StatusBadge,
  Row,
  ActionBox,
  ActionButton,
  SearchWrapper,
  TitleBox,
  SearchBox,
  PaginationWrapper,
  NoSearchBox,
  InfoBox,
  InfoSummary,
  InfoToggle,
  TextBox,
  type StatusTone,
} from './ReservationList.styles.ts';

// 이어지는 슬롯을 한 구간으로 합친다 (13:00~14:00 + 14:00~15:00 -> 13:00~15:00).
// 서버가 이미 중복 제거·정렬해서 내려주므로 인접한 항목만 비교한다.
// 끝 시각 문자열 일치만 보기 때문에 G Room 의 19:00~00:00 처럼 자정을 넘는 구간도 그대로 통과한다.
function mergeTimeSlots(slots: Reservation['timeSlots']) {
  return slots.reduce<Reservation['timeSlots']>((acc, slot) => {
    const prev = acc[acc.length - 1];
    if (prev && prev.endTime === slot.startTime) {
      acc[acc.length - 1] = { startTime: prev.startTime, endTime: slot.endTime };
      return acc;
    }
    acc.push(slot);
    return acc;
  }, []);
}

function resolveStatus(item: Reservation): { label: string; tone: StatusTone } {
  if (item.cancelStatus === 'Y') {
    return { label: '취소', tone: 'canceled' };
  }
  if (item.approvalStatus === 'Y') {
    return { label: '확정', tone: 'approved' };
  }
  return { label: '대기', tone: 'waiting' };
}

export default function ReservationList() {
  const user = useRecoilValue(userState);
  const isAdmin = !!user?.roles.includes('ROLE_ADMIN');
  // 토스 가맹점 심사 통과로 전 회원에게 결제 노출. 관리자는 대리 결제할 일이 없어 계속 제외한다.
  const canUsePayment = !isAdmin;

  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  // toISOString()은 UTC 변환이라 KST 자정 기준 Date가 하루 앞 날짜로 밀린다. 로컬 기준으로 포맷할 것.
  const start = toLocalYmd(dateRange[0]);
  const end = toLocalYmd(dateRange[1]);

  const fetchReservationList = useReservationListFetch();
  const { update } = useUpdatePost();
  const items = useRecoilValue(reservationListDataState);
  const [page, setPage] = useState(0);
  const [paymentOrder, setPaymentOrder] = useState<PaymentOrderResponse | null>(null);
  const [payingReservationId, setPayingReservationId] = useState<number | null>(null);
  const closePaymentModal = useCallback(() => setPaymentOrder(null), []);

  const isMobile = useMediaQuery({ query: theme.device.mobile });
  // 2열로 카드가 200px대가 되는 구간. 버튼 라벨을 줄여 한 줄에 다 들어가게 한다.
  const isNarrow = useMediaQuery({ query: '(max-width: 600px)' });

  // 2열 고정이라 데스크탑은 3줄(6개), 모바일은 2줄(4개)만 보이게 한다.
  // 컨트롤러의 Pageable 이 size 쿼리 파라미터를 그대로 받는다.
  const pageSize = isMobile ? 4 : 6;
  // 모바일은 안내 문구가 첫 화면을 다 차지해서 목록이 아래로 밀린다. 기본은 접힘.
  const [infoOpen, setInfoOpen] = useState(false);

  const handlePageClick = (pageNum: number) => {
    setPage(pageNum);
  };

  function todayFunction(date: string) {
    return date >= todayYmd();
  }

  function canCancelBeforeReservationDate(item: Reservation) {
    return item.cancelStatus !== 'Y' && item.reservationDate > todayYmd();
  }

  // pageSize 를 deps 에 둔다. useMediaQuery 가 첫 렌더 직후 값이 바뀌는 경우 재조회가 필요하다
  useEffect(() => {
    fetchReservationList(page, { startDate: start, endDate: end }, pageSize);
  }, [dateRange, page, pageSize]);

  //업데이트
  async function updateData(item: Reservation, role: boolean, cancel: string, approval: string) {
    const param = {
      reservationId: item.reservationId,
      cancelStatus: cancel,
      approvalStatus: approval,
    };

    const url = role ? `/bgm-agit/reservation/admin` : `/bgm-agit/reservation`;
    const message =
      approval === 'Y' ? '해당 예약을 확정하시겠습니까?' : '해당 예약을 취소하시겠습니까?';
    const message2 = approval === 'Y' ? '예약이 확정되었습니다.' : '예약이 취소되었습니다.';
    showConfirmModal({
      message: message,
      onConfirm: () => {
        update({
          url: url,
          body: param,
          ignoreHttpError: true,
          onSuccess: () => {
            toast.success(message2);
            fetchReservationList(page, { startDate: start, endDate: end }, pageSize);
          },
        });
      },
    });
  }

  //공유하기
  function shareReservation(item: Reservation) {
    if (!window.Kakao || !window.Kakao.isInitialized()) {
      return;
    }

    const timeText = item.timeSlots.map(slot => `${slot.startTime}~${slot.endTime}`).join(', ');

    window.Kakao.Share.sendDefault({
      objectType: 'text',
      text: `
      [예약 내역 안내]

      예약자: ${item.reservationMemberName}
      예약일자: ${item.reservationDate}
      예약시간: ${timeText}
      인원: ${item.reservationPeople}명
      요청사항: ${item.reservationRequest || '없음'}
      연락처: ${item.phoneNo}
    `.trim(),
      link: {
        mobileWebUrl: 'https://bgmagit.co.kr',
        webUrl: 'https://bgmagit.co.kr',
      },
    });
  }

  async function openPayment(item: Reservation) {
    if (!user) {
      toast.error('로그인이 필요합니다.');
      return;
    }

    setPayingReservationId(item.reservationId);
    try {
      const { data } = await api.post<PaymentOrderResponse>('/bgm-agit/payments/order', {
        reservationId: item.reservationId,
      });
      setPaymentOrder(data);
    } catch (error) {
      console.error(error);
      toast.error('결제 주문을 생성하지 못했습니다.');
    } finally {
      setPayingReservationId(null);
    }
  }

  const noticeLines = (
    <span>
      {canUsePayment && (
        <>
          ※ 예약 대기 상태에서 결제 버튼을 눌러 예약금을 결제하면 예약이 확정됩니다.
          <br />
        </>
      )}
      ※ 예약금은 예약 항목당 10,000원입니다. (여러 항목을 합쳐 예약한 경우 항목 수만큼 합산)
      <br />※ 잔여 이용요금은 현장에서 결제합니다.
      <br />※ 예약 취소는 예약일 전날까지만 가능합니다. 당일 취소는 불가합니다.
      <br />※ 확정 후 취소 또는 환불 문의는 0507-1445-3503로 연락 부탁드립니다.
    </span>
  );

  return (
    <Wrapper>
      <NoticeBox>
        <SearchWrapper bgColor={theme.colors.primary}>
          <TitleBox textColor="#ffffff">
            <h2>Reservation History</h2>
            <p>예약내역을 확인해보세요.</p>
          </TitleBox>
          <SearchBox>
            <SearchBar<[Date | null, Date | null]>
              color={theme.colors.primary}
              label="예약일자"
              onSearch={setDateRange}
            />
          </SearchBox>
        </SearchWrapper>

        <ListBox>
          {/* 모바일은 접되 예약금·취소 고지 한 줄은 항상 노출한다 (토스페이먼츠 심사 대응 문구) */}
          {isMobile ? (
            <InfoBox>
              <InfoSummary>
                예약금 10,000원(항목당) / 잔여 이용요금 현장 결제 / 예약 당일 취소 불가
              </InfoSummary>
              <InfoToggle type="button" onClick={() => setInfoOpen(prev => !prev)}>
                이용 안내 {infoOpen ? '▴' : '▾'}
              </InfoToggle>
              {infoOpen && <TextBox>{noticeLines}</TextBox>}
            </InfoBox>
          ) : (
            <TextBox>{noticeLines}</TextBox>
          )}

          <CardGrid>
            {items?.content.map(item => {
              const status = resolveStatus(item);
              const upcoming = todayFunction(item.reservationDate);
              const timeText = mergeTimeSlots(item.timeSlots)
                .map(slot => `${slot.startTime} ~ ${slot.endTime}`)
                .join(', ');

              const canPay =
                canUsePayment &&
                upcoming &&
                item.approvalStatus !== 'Y' &&
                item.cancelStatus !== 'Y';
              const canCancel =
                upcoming &&
                (isAdmin ? item.cancelStatus !== 'Y' : canCancelBeforeReservationDate(item));
              const canApprove =
                upcoming &&
                isAdmin &&
                item.approvalStatus !== 'Y' &&
                item.cancelStatus !== 'Y';

              return (
                <Card key={item.reservationId} $tone={status.tone}>
                  <CardTable>
                    <Header $canceled={status.tone === 'canceled'}>
                      <HeaderLeft>
                        <HeaderPlace>{item.reservationAddr}</HeaderPlace>
                        <StatusBadge $tone={status.tone}>{status.label}</StatusBadge>
                      </HeaderLeft>
                      <HeaderDate>{item.reservationDate}</HeaderDate>
                    </Header>

                    <Row $highlight>
                      <span>예약 시간</span>
                      <span>{timeText}</span>
                    </Row>
                    <Row>
                      <span>예약자</span>
                      <span>{item.reservationMemberName}</span>
                    </Row>
                    <Row>
                      <span>예약 인원</span>
                      <span>
                        {item.reservationPeople != null ? `${item.reservationPeople}명` : '-'}
                      </span>
                    </Row>
                    <Row>
                      <span>연락처</span>
                      <span>{item.phoneNo}</span>
                    </Row>
                    <Row>
                      <span>신청 일자</span>
                      <span>{item.registDate}</span>
                    </Row>
                    {item.reservationRequest && (
                      <Row>
                        <span>요청 사항</span>
                        <span>{item.reservationRequest}</span>
                      </Row>
                    )}
                  </CardTable>

                  <ActionBox>
                    {canPay && (
                      <ActionButton
                        type="button"
                        color="#1A7D55"
                        disabled={payingReservationId === item.reservationId}
                        onClick={() => openPayment(item)}
                      >
                        <CreditCard weight="bold" />
                        {payingReservationId === item.reservationId
                          ? isNarrow
                            ? '준비중'
                            : '결제 준비중'
                          : isNarrow
                            ? '결제'
                            : '예약금 결제'}
                      </ActionButton>
                    )}
                    {canApprove && (
                      <ActionButton
                        type="button"
                        color="#1A7D55"
                        onClick={() => updateData(item, true, 'N', 'Y')}
                      >
                        <CheckCircle weight="bold" />
                        확정
                      </ActionButton>
                    )}
                    {canCancel && (
                      <ActionButton
                        type="button"
                        color="#FF5E57"
                        onClick={() => updateData(item, isAdmin, 'Y', 'N')}
                      >
                        <XCircle weight="bold" />
                        취소
                      </ActionButton>
                    )}
                    {item.receiptUrl && (
                      <ActionButton
                        type="button"
                        color={theme.colors.primary}
                        onClick={() =>
                          window.open(item.receiptUrl as string, '_blank', 'noopener,noreferrer')
                        }
                      >
                        <Receipt weight="bold" />
                        영수증
                      </ActionButton>
                    )}
                    <ActionButton
                      type="button"
                      color="#5C3A21"
                      onClick={() => shareReservation(item)}
                    >
                      <Share weight="bold" />
                      공유
                    </ActionButton>
                  </ActionBox>
                </Card>
              );
            })}
          </CardGrid>

          {items?.content.length === 0 && <NoSearchBox>검색된 결과가 없습니다.</NoSearchBox>}
          <PaginationWrapper>
            <Pagination current={page} totalPages={items?.totalPages} onChange={handlePageClick} />
          </PaginationWrapper>
        </ListBox>
      </NoticeBox>
      {paymentOrder && user && (
        <PaymentCheckoutModal
          order={paymentOrder}
          user={user}
          onClose={closePaymentModal}
        />
      )}
    </Wrapper>
  );
}
