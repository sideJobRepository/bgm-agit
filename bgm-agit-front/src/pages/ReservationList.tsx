import { Wrapper } from '../styles';
import SearchBar from '../components/SearchBar.tsx';
import styled from 'styled-components';
import type { WithTheme } from '../styles/styled-props.ts';
import { useCallback, useEffect, useState } from 'react';
import { useMediaQuery } from 'react-responsive';
import { CheckCircle, CreditCard, Receipt, Share, XCircle } from 'phosphor-react';
import { useReservationListFetch, useUpdatePost } from '../recoil/fetch.ts';
import { useRecoilValue } from 'recoil';
import { reservationListDataState } from '../recoil/state/reservationState.ts';
import { userState } from '../recoil/state/userState.ts';
import { showConfirmModal } from '../components/confirmAlert.tsx';
import { toast } from 'react-toastify';
import type { Reservation } from '../types/reservation.ts';
import Pagination from '../components/Pagination.tsx';
import api from '../utils/axiosInstance.ts';
import PaymentCheckoutModal from '../components/payment/PaymentCheckoutModal.tsx';
import type { PaymentOrderResponse } from '../types/tossPayments.ts';
import { PAYMENT_LIVE } from '../config/payment.ts';
import { todayYmd, toLocalYmd } from '../utils/date.ts';
import { theme } from '../styles/theme.ts';

type StatusTone = 'waiting' | 'approved' | 'canceled';

