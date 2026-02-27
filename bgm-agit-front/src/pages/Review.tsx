'use client';

import { motion } from 'framer-motion';
import styled from 'styled-components';
import { useEffect, useMemo, useState } from 'react';
import { Chats } from 'phosphor-react';
import { useReviewFetch } from '../recoil/reviewFetch.ts';
import { useRecoilValue } from 'recoil';
import { reviewState } from '../recoil/state/reviewState.ts';
import { type BaseColumn, BaseTable } from '../components/academy/BaseTable.tsx';
import type { ReviewItem } from '../types/review.ts';
import { useNavigate } from 'react-router-dom';
import type { WithTheme } from '../styles/styled-props.ts';

export default function Review() {
  const navigate = useNavigate();
  const fetchReview = useReviewFetch();
  const reviewList = useRecoilValue(reviewState);
  console.log('reviewList', reviewList);

  const [searchKeyword, setSearchKeyword] = useState('');
  const [page, setPage] = useState(0);

  const columns = useMemo<BaseColumn<ReviewItem>[]>(
    () => [
      {
        key: 'registDate',
        header: '날짜',
        width: '140px',
        align: 'center',
        nowrap: true,
        render: row => row.registDate,
      },
      {
        key: 'nickname',
        header: '닉네임',
        width: '140px',
        align: 'center',
        nowrap: true,
        render: row => row.nickname,
      },
      {
        key: 'title',
        header: '제목',
        render: row => (
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
    fetchReview({ page, titleOrCont: searchKeyword });
  }, [page]);

  return (
    <Wrapper>
      <Hero>
        <HeroBg>
          <img src={'/review/review.png'} alt="상단 이미지" />
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
        <BaseTable
          columns={columns}
          data={reviewList?.content}
          page={page}
          searchLabel="제목 및 내용"
          totalPages={reviewList?.totalPages}
          onPageChange={setPage}
          showWriteButton
          onWriteClick={() => {
            navigate(`/review/new`);
          }}
          onRowClick={row => navigate(`/review/${row.id}`)}
          searchKeyword={searchKeyword}
          onSearchKeywordChange={setSearchKeyword}
          onSearch={() => {
            setPage(0);
            fetchReview({ page: 0, titleOrCont: searchKeyword });
          }}
        />
      </TableBox>
    </Wrapper>
  );
}

const Wrapper = styled.div<WithTheme>`
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

const Hero = styled.section<WithTheme>`
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

const HeroContent = styled.div<WithTheme>`
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

const TitleCell = styled.div<WithTheme>`
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
