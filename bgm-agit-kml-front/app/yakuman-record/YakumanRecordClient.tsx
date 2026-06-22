'use client';

import { motion } from 'framer-motion';
import styled, { keyframes } from 'styled-components';
import { withBasePath } from '@/lib/path';
import { useEffect, useMemo, useRef, useState } from 'react';
import { BaseColumn, BaseTable } from '@/app/components/BaseTable';
import { useRouter } from 'next/navigation';
import { useLoadingStore } from '@/store/loading';
import BaseTableSkeleton from '@/app/components/BaseTableSkeleton';
import {
  DetailYakumanRow,
  useDetailYakumanRecordStore,
  useYakumanRecordStore,
  YakumanRow,
} from '@/store/yakuman';
import { useFetchDetailYakumanList, useFetchYakumanList } from '@/services/yakuman.service';
import { fetchFileViewUrls } from '@/services/yakumanFile.service';
import {
  DetailSanbaemanRow,
  useDetailSanbaemanRecordStore,
  useSanbaemanRecordStore,
  SanbaemanRow,
} from '@/store/sanbaeman';
import {
  useFetchDetailSanbaemanList,
  useFetchSanbaemanList,
} from '@/services/sanbaeman.service';
import MatchDetailModal from '@/app/components/MatchDetailModal';

export interface YakumanPageData {
  content: YakumanRow[];
  page: number;
  size: number;
  totalPages: number;
}

interface Props {
  initialData: YakumanPageData | null;
}

