'use client';

import styled from 'styled-components';
import { HistRecord } from '@/store/record';
import React from 'react';

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
  data: HistRecord[];
};

const LEADER_POSITIONS = [
  { label: '동장', value: 'EAST' },
  { label: '남장', value: 'SOUTH' },
  { label: '서장', value: 'WEST' },
  { label: '북장', value: 'NORTH' },
];

export function HistBaseCardTable({ data }: BaseCardTableProps) {
  const getLabelByValue = (value: string) => {
    return LEADER_POSITIONS.find((item) => item.value === value)?.label;
  };

  return (
    <CardWrap>
      <CardGrid>
        {data.map((item, idx) => (
          <Card key={idx}>
            <ModifyBox>{item.modifyName}</ModifyBox>
            <Header>
              <span>{getLabelByValue(item.matchsWind)}</span>
              <span>대회여부 : {item.tournamentStatus === 'Y' ? '예' : '아니오'}</span>
              <span>{item.modifyDate}</span>
            </Header>
            {/*<HeaderData>*/}
            {/*  <span>{item.matchsId}</span>*/}
            {/*  <span>{item.registDate}</span>*/}
            {/*</HeaderData>*/}
            {item.recordHistory.map((row, idx) => (
              <Row key={idx} $highlight={row.rank === 1}>
                <span>{row.seat}</span>
                <span>{row.rank}</span>
                <span>{row.nickName}</span>
                <span>{row.score.toLocaleString()}</span>
                <span>{row.point}</span>
              </Row>
            ))}
            <HistResonBox>
              <textarea
                disabled={true}
                value={item.changeReason}
                placeholder="수정사유를 입력해주세요."
              />
            </HistResonBox>
          </Card>
        ))}
      </CardGrid>
    </CardWrap>
  );
}

const CardWrap = styled.div`
  display: flex;
  flex-direction: column;
  overflow: auto;
  width: 100%;
  height: 100%;
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 16px;

  // @media ${({ theme }) => theme.device.tablet} {
  //   grid-template-columns: repeat(2, 1fr);
  // }
  //
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

const ModifyBox = styled.div`
  text-align: right;
  margin-bottom: 8px;
  font-size: ${({ theme }) => theme.desktop.sizes.xl};
  color: ${({ theme }) => theme.colors.inputColor};
  font-weight: 600;

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${({ theme }) => theme.mobile.sizes.xl};
  }
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

const HistResonBox = styled.div`
  display: inline-flex;
  width: 100%;
  flex-direction: column;

  textarea {
    border: none;
    width: 100%;
    resize: none;
    padding: 8px 12px;
    text-align: left;
    font-size: ${({ theme }) => theme.desktop.sizes.md};
    outline: none;
    color: ${({ theme }) => theme.colors.inputColor};
    background: ${({ theme }) => theme.colors.whiteColor};
    border-radius: 4px;

    &::placeholder {
      color: ${({ theme }) => theme.colors.grayColor};
    }

    @media ${({ theme }) => theme.device.mobile} {
      font-size: ${({ theme }) => theme.mobile.sizes.md};
    }
  }
`;
