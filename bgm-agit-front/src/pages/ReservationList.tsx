import { Wrapper } from '../styles';
import SearchBar from '../components/SearchBar.tsx';
import styled from 'styled-components';
import type { WithTheme } from '../styles/styled-props.ts';
import { useEffect, useState } from 'react';
import { useReservationListFetch } from '../recoil/fetch.ts';
import { useRecoilValue } from 'recoil';
import { reservationListDataState } from '../recoil/state/reservationState.ts';

export default function ReservationList() {
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const fetchReservationList = useReservationListFetch();
  const items = useRecoilValue(reservationListDataState);
  const [page, setPage] = useState(0);

  const handlePageClick = (pageNum: number) => {
    setPage(pageNum);
  };

  useEffect(() => {
    const start = dateRange[0]?.toISOString().slice(0, 10) ?? null;
    const end = dateRange[1]?.toISOString().slice(0, 10) ?? null;
    fetchReservationList(page, { startDate: start, endDate: end });
  }, [dateRange, page]);

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
              label="예약자 및 날짜"
              onSearch={setDateRange}
            />
          </SearchBox>
        </SearchWrapper>

        <TableBox>
          <TableWrapper>
            <Table>
              <thead>
                <tr>
                  <Th>번호</Th>
                  <Th>예약 장소</Th>
                  <Th>날짜</Th>
                  <Th>시간</Th>
                  <Th>예약자</Th>
                  <Th>상태</Th>
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
                    <Td>
                      {item.cancelStatus === 'Y'
                        ? '취소'
                        : item.approvalStatus === 'Y'
                          ? '확정'
                          : '대기'}
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

    &:hover {
      opacity: 0.6;
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
