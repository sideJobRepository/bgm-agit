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
              <span>ID</span>
              <span>날짜</span>
            </Header>
            <HeaderData>
              <span>{item.matchsId}</span>
              <span>{item.registDate}</span>
            </HeaderData>
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

// 스타일
const CardGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: flex-start;
`;

const Card = styled.div`
  background-color: #fff;
  border-radius: 12px;
  padding: 12px;
  width: 320px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
`;

const Header = styled.div`
  background: #e6dbff;
  display: flex;
  justify-content: space-between;
  padding: 6px 8px;
  font-weight: bold;
  font-size: 13px;
`;

const HeaderData = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 4px 8px;
  font-size: 13px;
  margin-bottom: 6px;
`;

const Row = styled.div<{ $highlight?: boolean }>`
  display: flex;
  justify-content: space-between;
  padding: 6px 8px;
  font-size: 13px;
  background-color: ${({ $highlight }) => ($highlight ? '#fffecd' : '#f9f9f9')};
  border-bottom: 1px solid #eee;
`;

const PaginationWrapper = styled.div`
  margin: 32px auto;
  display: flex;
  justify-content: center;
`;
