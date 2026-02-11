'use client';

import styled from 'styled-components';
import Pagination from '@/app/components/Pagination';
import { useUserStore } from '@/store/user';
import { FileText, TrashSimple } from 'phosphor-react';

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
  const user = useUserStore((state) => state.user);
  console.log('user', user);
  return (
    <>
      <CardGrid>
        {data.content.map((item) => (
          <Card key={item.matchsId}>
            {(user?.roles.includes('ROLE_ADMIN') || user?.roles.includes('MENTOR')) && (
              <ButtonBox>
                <>
                  <Button color="#415B9C">
                    <FileText weight="bold" />
                  </Button>
                  <Button color="#D9625E">
                    <TrashSimple weight="bold" />
                  </Button>
                </>
              </ButtonBox>
            )}
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

  span {
    padding: 0 8px;
  }

  span:nth-child(1) {
    flex: 1; // seat (EAST/SOUTH 등)
    text-align: center;
    border-right: 1px solid ${({ theme }) => theme.colors.border};
  }
  span:nth-child(2) {
    flex: 0.5; // rank
    text-align: center;
    border-right: 1px solid ${({ theme }) => theme.colors.border};
  }
  span:nth-child(3) {
    flex: 2; // nickname
    text-align: left;
    border-right: 1px solid ${({ theme }) => theme.colors.border};
  }
  span:nth-child(4) {
    flex: 1.5; // score
    text-align: center;
    border-right: 1px solid ${({ theme }) => theme.colors.border};
  }
  span:nth-child(5) {
    flex: 1; // point
    text-align: center;
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

const ButtonBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  flex: 1;
  margin-bottom: 8px;
`;

const Button = styled.button<{ color: string }>`
  display: flex;
  align-items: center;
  padding: 4px;
  background-color: ${({ color }) => color};
  color: ${({ theme }) => theme.colors.white};
  font-size: ${({ theme }) => theme.desktop.sizes.md};
  border: none;
  border-radius: 999px;
  cursor: pointer;
  white-space: nowrap;
  box-shadow: 2px 4px 2px rgba(0, 0, 0, 0.2);
  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${({ theme }) => theme.mobile.sizes.md};
  }

  svg {
    width: 12px;
    height: 12px;
  }

  &:hover {
    opacity: 0.8;
  }
`;
