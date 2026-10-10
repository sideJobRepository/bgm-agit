'use client';

import { Wrapper, Hero, HeroBg, FixedDarkOverlay, HeroOverlay, HeroContent, TableBox, TitleCell } from './Review.styles.ts';
import { useEffect, useMemo, useState } from 'react';
import { Chats } from 'phosphor-react';
import { useReviewFetch } from '../recoil/reviewFetch.ts';
import { useRecoilValue } from 'recoil';
import { reviewState } from '../recoil/state/reviewState.ts';
import { type BaseColumn, BaseTable } from '../components/academy/BaseTable.tsx';
import type { ReviewItem } from '../types/review.ts';
import { useNavigate } from 'react-router-dom';

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
        key: 'thumbnail',
        header: '',
        width: '140px',
        align: 'center',
        nowrap: true,
        render: row => <img src={row.thumbnail} />,
      },
      {
        key: 'title',
        header: '내용',
        nowrap: true,
        render: row => (
          <TitleCell>
            <span className="title">{row.cont}</span>
            <span className="reply">
              <Chats weight="bold" />
              {row.commentCount}
            </span>
          </TitleCell>
        ),
      },
      {
        key: 'nickname',
        header: '닉네임',
        width: '140px',
        align: 'center',
        nowrap: true,
        render: row => row.nickname,
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
          <img src={'/review-assets/review.png'} alt="상단 이미지" />
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
