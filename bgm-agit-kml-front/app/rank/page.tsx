'use client';

import { motion } from 'framer-motion';
import styled, { keyframes } from 'styled-components';
import { withBasePath } from '@/lib/path';
import { useEffect, useMemo, useState } from 'react';
import { BaseColumn, BaseTable } from '@/app/components/BaseTable';
import { useLoadingStore } from '@/store/loading';
import BaseTableSkeleton from '@/app/components/BaseTableSkeleton';
import { RankItem, useRankListStore } from '@/store/rank';
import { useFetchRankList } from '@/services/rank.service';

export default function RankPage() {
  const fetchRank = useFetchRankList();
  const rankList = useRankListStore((state) => state.rank);
  const [rankType, setRankType] = useState<'WEEKLY' | 'MONTHLY' | 'CUSTOM'>('MONTHLY');
  const [startDate, setStartDate] = useState<Date | null>(() => new Date());
  const [endDate, setEndDate] = useState<Date | null>(() => new Date());
  const [page, setPage] = useState(0);

  const formatDate = (date: Date | null) => (date ? date.toISOString().split('T')[0] : '');

  const formatLocalDateTime = (date: Date | null) => {
    if (!date) return '';
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
  };

  const buildParams = (overridePage?: number) => {
    const base = { page: overridePage ?? page, type: rankType };
    if (rankType === 'CUSTOM') {
      return {
        ...base,
        startDateTime: formatLocalDateTime(startDate),
        endDateTime: formatLocalDateTime(endDate),
      };
    }
    return { ...base, baseDate: formatDate(startDate) };
  };

  const loading = useLoadingStore((state) => state.loading);
  const isReady = !loading && rankList;

  const columns = useMemo<BaseColumn<RankItem>[]>(
    () => [
      {
        key: 'rank',
        header: '순위',
        align: 'center',
        nowrap: true,
        render: (row) => row.rank,
      },
      {
        key: 'memberNickname',
        header: '이름',
        align: 'center',
        nowrap: true,
        render: (row) => row.memberNickname,
      },
      {
        key: 'recordSumPoint',
        header: '총점',
        align: 'center',
        nowrap: true,
        render: (row) => row.recordSumPoint,
      },
      {
        key: 'firstRate',
        header: '1%',
        align: 'center',
        nowrap: true,
        render: (row) => row.firstRate,
      },
      {
        key: 'top2Rate',
        header: '12%',
        align: 'center',
        nowrap: true,
        render: (row) => row.top2Rate,
      },
      {
        key: 'plusRate',
        header: '+%',
        align: 'center',
        nowrap: true,
        render: (row) => row.plusRate,
      },
      {
        key: 'minus2Rate',
        header: '-2%',
        align: 'center',
        nowrap: true,
        render: (row) => row.minus2Rate,
      },
      {
        key: 'plus3Rate',
        header: '+3%',
        align: 'center',
        nowrap: true,
        render: (row) => row.plus3Rate,
      },
      {
        key: 'fourthRate',
        header: '4%',
        align: 'center',
        nowrap: true,
        render: (row) => row.fourthRate,
      },
      {
        key: 'tobiRate',
        header: '토비%',
        align: 'center',
        nowrap: true,
        render: (row) => row.tobiRate,
      },
      {
        key: 'tobiMinus3Rate',
        header: '토비-3%',
        align: 'center',
        nowrap: true,
        render: (row) => row.tobiMinus3Rate,
      },

      // 횟수 영역
      {
        key: 'firstCount',
        header: '1',
        align: 'center',
        nowrap: true,
        render: (row) => row.firstCount,
      },
      {
        key: 'secondCount',
        header: '2',
        align: 'center',
        nowrap: true,
        render: (row) => row.secondCount,
      },
      {
        key: 'thirdCount',
        header: '3',
        align: 'center',
        nowrap: true,
        render: (row) => row.thirdCount,
      },
      {
        key: 'fourthCount',
        header: '4',
        align: 'center',
        nowrap: true,
        render: (row) => row.fourthCount,
      },

      {
        key: 'avgRank',
        header: '순위%',
        align: 'center',
        nowrap: true,
        render: (row) => row.avgRank,
      },
      {
        key: 'totalCount',
        header: '국수',
        align: 'center',
        nowrap: true,
        render: (row) => row.totalCount,
      },
    ],
    []
  );

  const getRankRowClassName = (row: RankItem) => {
    if (row.rank === 1) return 'rank-gold';
    if (row.rank === 2) return 'rank-silver';
    if (row.rank === 3) return 'rank-bronze';
    return undefined;
  };

  const getRankCellClassName = (_row: RankItem, col: BaseColumn<RankItem>) => {
    const blueKeys = new Set(['firstRate', 'firstCount']);
    const greenKeys = new Set(['top2Rate', 'plusRate', 'minus2Rate', 'plus3Rate']);
    const redKeys = new Set(['fourthRate', 'tobiRate', 'tobiMinus3Rate', 'fourthCount']);

    if (blueKeys.has(col.key)) return 'cell-blue';
    if (greenKeys.has(col.key)) return 'cell-green';
    if (redKeys.has(col.key)) return 'cell-red';
    return undefined;
  };

  useEffect(() => {
    if (rankType === 'CUSTOM') {
      if (!startDate || !endDate) return;
      if (endDate.getTime() <= startDate.getTime()) return;
    }
    fetchRank(buildParams());
  }, [page, rankType, startDate, endDate]);

  return (
    <Wrapper>
      <Hero>
        <HeroBg>
          <img src={withBasePath('/rankHero.jpg')} alt="상단 이미지" />
        </HeroBg>
        <FixedDarkOverlay />
        <HeroOverlay
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{
            duration: 1.2,
            ease: [0.65, 0, 0.35, 1],
          }}
        />

        <HeroContent>
          <h1>Rankings</h1>
          <span>주간 및 월간 랭킹을 확인하세요.</span>
        </HeroContent>
      </Hero>
      <TableBox>
        {isReady ? (
          <BaseTable
            columns={columns}
            data={rankList.content}
            page={page}
            searchLabel="검색"
            totalPages={rankList.totalPages}
            onPageChange={setPage}
            rankType={rankType}
            onRankTypeChange={setRankType}
            startDate={startDate}
            endDate={endDate}
            showWriteButton={true}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            getRowClassName={getRankRowClassName}
            getCellClassName={getRankCellClassName}
            onSearch={() => {
              if (rankType === 'CUSTOM') {
                if (!startDate || !endDate || endDate.getTime() <= startDate.getTime()) {
                  return;
                }
              }
              setPage(0);
              fetchRank(buildParams(0));
            }}
          />
        ) : (
          <BaseTableSkeleton columns={columns} />
        )}
      </TableBox>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  max-width: 1500px;
  min-width: 1280px;
  min-height: 600px;
  height: 100%;
  margin: 0 auto;
  flex-direction: column;
  gap: 36px;

  @media ${({ theme }) => theme.device.tablet} {
    width: 100vw;
    max-width: 100%;
    min-width: 100%;
    min-height: unset;
  }
`;

const Hero = styled.section`
  position: relative;
  width: 100%;
  height: 160px;
  overflow: hidden;

  @media ${({ theme }) => theme.device.mobile} {
    height: 120px;
  }
`;

const HeroBg = styled.div`
  position: absolute;
  inset: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;

    filter: blur(1px);
    transform: scale(1);
  }
`;

const FixedDarkOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.2);
  z-index: 0;
`;

const HeroOverlay = styled(motion.div)`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.25);
`;

const HeroContent = styled.div`
  position: relative;
  z-index: 2;

  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 10px;

  text-align: center;
  color: ${({ theme }) => theme.colors.whiteColor};

  h1 {
    font-size: ${({ theme }) => theme.desktop.sizes.titleSize};
    font-weight: 800;
    @media ${({ theme }) => theme.device.mobile} {
      font-size: ${({ theme }) => theme.mobile.sizes.titleSize};
    }
  }

  span {
    font-size: ${({ theme }) => theme.desktop.sizes.xl};
    font-weight: 600;
    opacity: 0.8;

    @media ${({ theme }) => theme.device.mobile} {
      font-size: ${({ theme }) => theme.mobile.sizes.xl};
    }
  }
`;

const TableBox = styled.div`
  width: 100%;
  overflow: hidden;
`;

const shimmer = keyframes`
  0% { background-position: -100% 0; }
  100% { background-position: 100% 0; }
`;

const SkeletonBox = styled.div`
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s infinite;
  border-radius: 4px;
`;