export default function YakumanRecordClient({ initialData }: Props) {
  const router = useRouter();

  //토글: 종목(역만/삼배만) + 보기(횟수/상세)
  const [kind, setKind] = useState<'yakuman' | 'sanbaeman'>('yakuman');
  const [mode, setMode] = useState<'count' | 'detail'>('count');

  const fetchYakuman = useFetchYakumanList();
  const fetchDetailYakman = useFetchDetailYakumanList();
  const yakumanList = useYakumanRecordStore((state) => state.yakuman);
  const setYakuman = useYakumanRecordStore((state) => state.setYakuman);

  // SSR 초기 데이터를 store에 1회 hydrate
  const hydratedRef = useRef(false);
  if (!hydratedRef.current && initialData) {
    setYakuman(initialData);
    hydratedRef.current = true;
  }

  const [searchKeyword, setSearchKeyword] = useState('');
  const [page, setPage] = useState(0);

  // 삼배만 횟수
  const fetchSanbaeman = useFetchSanbaemanList();
  const sanbaemanList = useSanbaemanRecordStore((state) => state.sanbaeman);
  const [sbPage, setSbPage] = useState(0);

  const loading = useLoadingStore((state) => state.loading);
  const isReady = !loading && (yakumanList ?? initialData);

  const [previewImg, setPreviewImg] = useState<string | null>(null);

  // 상세 행 클릭 시 그 역만/삼배만이 나온 대국 결과 모달
  const [selectedMatchId, setSelectedMatchId] = useState<number | null>(null);

  const countColumns = useMemo<BaseColumn<YakumanRow>[]>(
    () => [
      {
        key: 'nickname',
        header: '닉네임',
        width: '120px',
        align: 'center',
        nowrap: true,
        sticky: true,
        render: (row) => row.nickname,
      },
      {
        key: 'totalCount',
        header: '총 역만 횟수',
        width: '120px',
        align: 'center',
        nowrap: true,
        sticky: true,
        render: (row) => <CountCell $count={row.totalCount}>{row.totalCount}</CountCell>,
      },
      {
        key: 'countedYakuman',
        header: '헤아림 역만',
        align: 'center',
        nowrap: true,
        render: (row) => <CountCell $count={row.countedYakuman}>{row.countedYakuman}</CountCell>,
      },
      {
        key: 'suukantsu',
        header: '사깡즈',
        align: 'center',
        nowrap: true,
        render: (row) => <CountCell $count={row.suukantsu}>{row.suukantsu}</CountCell>,
      },
      {
        key: 'suuankou',
        header: '사암각',
        align: 'center',
        nowrap: true,
        render: (row) => <CountCell $count={row.suuankou}>{row.suuankou}</CountCell>,
      },
      {
        key: 'kokushiMusou',
        header: '국사무쌍',
        align: 'center',
        nowrap: true,
        render: (row) => <CountCell $count={row.kokushiMusou}>{row.kokushiMusou}</CountCell>,
      },
      {
        key: 'daisangen',
        header: '대삼원',
        align: 'center',
        nowrap: true,
        render: (row) => <CountCell $count={row.daisangen}>{row.daisangen}</CountCell>,
      },
      {
        key: 'tenhou',
        header: '천화',
        align: 'center',
        nowrap: true,
        render: (row) => <CountCell $count={row.tenhou}>{row.tenhou}</CountCell>,
      },
      {
        key: 'chiihou',
        header: '지화',
        align: 'center',
        nowrap: true,
        render: (row) => <CountCell $count={row.chiihou}>{row.chiihou}</CountCell>,
      },
      {
        key: 'chuurenPoutou',
        header: '구련보등',
        align: 'center',
        nowrap: true,
        render: (row) => <CountCell $count={row.chuurenPoutou}>{row.chuurenPoutou}</CountCell>,
      },
      {
        key: 'ryuuiisou',
        header: '녹일색',
        align: 'center',
        nowrap: true,
        render: (row) => <CountCell $count={row.ryuuiisou}>{row.ryuuiisou}</CountCell>,
      },
      {
        key: 'chinroutou',
        header: '청노두',
        align: 'center',
        nowrap: true,
        render: (row) => <CountCell $count={row.chinroutou}>{row.chinroutou}</CountCell>,
      },
      {
        key: 'tsuuiisou',
        header: '자일색',
        align: 'center',
        nowrap: true,
        render: (row) => <CountCell $count={row.tsuuiisou}>{row.tsuuiisou}</CountCell>,
      },
      {
        key: 'shousuushii',
        header: '소사희',
        align: 'center',
        nowrap: true,
        render: (row) => <CountCell $count={row.shousuushii}>{row.shousuushii}</CountCell>,
      },
      {
        key: 'daisuushii',
        header: '대사희',
        align: 'center',
        nowrap: true,
        render: (row) => <CountCell $count={row.daisuushii}>{row.daisuushii}</CountCell>,
      },
      {
        key: 'kokushi13Wait',
        header: '국사무쌍 13면 대기',
        align: 'center',
        nowrap: true,
        render: (row) => <CountCell $count={row.kokushi13Wait}>{row.kokushi13Wait}</CountCell>,
      },
      {
        key: 'pureChuuren',
        header: '순정 구련보등',
        align: 'center',
        nowrap: true,
        render: (row) => <CountCell $count={row.pureChuuren}>{row.pureChuuren}</CountCell>,
      },
      {
        key: 'suuankouTanki',
        header: '사암각단기',
        align: 'center',
        nowrap: true,
        render: (row) => <CountCell $count={row.suuankouTanki}>{row.suuankouTanki}</CountCell>,
      },
      {
        key: 'sharin',
        header: '사리엔커',
        align: 'center',
        nowrap: true,
        render: (row) => <CountCell $count={row.sharin}>{row.sharin}</CountCell>,
      },
    ],
    []
  );

  // 삼배만 횟수 컬럼 (종류 구분 없이 회원별 총 횟수 랭킹)
  const sanbaemanCountColumns = useMemo<BaseColumn<SanbaemanRow>[]>(
    () => [
      {
        key: 'nickname',
        header: '닉네임',
        width: '160px',
        align: 'center',
        nowrap: true,
        sticky: true,
        render: (row) => row.nickname,
      },
      {
        key: 'totalCount',
        header: '총 삼배만 횟수',
        width: '160px',
        align: 'center',
        nowrap: true,
        render: (row) => <CountCell $count={row.totalCount}>{row.totalCount}</CountCell>,
      },
    ],
    []
  );

  //디테일
  const detailYakumanList = useDetailYakumanRecordStore((state) => state.detailYakuman);
  const [detailPage, setDetailPage] = useState(0);

  // 새 흐름(BgmAgitFile) fileId → presigned GET URL 매핑
  const [fileViewMap, setFileViewMap] = useState<Map<number, string>>(new Map());

  // detail 데이터가 바뀔 때마다 새 fileId 들의 presigned URL 일괄 조회
  useEffect(() => {
    if (!detailYakumanList?.content) return;
    const newFileIds = detailYakumanList.content
      .map((r) => r.fileId)
      .filter((id): id is number => !!id);

    if (newFileIds.length === 0) {
      setFileViewMap(new Map());
      return;
    }

    fetchFileViewUrls(newFileIds)
      .then((views) => {
        setFileViewMap(new Map(views.map((v) => [v.fileId, v.url])));
      })
      .catch(() => setFileViewMap(new Map()));
  }, [detailYakumanList]);

  const resolveImageUrl = (row: DetailYakumanRow): string | null => {
    if (row.fileId && fileViewMap.has(row.fileId)) {
      return fileViewMap.get(row.fileId) ?? null;
    }
    return row.fileUrl ?? null;
  };

  const detailColumns = useMemo<BaseColumn<DetailYakumanRow>[]>(
    () => [
      {
        key: 'match',
        header: '대국',
        width: '88px',
        align: 'center',
        nowrap: true,
        sticky: true,
        render: (row) => (
          <MatchChip onClick={() => setSelectedMatchId(row.matchsId)}>상세보기</MatchChip>
        ),
      },
      {
        key: 'nickname',
        header: '이름',
        width: '120px',
        align: 'center',
        render: (row) => row.nickname,
      },
      {
        key: 'yakumanName',
        header: '역만이름',
        align: 'center',
        render: (row) => row.yakumanName,
      },
      {
        key: 'yakumanCont',
        header: '내용',
        align: 'center',
        render: (row) => row.yakumanCont,
      },
      {
        key: 'fileUrl',
        header: '이미지',
        align: 'center',
        render: (row) => {
          const url = resolveImageUrl(row);
          if (!url) return null;
          // 이미지 칸 전체를 클릭 영역으로. 행 onClick(상세 모달)으로 버블링되지 않도록 전파 차단
          return (
            <ThumbCell
              onClick={(e) => {
                e.stopPropagation();
                setPreviewImg(url);
              }}
            >
              <Thumbnail src={url} />
            </ThumbCell>
          );
        },
      },
      {
        key: 'registDate',
        header: '일시',
        align: 'center',
        render: (row) => row.registDate,
      },
    ],
    [fileViewMap]
  );

  // 삼배만 상세
  const fetchDetailSanbaeman = useFetchDetailSanbaemanList();
  const detailSanbaemanList = useDetailSanbaemanRecordStore((state) => state.detailSanbaeman);
  const [sbDetailPage, setSbDetailPage] = useState(0);

  const [sbFileViewMap, setSbFileViewMap] = useState<Map<number, string>>(new Map());

  useEffect(() => {
    if (!detailSanbaemanList?.content) return;
    const newFileIds = detailSanbaemanList.content
      .map((r) => r.fileId)
      .filter((id): id is number => !!id);

    if (newFileIds.length === 0) {
      setSbFileViewMap(new Map());
      return;
    }

    fetchFileViewUrls(newFileIds)
      .then((views) => {
        setSbFileViewMap(new Map(views.map((v) => [v.fileId, v.url])));
      })
      .catch(() => setSbFileViewMap(new Map()));
  }, [detailSanbaemanList]);

  const resolveSanbaemanImageUrl = (row: DetailSanbaemanRow): string | null => {
    if (row.fileId && sbFileViewMap.has(row.fileId)) {
      return sbFileViewMap.get(row.fileId) ?? null;
    }
    return row.fileUrl ?? null;
  };

  const sanbaemanDetailColumns = useMemo<BaseColumn<DetailSanbaemanRow>[]>(
    () => [
      {
        key: 'match',
        header: '대국',
        width: '88px',
        align: 'center',
        nowrap: true,
        sticky: true,
        render: (row) => (
          <MatchChip onClick={() => setSelectedMatchId(row.matchsId)}>상세보기</MatchChip>
        ),
      },
      {
        key: 'nickname',
        header: '이름',
        width: '120px',
        align: 'center',
        render: (row) => row.nickname,
      },
      {
        key: 'sanbaemanName',
        header: '삼배만이름',
        align: 'center',
        render: (row) => row.sanbaemanName,
      },
      {
        key: 'sanbaemanCont',
        header: '내용',
        align: 'center',
        render: (row) => row.sanbaemanCont,
      },
      {
        key: 'fileUrl',
        header: '이미지',
        align: 'center',
        render: (row) => {
          const url = resolveSanbaemanImageUrl(row);
          if (!url) return null;
          // 이미지 칸 전체를 클릭 영역으로. 행 onClick(상세 모달)으로 버블링되지 않도록 전파 차단
          return (
            <ThumbCell
              onClick={(e) => {
                e.stopPropagation();
                setPreviewImg(url);
              }}
            >
              <Thumbnail src={url} />
            </ThumbCell>
          );
        },
      },
      {
        key: 'registDate',
        header: '일시',
        align: 'center',
        render: (row) => row.registDate,
      },
    ],
    [sbFileViewMap]
  );

  // 첫 진입 + SSR 데이터 있으면 첫 fetch 스킵 (불필요한 재요청 방지)
  const firstYakumanFetchSkipRef = useRef(true);
  useEffect(() => {
    if (firstYakumanFetchSkipRef.current && initialData) {
      firstYakumanFetchSkipRef.current = false;
      return;
    }
    firstYakumanFetchSkipRef.current = false;
    fetchYakuman({ page, nickName: searchKeyword });
  }, [page]);

  useEffect(() => {
    fetchDetailYakman({ page: detailPage });
  }, [detailPage]);

  // 삼배만은 해당 토글로 진입했을 때만 조회 (lazy)
  useEffect(() => {
    if (kind !== 'sanbaeman') return;
    fetchSanbaeman({ page: sbPage, nickName: searchKeyword });
  }, [kind, sbPage]);

  useEffect(() => {
    if (kind !== 'sanbaeman') return;
    fetchDetailSanbaeman({ page: sbDetailPage });
  }, [kind, sbDetailPage]);

  const isYakuman = kind === 'yakuman';
  const isCount = mode === 'count';

  // kind(역만/삼배만) × mode(횟수/상세) 조합으로 테이블 입력을 선택한다.
  // 컬럼/데이터는 행 타입이 4종으로 갈리므로 BaseTable 경계에서 느슨하게 캐스팅한다.
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const activeColumns = (
    isYakuman
      ? isCount
        ? countColumns
        : detailColumns
      : isCount
        ? sanbaemanCountColumns
        : sanbaemanDetailColumns
  ) as unknown as BaseColumn<any>[];

  const activeData = (
    isYakuman
      ? isCount
        ? ((yakumanList ?? initialData)?.content ?? [])
        : (detailYakumanList?.content ?? [])
      : isCount
        ? (sanbaemanList?.content ?? [])
        : (detailSanbaemanList?.content ?? [])
  ) as any[];
  /* eslint-enable @typescript-eslint/no-explicit-any */

  const activePage = isYakuman
    ? isCount
      ? page
      : detailPage
    : isCount
      ? sbPage
      : sbDetailPage;

  const activeTotalPages = isYakuman
    ? isCount
      ? ((yakumanList ?? initialData)?.totalPages ?? 0)
      : (detailYakumanList?.totalPages ?? 0)
    : isCount
      ? (sanbaemanList?.totalPages ?? 0)
      : (detailSanbaemanList?.totalPages ?? 0);

  const activeOnPageChange = isYakuman
    ? isCount
      ? setPage
      : setDetailPage
    : isCount
      ? setSbPage
      : setSbDetailPage;

  return (
    <Wrapper>
      {previewImg && (
        <ImageOverlay onClick={() => setPreviewImg(null)}>
          <img src={previewImg} />
        </ImageOverlay>
      )}
      <Hero>
        <HeroBg>
          <img src={withBasePath('/yakHero.jpg')} alt="상단 이미지" />
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
          <h1>Yakuman / Sanbaeman Records</h1>
          <span>역만·삼배만 기록과 상세 내역을 확인하세요.</span>
        </HeroContent>
      </Hero>
      <ToggleWrap>
        <ToggleBox>
          <button className={kind === 'yakuman' ? 'active' : ''} onClick={() => setKind('yakuman')}>
            역만
          </button>
          <button
            className={kind === 'sanbaeman' ? 'active' : ''}
            onClick={() => setKind('sanbaeman')}
          >
            삼배만
          </button>
        </ToggleBox>
        <ToggleBox>
          <button className={mode === 'count' ? 'active' : ''} onClick={() => setMode('count')}>
            횟수
          </button>
          <button className={mode === 'detail' ? 'active' : ''} onClick={() => setMode('detail')}>
            상세
          </button>
        </ToggleBox>
      </ToggleWrap>
      <TableBox>
        {isReady ? (
          <BaseTable
            columns={activeColumns}
            data={activeData}
            page={activePage}
            totalPages={activeTotalPages}
            onPageChange={activeOnPageChange}
            onRowClick={
              mode === 'detail'
                ? (row) => setSelectedMatchId((row as { matchsId: number }).matchsId)
                : undefined
            }
            searchLabel={mode === 'count' ? '닉네임' : null}
            showWriteButton={true}
            searchKeyword={searchKeyword}
            onSearchKeywordChange={setSearchKeyword}
            onSearch={() => {
              if (mode === 'count') {
                if (isYakuman) {
                  setPage(0);
                  fetchYakuman({ page: 0, nickName: searchKeyword });
                } else {
                  setSbPage(0);
                  fetchSanbaeman({ page: 0, nickName: searchKeyword });
                }
              } else {
                if (isYakuman) {
                  setDetailPage(0);
                  fetchDetailYakman({ page: 0 });
                } else {
                  setSbDetailPage(0);
                  fetchDetailSanbaeman({ page: 0 });
                }
              }
            }}
          />
        ) : (
          <BaseTableSkeleton columns={activeColumns} />
        )}
      </TableBox>
      <MatchDetailModal
        matchsId={selectedMatchId}
        onClose={() => setSelectedMatchId(null)}
      />
    </Wrapper>
  );
}

