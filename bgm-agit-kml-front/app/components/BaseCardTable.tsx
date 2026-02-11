'use client';

import styled from 'styled-components';
import Pagination from '@/app/components/Pagination';

type RowType = {
  seat: string;
  rank: number;
  nickname: string;
  score: number;
  point: number;
};

type MatchType = {
  matchsId: number;
  registDate: string;
  rows: RowType[];
};

type BaseCardTableProps = {
  data: {
    content: MatchType[];
    totalPages: number;
  };
  page: number;
  onPageChange: (page: number) => void;
};

export function BaseCardTable({ data, page, onPageChange }: BaseCardTableProps) {
  return (
    <>
      <CardGrid>
        {data.content.map((item) => (
          <Card key={item.matchsId}>
            <Header>
              <span>ID: {item.matchsId}</span>
              <span>{item.registDate}</span>
            </Header>
            {/*<HeaderData>*/}
            {/*  <span>{item.matchsId}</span>*/}
            {/*  <span>{item.registDate}</span>*/}
            {/*</HeaderData>*/}
            {item.rows.map((row, idx) => (
              <Row key={idx} $highlight={row.rank === 1}>
                <span>{row.seat}</span>
                <span>{row.rank}</span>
                <span>{row.nickname}</span>
                <span>{row.score.toLocaleString()}</span>
                <span>{row.point}</span>
              </Row>
            ))}
          </Card>
        ))}
      </CardGrid>

      <PaginationWrapper>
        <Pagination current={page} totalPages={data.totalPages} onChange={onPageChange} />
      </PaginationWrapper>
    </>
  );
}

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr); // 한 줄에 3개
  gap: 16px;
  padding: 0 12px;

  @media ${({ theme }) => theme.device.tablet} {
    grid-template-columns: repeat(2, 1fr);
  }

  @media ${({ theme }) => theme.device.mobile} {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background-color: ${({ theme }) => theme.colors.recordBgColor};
  border-radius: 4px;
  padding: 8px;
  width: 100%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
`;

const Header = styled.div`
  background-color: ${({ theme }) => theme.colors.blueColor};
  color: ${({ theme }) => theme.colors.whiteColor};
  display: flex;
  justify-content: space-between;
  padding: 6px 8px;
  font-size: ${({ theme }) => theme.desktop.sizes.md};
  font-weight: 600;

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${({ theme }) => theme.mobile.sizes.md};
  }
`;

const Row = styled.div<{ $highlight?: boolean }>`
  display: flex;
  justify-content: space-between;
  padding: 6px 8px;
  background-color: ${({ $highlight }) => ($highlight ? '#4A90E2' : '#ffffff')};
  color: ${({ $highlight }) => ($highlight ? '#ffffff' : '#1d1d1f')};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  font-size: ${({ theme }) => theme.desktop.sizes.md};
  font-weight: 400;

  span:nth-child(1) {
    flex: 1; // seat (EAST/SOUTH 등)
    text-align: left;
  }
  span:nth-child(2) {
    flex: 0.5; // rank
    text-align: center;
  }
  span:nth-child(3) {
    flex: 2; // nickname
    text-align: left;
  }
  span:nth-child(4) {
    flex: 1.5; // score
    text-align: right;
  }
  span:nth-child(5) {
    flex: 1; // point
    text-align: right;
  }

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${({ theme }) => theme.mobile.sizes.md};
  }
`;

const PaginationWrapper = styled.div`
  margin: 32px auto;
  display: flex;
  justify-content: center;
`;
