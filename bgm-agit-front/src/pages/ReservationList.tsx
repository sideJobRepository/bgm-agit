import { Wrapper } from '../styles';
import SearchBar from '../components/SearchBar.tsx';
import styled from 'styled-components';
import type { WithTheme } from '../styles/styled-props.ts';
import { useEffect, useState } from 'react';
import { useReservationListFetch, useUpdatePost } from '../recoil/fetch.ts';
import { useRecoilValue } from 'recoil';
import { reservationListDataState } from '../recoil/state/reservationState.ts';
import { userState } from '../recoil/state/userState.ts';
import { showConfirmModal } from '../components/confirmAlert.tsx';
import { toast } from 'react-toastify';
import type { Reservation } from '../types/reservation.ts';

export default function ReservationList() {
  const user = useRecoilValue(userState);

  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const start = dateRange[0]?.toISOString().slice(0, 10) ?? null;
  const end = dateRange[1]?.toISOString().slice(0, 10) ?? null;

  const fetchReservationList = useReservationListFetch();
  const { update } = useUpdatePost();
  const items = useRecoilValue(reservationListDataState);
  const [page, setPage] = useState(0);

  const handlePageClick = (pageNum: number) => {
    setPage(pageNum);
  };

  function todayFunction(date) {
    const today = new Date().toISOString().slice(0, 10);

    return date >= today;
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
          <TextBox>
            <p>
              • 계좌 : 하나은행 60891052636607 <br />• 예금주 : 박x후
            </p>
            <span>
              ※ 예약금은 10,000원이며, 반드시 예약자명으로 입금해주시기 바랍니다.
              <br />※ 확정 후 취소의 경우 0507-1445-3503로 문의 주시기 바랍니다.
            </span>
          </TextBox>
          <TableWrapper>
            <Table>
              <thead>
                <tr>
                  <Th>번호</Th>
                  <Th>예약 장소</Th>
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
                            item.approvalStatus !== 'Y' &&
                            item.cancelStatus !== 'Y' && (
                              <Button
                                color="#FF5E57"
                                onClick={() => updateData(item, false, 'Y', 'N')}
                              >
                                취소
                              </Button>
                            )}
                        </ButtonBox2>
                      </StatusBox>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
            {items?.content.length === 0 && <NoSearchBox>검색된 결과가 없습니다.</NoSearchBox>}
            <PaginationWrapper>
              {[...Array(items?.totalPages ?? 0)].map((_, idx) => (
                <PageButton key={idx} active={idx === page} onClick={() => handlePageClick(idx)}>
                  {idx + 1}
                </PageButton>
              ))}
            </PaginationWrapper>
          </TableWrapper>
        </TableBox>
      </NoticeBox>
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

const PageButton = styled.button.withConfig({
  shouldForwardProp: prop => prop !== 'active',
})<{ active: boolean } & WithTheme>`
  margin: 0 5px;
  padding: 4px 8px;
  border: 1px solid ${({ theme }) => theme.colors.basicColor};
  border-radius: 4px;
  cursor: pointer;
  background-color: ${({ active, theme }) =>
    active ? theme.colors.noticeColor : theme.colors.white};
  color: ${({ active, theme }) => (active ? theme.colors.white : theme.colors.subColor)};

  &:hover {
    opacity: 0.8;
  }
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
