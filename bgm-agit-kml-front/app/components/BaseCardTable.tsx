'use client';

import styled from 'styled-components';
import Pagination from '@/app/components/Pagination';
import { useUserStore } from '@/store/user';
import { FileText, TrashSimple, Share, ClockCounterClockwise } from 'phosphor-react';
import { alertDialog, confirmDialog } from '@/utils/alert';
import { useDeletePost } from '@/services/main.service';
import { useRouter } from 'next/navigation';
import { useFetchDayRecordList } from '@/services/dayRecord.service';
import { useState } from 'react';
import Modal from '@/app/modal/modal';
import { HistBaseCardTable } from '@/app/components/HistBaseCardTable';
import { useFetchHistWrite } from '@/services/record.service';
import { useHistRecordStore } from '@/store/record';

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
  matchsWind: string;
  tournamentStatus: string;
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

const LEADER_POSITIONS = [
  { label: '동장', value: 'EAST' },
  { label: '남장', value: 'SOUTH' },
  { label: '서장', value: 'WEST' },
  { label: '북장', value: 'NORTH' },
];

export function BaseCardTable({ data, page, onPageChange }: BaseCardTableProps) {
  const { remove } = useDeletePost();
  const router = useRouter();
  const fetchDayRecord = useFetchDayRecordList();

  console.log('data', data);

  const user = useUserStore((state) => state.user);

  //히스토리
  const fetchHistRecord = useFetchHistWrite();
  const histData = useHistRecordStore((state) => state.histRecord);
  console.log('histData', histData);
  const [historyOpen, setHistoryOpen] = useState(false);

  const getHist = async (id: number) => {
    fetchHistRecord(id);

    setHistoryOpen(true);
  };

  const deleteData = async (id: number) => {
    const result = await confirmDialog('해당 기록을 삭제 하시겠습니까?', 'warning');

    if (result.isConfirmed) {
      remove({
        url: `/bgm-agit/record/${id}`,
        ignoreErrorRedirect: true,
        onSuccess: async () => {
          await alertDialog('기록이 삭제되었습니다.', 'success');
          fetchDayRecord({ page });
        },
      });
    }
  };

  const editWriteMove = (id: number) => {
    router.push(`/write?id=${id}`);
  };

  //공유하기
  function shareReservation(item: MatchType) {
    if (!window.Kakao || !window.Kakao.isInitialized()) return;

    const rowsText = item.rows
      .map(
        (row) =>
          `${row.seat} ${row.nickname} ${row.score.toLocaleString()} (${row.point > 0 ? '+' : ''}${row.point})`
      )
      .join('\n');

    const text =
      '\u200B[BGM KML 기록 안내]\n\n' +
      `ID: ${item.matchsId}\n` +
      `기록일자: ${item.registDate}\n\n` +
      rowsText;

    window.Kakao.Share.sendDefault({
      objectType: 'text',
      text,
      link: {
        mobileWebUrl: 'https://bgmagit.co.kr/record',
        webUrl: 'https://bgmagit.co.kr/record',
      },
    });
  }

  const getLabelByValue = (value: string) => {
    return LEADER_POSITIONS.find((item) => item.value === value)?.label;
  };
  return (
    <>
      <CardGrid>
        {data.content.map((item) => (
          <Card key={item.matchsId}>
            <ButtonBox>
              {(user?.roles.includes('ROLE_ADMIN') || user?.roles.includes('MENTOR')) && (
                <>
                  <Button color="#415B9C">
                    <FileText weight="bold" onClick={() => editWriteMove(item.matchsId)} />
                  </Button>
                  <Button onClick={() => deleteData(item.matchsId)} color="#D9625E">
                    <TrashSimple weight="bold" />
                  </Button>
                </>
              )}
              <Button onClick={() => getHist(item.matchsId)} color="#757575">
                <ClockCounterClockwise weight="bold" />
              </Button>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  shareReservation(item);
                }}
                color="#093A6E"
              >
                <Share weight="bold" />
              </Button>
            </ButtonBox>
            <Header>
              <span>{getLabelByValue(item.matchsWind)}</span>
              <span>대회여부 : {item.tournamentStatus === 'Y' ? '예' : '아니오'}</span>

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
      {histData && (
        <Modal open={historyOpen} onClose={() => setHistoryOpen(false)}>
          <HistBaseCardTable data={histData} />
        </Modal>
      )}
    </>
  );
}

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 16px;
  padding: 0 12px;

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

const Header = styled.div`
  background-color: ${({ theme }) => theme.colors.blueColor};
  color: ${({ theme }) => theme.colors.whiteColor};
  display: flex;
  justify-content: space-between;
  padding: 6px 8px;
  font-size: ${({ theme }) => theme.desktop.sizes.md};
  font-weight: 600;

  > div {
    display: inline-flex;
    gap: 8px;
  }

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
