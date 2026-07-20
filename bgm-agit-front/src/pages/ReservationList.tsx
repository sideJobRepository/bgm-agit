import { Wrapper } from '../styles';
import SearchBar from '../components/SearchBar.tsx';
import styled from 'styled-components';
import type { WithTheme } from '../styles/styled-props.ts';
import { useCallback, useEffect, useState } from 'react';
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

export default function ReservationList() {
  const user = useRecoilValue(userState);
  // 결제 라이브 여부. false(심사 기간)면 결제해도 실제 출금/자동확정이 안 되므로 안내 배너 노출
  const paymentLive = PAYMENT_LIVE;

  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const start = dateRange[0]?.toISOString().slice(0, 10) ?? null;
  const end = dateRange[1]?.toISOString().slice(0, 10) ?? null;

  const fetchReservationList = useReservationListFetch();
  const { update } = useUpdatePost();
  const items = useRecoilValue(reservationListDataState);
  const [page, setPage] = useState(0);
  const [paymentOrder, setPaymentOrder] = useState<PaymentOrderResponse | null>(null);
  const [payingReservationNo, setPayingReservationNo] = useState<number | null>(null);
  const closePaymentModal = useCallback(() => setPaymentOrder(null), []);

  const handlePageClick = (pageNum: number) => {
    setPage(pageNum);
  };

  function getTodayText() {
    return new Date().toLocaleDateString('sv-SE');
  }

  function todayFunction(date: string) {
    const today = getTodayText();

    return date >= today;
  }

  function canCancelBeforeReservationDate(item: Reservation) {
    return item.cancelStatus !== 'Y' && item.reservationDate > getTodayText();
  }

  useEffect(() => {
    fetchReservationList(page, { startDate: start, endDate: end });
  }, [dateRange, page]);

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
            fetchReservationList(page, { startDate: start, endDate: end });
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

        <TableBox>
          {!paymentLive && (
            <ReviewBanner>
              예약 확정은 예약금 계좌이체 입금이 확인된 후 처리됩니다. 예약 후 안내되는 계좌로
              예약금을 입금해 주시기 바랍니다.
            </ReviewBanner>
          )}
          <TextBox>
            <span>
              ※ 예약 대기 상태에서 결제 버튼을 눌러 예약금을 결제하면 예약이 확정됩니다.
              <br />※ 예약금은 M Room 30,000원, 그 외 예약 10,000원입니다.
              <br />※ 잔여 이용요금은 현장에서 결제합니다.
              <br />※ 예약 취소는 예약일 전날까지만 가능합니다. 당일 취소는 불가합니다.
              <br />※ 확정 후 취소 또는 환불 문의는 0507-1445-3503로 연락 부탁드립니다.
            </span>
          </TextBox>
          <TableWrapper>
            <Table>
              <thead>
                <tr>
                  <Th>번호</Th>
                  <Th>예약 장소</Th>
                  <Th>신청 일자</Th>
                  <Th>예약 일자</Th>
                  <Th>예약 시간</Th>
                  <Th>예약자</Th>
                  <Th>예약 인원</Th>
                  <Th>요청 사항</Th>
                  <Th>연락처</Th>
                  <Th>예약 상태</Th>
                </tr>
              </thead>
              <tbody>
                {items?.content.map((item, index) => (
                  <tr key={item.reservationNo}>
                    <Td>{index + 1}</Td>
                    <Td>{item.reservationAddr}</Td>
                    <Td>{item.registDate}</Td>
                    <Td>{item.reservationDate}</Td>
                    <Td>
                      {item.timeSlots.map((slot, idx) => (
                        <TimeText key={idx}>
                          {slot.startTime} ~ {slot.endTime}
                        </TimeText>
                      ))}
                    </Td>
                    <Td>{item.reservationMemberName}</Td>
                    <Td>{`${item?.reservationPeople}명`} </Td>
                    <Td>{item?.reservationRequest}</Td>
                    <Td>{item?.phoneNo}</Td>
                    <Td>
                      <StatusBox>
                        {item.cancelStatus === 'Y'
                          ? '취소'
                          : item.approvalStatus === 'Y'
                            ? '확정'
                            : '대기'}

                        <ButtonBox2>
                          {/* 어드민인 경우 */}
                          {todayFunction(item.reservationDate) &&
                            user?.roles.includes('ROLE_ADMIN') && (
                              <>
                                {item.approvalStatus === 'Y' && item.cancelStatus !== 'Y' && (
                                  <Button
                                    color="#FF5E57"
                                    onClick={() => updateData(item, true, 'Y', 'N')}
                                  >
                                    취소
                                  </Button>
                                )}

                                {item.approvalStatus !== 'Y' && item.cancelStatus !== 'Y' && (
                                  <>
                                    <Button
                                      color="#FF5E57"
                                      onClick={() => updateData(item, true, 'Y', 'N')}
                                    >
                                      취소
                                    </Button>
                                    <Button
                                      color="#1A7D55"
                                      onClick={() => updateData(item, true, 'N', 'Y')}
                                    >
                                      확정
                                    </Button>
                                  </>
                                )}
                              </>
                            )}

                          {todayFunction(item.reservationDate) &&
                            !user?.roles.includes('ROLE_ADMIN') &&
                            canCancelBeforeReservationDate(item) && (
                              <Button
                                color="#FF5E57"
                                onClick={() => updateData(item, false, 'Y', 'N')}
                              >
                                취소
                              </Button>
                            )}
                          {todayFunction(item.reservationDate) &&
                            !user?.roles.includes('ROLE_ADMIN') &&
                            item.approvalStatus !== 'Y' &&
                            item.cancelStatus !== 'Y' && (
                              <Button
                                color="#1A7D55"
                                disabled={payingReservationNo === item.reservationNo}
                                onClick={() => openPayment(item)}
                              >
                                {payingReservationNo === item.reservationNo
                                  ? '결제 준비중'
                                  : '예약금 결제'}
                              </Button>
                            )}
                          {paymentLive && item.receiptUrl && (
                            <Button
                              color="#988271"
                              onClick={() =>
                                window.open(
                                  item.receiptUrl as string,
                                  '_blank',
                                  'noopener,noreferrer',
                                )
                              }
                            >
                              영수증
                            </Button>
                          )}
                          <Button color="#093A6E" onClick={() => shareReservation(item)}>
                            공유
                          </Button>
                        </ButtonBox2>
                      </StatusBox>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
            {items?.content.length === 0 && <NoSearchBox>검색된 결과가 없습니다.</NoSearchBox>}
            <PaginationWrapper>
              <Pagination
                current={page}
                totalPages={items?.totalPages}
                onChange={handlePageClick}
              />
            </PaginationWrapper>
          </TableWrapper>
        </TableBox>
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

const TableBox = styled.div`
  padding: 40px 0;
  overflow-x: auto;
  width: 100%;
  white-space: nowrap;
`;

const TableWrapper = styled.div<WithTheme>`
  display: inline-block;
  width: 100%;
  @media ${({ theme }) => theme.device.mobile} {
    width: unset;
  }
`;

const Table = styled.table<WithTheme>`
  width: 100%;
  border-collapse: collapse;
  font-size: ${({ theme }) => theme.sizes.medium};
  color: ${({ theme }) => theme.colors.subColor};

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${({ theme }) => theme.sizes.xsmall};
  }

  th,
  td {
    padding: 14px;
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  tbody tr {
    cursor: pointer;

    @media ${({ theme }) => theme.device.mobile} {
      font-size: ${({ theme }) => theme.sizes.xxsmall};
    }
  }

  td {
    border-bottom: 1px solid ${({ theme }) => theme.colors.lineColor};
  }
`;

const Th = styled.th<WithTheme>`
  background-color: ${({ theme }) => theme.colors.basicColor};
  font-weight: ${({ theme }) => theme.weight.semiBold};
`;

const Td = styled.td``;

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

const TimeText = styled.div`
  font-variant-numeric: tabular-nums;
`;

const StatusBox = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: center;
`;

const ButtonBox2 = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  justify-content: center;
`;

const Button = styled.button<WithTheme & { color: string }>`
  padding: 6px 16px;
  background-color: ${({ color }) => color};
  color: ${({ theme }) => theme.colors.white};
  font-size: ${({ theme }) => theme.sizes.medium};
  border: none;
  border-radius: 4px;
  cursor: pointer;

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${({ theme }) => theme.sizes.xxsmall};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }
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
