'use client';

import { motion } from 'framer-motion';
import styled, { keyframes } from 'styled-components';
import { withBasePath } from '@/lib/path';
import { useEffect, useMemo, useState } from 'react';
import { BaseColumn, BaseTable } from '@/app/components/BaseTable';
import { useRouter } from 'next/navigation';
import { useLoadingStore } from '@/store/loading';
import BaseTableSkeleton from '@/app/components/BaseTableSkeleton';
import { useFetchReviewList } from '@/services/review.service';
import { ReviewItem, useReviewDetailStore, useReviewListStore } from '@/store/review';
import { Chats } from 'phosphor-react';

export default function Review() {
  const router = useRouter();
  const fetchReview = useFetchReviewList();
  const reviewList = useReviewListStore((state) => state.review);
  console.log('reviewList', reviewList);
  const clearDetail = useReviewDetailStore((state) => state.clearDetail);

  const [searchKeyword, setSearchKeyword] = useState('');
  const [page, setPage] = useState(0);

  const loading = useLoadingStore((state) => state.loading);
  const isReady = !loading && reviewList;

  const columns = useMemo<BaseColumn<ReviewItem>[]>(
    () => [
      {
        key: 'registDate',
        header: '날짜',
        width: '140px',
        align: 'center',
        nowrap: true,
        render: (row) => row.registDate,
      },
      {
        key: 'nickname',
        header: '닉네임',
        width: '140px',
        align: 'center',
        nowrap: true,
        render: (row) => row.nickname,
      },
      {
        key: 'title',
        header: '제목',
        render: (row) => (
          <TitleCell>
            <span className="title">{row.title}</span>
            <span className="reply">
              <Chats weight="bold" />
              {row.commentCount}
            </span>
          </TitleCell>
        ),
      },
    ],
    []
  );

  useEffect(() => {
    fetchReview({ page, titleAndCont: searchKeyword });
  }, [page]);

  return (
    <Wrapper>
      <Hero>
        <HeroBg>
          <img src={withBasePath('/review/review.png')} alt="상단 이미지" />
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
          <h1>Academy Reviews</h1>
          <span>수강생들의 생생한 후기와 성장 스토리를 확인하세요.</span>
        </HeroContent>
      </Hero>
      <TableBox>
        {isReady ? (
          <BaseTable
            columns={columns}
            data={reviewList?.content}
            page={page}
            searchLabel="제목 및 내용"
            totalPages={reviewList?.totalPages}
            onPageChange={setPage}
            showWriteButton
            onWriteClick={() => {
              clearDetail();
              router.push(`/review/new`);
            }}
            onRowClick={(row) => router.push(`/review/${row.id}`)}
            searchKeyword={searchKeyword}
            onSearchKeywordChange={setSearchKeyword}
            onSearch={() => {
              setPage(0);
              fetchReview({ page: 0, titleAndCont: searchKeyword });
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
  height: 240px;
  overflow: hidden;

  @media ${({ theme }) => theme.device.mobile} {
    height: 140px;
  }
`;

const HeroBg = styled.div`
  position: absolute;
  inset: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;

    filter: blur(2px);
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

const TitleCell = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  .title {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .reply {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: ${({ theme }) => theme.desktop.sizes.xs};
    color: ${({ theme }) => theme.colors.inputColor};
  }
`;