const CountCell = styled.span<{ $count: number }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  padding: 2px 8px;
  border-radius: 999px;
  font-weight: ${({ $count }) => ($count > 0 ? 700 : 400)};
  background: ${({ $count }) =>
    $count >= 3
      ? '#FFE082'
      : $count === 2
        ? '#FFF3C4'
        : $count === 1
          ? '#FFFBEA'
          : 'transparent'};
  color: ${({ $count, theme }) =>
    $count > 0 ? '#B26A00' : theme.colors.inputColor};
`;

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

    filter: blur(3px);
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

const ToggleWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
`;

const ToggleBox = styled.div`
  display: inline-flex;
  width: 164px;
  margin: 0 0 12px 12px;
  padding: 4px 1px;
  background: #333;
  align-items: center;
  justify-content: center;
  border-radius: 24px;
  button {
    padding: 6px 14px;
    border: none;
    background: #333;
    color: #ffffff;
    cursor: pointer;
    border-radius: 24px;

    &.active {
      background: #ffffff;
      color: #1d1d1f;
      border: none;
    }
  }
`;

const MatchChip = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 4px 10px;
  border: none;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.blueColor};
  color: #ffffff;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
  cursor: pointer;

  &:hover {
    opacity: 0.85;
  }
`;

const ThumbCell = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  min-height: 80px;
  cursor: zoom-in;
`;

const Thumbnail = styled.img`
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 6px;
  cursor: zoom-in;
`;

const ImageOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  z-index: 9999;

  display: flex;
  justify-content: center;
  align-items: center;

  img {
    max-width: 90%;
    max-height: 90%;
    object-fit: contain;
  }
`;