// 상태는 진한 단색으로 칠해 헤더바 위 배지와 카드 테두리에 같이 쓴다
const STATUS_COLORS: Record<StatusTone, string> = {
  waiting: '#E08700',
  approved: '#1A7D55',
  canceled: '#6B6B6B',
};

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
  // 결제 라이브 여부. false(심사 기간)면 결제해도 실제 출금/자동확정이 안 되므로 안내 배너 노출
  const paymentLive = PAYMENT_LIVE;

  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  // toISOString()은 UTC 변환이라 KST 자정 기준 Date가 하루 앞 날짜로 밀린다. 로컬 기준으로 포맷할 것.
  const start = toLocalYmd(dateRange[0]);
  const end = toLocalYmd(dateRange[1]);

  const fetchReservationList = useReservationListFetch();
  const { update } = useUpdatePost();
  const items = useRecoilValue(reservationListDataState);
  const [page, setPage] = useState(0);
  const [paymentOrder, setPaymentOrder] = useState<PaymentOrderResponse | null>(null);
  const [payingReservationNo, setPayingReservationNo] = useState<number | null>(null);
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
      reservationNo: item.reservationNo,
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

    setPayingReservationNo(item.reservationNo);
    try {
      const { data } = await api.post<PaymentOrderResponse>('/bgm-agit/payments/order', {
        reservationNo: item.reservationNo,
      });
      setPaymentOrder(data);
    } catch (error) {
      console.error(error);
      toast.error('결제 주문을 생성하지 못했습니다.');
    } finally {
      setPayingReservationNo(null);
    }
  }

  const noticeLines = (
    <span>
      {paymentLive && (
        <>
          ※ 예약 대기 상태에서 결제 버튼을 눌러 예약금을 결제하면 예약이 확정됩니다.
          <br />※ 현재 토스페이먼츠 심사 기간으로 실제 결제 및 출금은 발생하지 않습니다.
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
        <SearchWrapper bgColor="#988271">
          <TitleBox textColor="#ffffff">
            <h2>Reservation History</h2>
            <p>예약내역을 확인해보세요.</p>
          </TitleBox>
          <SearchBox>
            <SearchBar<[Date | null, Date | null]>
              color="#988271"
              label="예약일자"
              onSearch={setDateRange}
            />
          </SearchBox>
        </SearchWrapper>

        <ListBox>
          {!paymentLive && (
            <ReviewBanner>
              예약 확정은 예약금 계좌이체 입금이 확인된 후 처리됩니다. 예약 후 안내되는 계좌로
              예약금을 입금해 주시기 바랍니다.
            </ReviewBanner>
          )}

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
              const isAdmin = !!user?.roles.includes('ROLE_ADMIN');
              const upcoming = todayFunction(item.reservationDate);
              const timeText = mergeTimeSlots(item.timeSlots)
                .map(slot => `${slot.startTime} ~ ${slot.endTime}`)
                .join(', ');

              const canPay =
                paymentLive &&
                upcoming &&
                !isAdmin &&
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
                <Card key={item.reservationNo} $tone={status.tone}>
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
                        disabled={payingReservationNo === item.reservationNo}
                        onClick={() => openPayment(item)}
                      >
                        <CreditCard weight="bold" />
                        {payingReservationNo === item.reservationNo
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
                    {paymentLive && item.receiptUrl && (
                      <ActionButton
                        type="button"
                        color="#988271"
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

const NoticeBox = styled.div`
  width: 100%;
  padding: 10px;
`;

const ListBox = styled.div<WithTheme>`
  padding: 40px 0;
  width: 100%;

  @media ${({ theme }) => theme.device.mobile} {
    padding: 20px 0;
  }
`;

// 전 구간 2열. 600px 밑의 좁은 폭은 Row 의 컴팩트 레이아웃이 받는다.
const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;

  @media (max-width: 900px) {
    gap: 10px;
  }

  @media (max-width: 600px) {
    gap: 8px;
  }
`;

const Card = styled.div<WithTheme & { $tone: StatusTone }>`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 10px;
  /* 카드 테두리 전체를 상태 색으로 둘러 목록을 훑을 때 상태가 먼저 보이게 한다 */
  border: 2px solid ${({ $tone }) => STATUS_COLORS[$tone]};
  border-radius: 8px;
  background-color: ${({ theme }) => theme.colors.white};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

  @media (max-width: 600px) {
    padding: 6px;
  }
`;

// 헤더와 행을 한 덩어리로 감싸 표가 닫힌 형태로 보이게 한다.
// overflow:hidden 이라 안쪽 헤더·행이 모서리에 맞춰 잘린다.
// flex:1 + 행의 flex-grow 로 카드 높이가 맞춰질 때 남는 공간을 행들이 나눠 가진다 (빈칸 방지)
const CardTable = styled.div<WithTheme>`
  display: flex;
  flex-direction: column;
  flex: 1;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 6px;
  overflow: hidden;
`;

const Header = styled.div<WithTheme & { $canceled: boolean }>`
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 10px;
  /* 취소된 예약은 헤더를 회색으로 내려 유효 예약과 구분한다 (삭제 표현은 쓰지 않음) */
  background-color: ${({ theme, $canceled }) =>
    $canceled ? theme.colors.grayColor : theme.colors.noticeColor};
  color: ${({ theme }) => theme.colors.white};
  font-size: ${({ theme }) => theme.sizes.medium};
  font-weight: ${({ theme }) => theme.weight.bold};

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${({ theme }) => theme.sizes.small};
  }

  /* 2열이라 장소·배지·일자가 한 줄에 안 들어가므로 위아래로 쌓는다 */
  @media (max-width: 600px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
    padding: 6px 8px;
    font-size: ${({ theme }) => theme.sizes.xsmall};
  }
`;

const HeaderLeft = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  max-width: 100%;
`;

const HeaderPlace = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const HeaderDate = styled.span`
  flex: 0 0 auto;
  font-variant-numeric: tabular-nums;
`;

const StatusBadge = styled.span<WithTheme & { $tone: StatusTone }>`
  display: inline-flex;
  align-items: center;
  flex: 0 0 auto;
  padding: 3px 12px;
  border: 1px solid ${({ theme }) => theme.colors.white};
  border-radius: 4px;
  font-size: ${({ theme }) => theme.sizes.small};
  font-weight: ${({ theme }) => theme.weight.bold};
  letter-spacing: 0.04em;
  color: ${({ theme }) => theme.colors.white};
  background-color: ${({ $tone }) => STATUS_COLORS[$tone]};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${({ theme }) => theme.sizes.xsmall};
  }
`;

const Row = styled.div<WithTheme & { $highlight?: boolean }>`
  display: flex;
  /* 카드 높이가 맞춰질 때 남는 공간을 행들이 균등하게 나눠 흡수한다 */
  flex: 1 1 auto;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  font-size: ${({ theme }) => theme.sizes.small};
  color: ${({ theme }) => theme.colors.subColor};

  &:last-child {
    border-bottom: none;
  }

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${({ theme }) => theme.sizes.xsmall};
  }

  /* 행이 늘어났을 때 글자가 위로 붙지 않게 세로 가운데 정렬 */
  span {
    display: flex;
    align-items: center;
    padding: 8px 10px;
  }

  span:nth-child(1) {
    flex: 1;
    white-space: nowrap;
    background-color: ${({ theme }) => theme.colors.softColor};
    border-right: 1px solid ${({ theme }) => theme.colors.border};
    font-weight: ${({ theme }) => theme.weight.semiBold};
  }

  span:nth-child(2) {
    flex: 2.4;
    white-space: pre-wrap;
    word-break: break-word;
    font-variant-numeric: tabular-nums;
  }

  /* 예약 시간은 핵심 정보라 값 칸만 따뜻한 톤으로 강조한다 */
  ${({ theme, $highlight }) =>
    $highlight &&
    `
    span:nth-child(2) {
      background-color: ${theme.colors.subTextBoxColor};
      color: ${theme.colors.bronzeColor};
      font-weight: ${theme.weight.bold};
    }
  `}

  /* 카드가 좁아 라벨 칸을 따로 둘 수 없으므로, 라벨을 값 앞의 작은 회색 글씨로 붙인다.
     칸 배경·수직선을 없애 회색/흰색 띠가 쌓이는 것도 같이 사라진다 */
  @media (max-width: 600px) {
    align-items: baseline;
    padding: 5px 6px;

    span {
      padding: 0;
    }

    span:nth-child(1) {
      flex: none;
      padding-right: 5px;
      background-color: transparent;
      border-right: none;
      color: ${({ theme }) => theme.colors.grayColor};
      font-size: ${({ theme }) => theme.sizes.xxsmall};
      font-weight: ${({ theme }) => theme.weight.semiBold};
    }

    span:nth-child(2) {
      flex: 1;
    }
  }
`;

const ActionBox = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding-top: 8px;
`;

const ActionButton = styled.button<WithTheme & { color: string }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  flex: 1 1 auto;
  min-width: 120px;
  padding: 8px 14px;
  border: none;
  border-radius: 4px;
  background-color: ${({ color }) => color};
  color: ${({ theme }) => theme.colors.white};
  font-size: ${({ theme }) => theme.sizes.small};
  font-weight: ${({ theme }) => theme.weight.semiBold};
  cursor: pointer;

  svg {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }

  &:hover {
    opacity: 0.85;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }

  @media (max-width: 900px) {
    min-width: 96px;
    padding: 8px 10px;
  }

  /* 카드가 좁아지므로 최소폭을 풀고 한 줄에 두 개까지 들어가게 한다 */
  @media (max-width: 600px) {
    min-width: 0;
    gap: 4px;
    padding: 8px 6px;
    font-size: ${({ theme }) => theme.sizes.xsmall};

    svg {
      width: 13px;
      height: 13px;
    }
  }
`;

const SearchWrapper = styled.div.withConfig({
  shouldForwardProp: prop => prop !== 'bgColor',
})<{ bgColor: string } & WithTheme>`
  display: flex;
  width: 100%;
  background-color: ${({ bgColor }) => bgColor};
  padding: 20px;
  align-items: center;

  @media ${({ theme }) => theme.device.mobile} {
    flex-direction: column;
    padding: 10px;
  }
`;

const TitleBox = styled.div.withConfig({
  shouldForwardProp: prop => prop !== 'textColor',
})<{ textColor: string } & WithTheme>`
  display: flex;
  flex-direction: column;
  width: 60%;
  height: 60px;
  color: ${({ textColor }) => textColor};

  h2 {
    font-family: 'Bungee', sans-serif;
    font-weight: ${({ theme }) => theme.weight.bold};
    font-size: ${({ theme }) => theme.sizes.xxlarge};
  }
  p {
    margin-top: auto;
    font-weight: ${({ theme }) => theme.weight.semiBold};
    font-size: ${({ theme }) => theme.sizes.medium};
  }

  @media ${({ theme }) => theme.device.mobile} {
    width: 100%;
    height: 40px;
    text-align: center;
    margin-bottom: 10px;

    h2 {
      font-size: ${({ theme }) => theme.sizes.large};
    }
    p {
      font-size: ${({ theme }) => theme.sizes.xsmall};
    }
  }
`;

const SearchBox = styled.div<WithTheme>`
  width: 40%;

  @media ${({ theme }) => theme.device.mobile} {
    width: 100%;
  }
`;

const PaginationWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 20px;
`;

const NoSearchBox = styled.div<WithTheme>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  font-size: ${({ theme }) => theme.sizes.menu};
  font-weight: ${({ theme }) => theme.weight.semiBold};
  font-family: 'Jua', sans-serif;
  margin-top: 20px;

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${({ theme }) => theme.sizes.small};
  }
`;

const InfoBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
`;

const InfoSummary = styled.div<WithTheme>`
  font-size: ${({ theme }) => theme.sizes.xsmall};
  font-weight: ${({ theme }) => theme.weight.semiBold};
  color: ${({ theme }) => theme.colors.redColor};
  line-height: 1.4;
`;

const InfoToggle = styled.button<WithTheme>`
  align-self: flex-start;
  padding: 6px 12px;
  border: 1px solid ${({ theme }) => theme.colors.lineColor};
  border-radius: 999px;
  background-color: ${({ theme }) => theme.colors.softColor};
  color: ${({ theme }) => theme.colors.subColor};
  font-size: ${({ theme }) => theme.sizes.xsmall};
  font-weight: ${({ theme }) => theme.weight.semiBold};
  cursor: pointer;
`;

const ReviewBanner = styled.div<WithTheme>`
  margin-bottom: 12px;
  padding: 12px 14px;
  border: 1px solid #f0d9a8;
  border-radius: 8px;
  background: #fff7e6;
  color: #7a5b16;
  font-size: ${({ theme }) => theme.sizes.medium};
  font-weight: ${({ theme }) => theme.weight.semiBold};
  line-height: 1.5;

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${({ theme }) => theme.sizes.xxsmall};
  }
`;

const TextBox = styled.div<WithTheme>`
  display: flex;
  flex-direction: column;
  justify-content: right;
  margin-bottom: 10px;
  width: 100%;
  font-size: ${({ theme }) => theme.sizes.medium};
  line-height: 1.4;
  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${({ theme }) => theme.sizes.xxsmall};
  }

  p {
    color: ${({ theme }) => theme.colors.subColor};
  }

  span {
    color: ${({ theme }) => theme.colors.redColor};
    font-weight: ${({ theme }) => theme.weight.semiBold};
  }
`;
