'use client';

import { motion } from 'framer-motion';
import styled, { keyframes } from 'styled-components';
import { withBasePath } from '@/lib/path';
import { useFetchNoticeList } from '@/services/notice.service';
import { useEffect, useMemo, useState } from 'react';
import { NoticeItem, useNoticeDetailStore, useNoticeListStore } from '@/store/notice';
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

export default function Notice() {
  const router = useRouter();

  //토글
  const [mode, setMode] = useState<'count' | 'detail'>('count');

  const fetchYakuman = useFetchYakumanList();
  const fetchDetailYakman = useFetchDetailYakumanList();
  const yakumanList = useYakumanRecordStore((state) => state.yakuman);

  const [searchKeyword, setSearchKeyword] = useState('');
  const [page, setPage] = useState(0);

  const loading = useLoadingStore((state) => state.loading);
  const isReady = !loading && yakumanList;

  const [previewImg, setPreviewImg] = useState<string | null>(null);

  const countColumns = useMemo<BaseColumn<YakumanRow>[]>(
    () => [
      {
        key: 'nickname',
        header: '이름',
        width: '120px',
        align: 'center',
        render: (row) => row.nickname,
      },
      {
        key: 'totalCount',
        header: '총 역만 횟수',
        align: 'center',
        render: (row) => row.totalCount,
      },
      {
        key: 'countedYakuman',
        header: '헤아림',
        align: 'center',
        render: (row) => row.countedYakuman,
      },
      {
        key: 'suukantsu',
        header: '사깡즈',
        align: 'center',
        render: (row) => row.suukantsu,
      },
      {
        key: 'suuankou',
        header: '사암각',
        align: 'center',
        render: (row) => row.suuankou,
      },
      {
        key: 'kokushiMusou',
        header: '국사무쌍',
        align: 'center',
        render: (row) => row.kokushiMusou,
      },
      {
        key: 'daisangen',
        header: '대삼원',
        align: 'center',
        render: (row) => row.daisangen,
      },
      {
        key: 'tenhou',
        header: '천화',
        align: 'center',
        render: (row) => row.tenhou,
      },
      {
        key: 'chiihou',
        header: '지화',
        align: 'center',
        render: (row) => row.chiihou,
      },
      {
        key: 'chuurenPoutou',
        header: '구련보등',
        align: 'center',
        render: (row) => row.chuurenPoutou,
      },
      {
        key: 'ryuuiisou',
        header: '녹일색',
        align: 'center',
        render: (row) => row.ryuuiisou,
      },
      {
        key: 'chinroutou',
        header: '청노두',
        align: 'center',
        render: (row) => row.chinroutou,
      },
      {
        key: 'tsuuiisou',
        header: '자일색',
        align: 'center',
        render: (row) => row.tsuuiisou,
      },
      {
        key: 'shousuushii',
        header: '소사희',
        align: 'center',
        render: (row) => row.shousuushii,
      },
      {
        key: 'daisuushii',
        header: '대사희',
        align: 'center',
        render: (row) => row.daisuushii,
      },
      {
        key: 'kokushi13Wait',
        header: '국사13',
        align: 'center',
        render: (row) => row.kokushi13Wait,
      },
      {
        key: 'pureChuuren',
        header: '순정구련',
        align: 'center',
        render: (row) => row.pureChuuren,
      },
      {
        key: 'suuankouTanki',
        header: '사암각단기',
        align: 'center',
        render: (row) => row.suuankouTanki,
      },
      {
        key: 'sharin',
        header: '사린연기',
        align: 'center',
        render: (row) => row.sharin,
      },
    ],
    []
  );

  //디테일
  const detailYakumanList = useDetailYakumanRecordStore((state) => state.detailYakuman);
  const [detailPage, setDetailPage] = useState(0);

  console.log('detailYakumanList', detailYakumanList);
  const detailColumns = useMemo<BaseColumn<DetailYakumanRow>[]>(
    () => [
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
        render: (row) => <Thumbnail src={row.fileUrl} onClick={() => setPreviewImg(row.fileUrl)} />,
      },
      {
        key: 'registDate',
        header: '일시',
        align: 'center',
        render: (row) => row.registDate,
      },
    ],
    []
  );

  useEffect(() => {
    fetchYakuman({ page, nickName: searchKeyword });
    fetchDetailYakman({ page: detailPage });
  }, [page]);

  return (
    <Wrapper>
      {previewImg && (
        <ImageOverlay onClick={() => setPreviewImg(null)}>
          <img src={previewImg} />
        </ImageOverlay>
      )}
      <Hero>
        <HeroBg>
          <img src={withBasePath('/bgmMain.jpeg')} alt="상단 이미지" />
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
          <h1>What’s New</h1>
          <span>새로운 소식과 중요 안내를 확인하세요.</span>
        </HeroContent>
      </Hero>
      <ToggleBox>
        <button className={mode === 'count' ? 'active' : ''} onClick={() => setMode('count')}>
          역만 횟수
        </button>
        <button className={mode === 'detail' ? 'active' : ''} onClick={() => setMode('detail')}>
          역만 상세
        </button>
      </ToggleBox>
      <TableBox>
        {isReady ? (
          <BaseTable
            columns={mode === 'count' ? countColumns : detailColumns}
            data={mode === 'count' ? yakumanList.content : detailYakumanList.content}
            page={mode === 'count' ? page : detailPage}
            totalPages={mode === 'count' ? yakumanList.totalPages : detailYakumanList.totalPages}
            onPageChange={mode === 'count' ? setPage : setDetailPage}
            searchLabel={mode === 'count' ? '닉네임' : null}
            showWriteButton={true}
            searchKeyword={searchKeyword}
            onSearchKeywordChange={setSearchKeyword}
            onSearch={() => {
              if (mode === 'count') {
                setPage(0);
                fetchYakuman({ page: 0, nickName: searchKeyword });
              } else {
                setDetailPage(0);
                fetchDetailYakman({ page: 0 });
              }
            }}
          />
        ) : (
          <BaseTableSkeleton columns={mode === 'count' ? countColumns : detailColumns} />
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
