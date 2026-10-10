import { useEffect, useMemo, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { type BaseColumn, BaseTable } from '../components/academy/BaseTable.tsx';
import type { MyPageItem } from '../types/myPage.ts';
import { useMyPageFetch } from '../recoil/myPageFetch.ts';
import { myPageListState } from '../recoil/state/myPageState.ts';
import { loadingState } from '../recoil/state/mainState.ts';
import {
  Wrapper,
  Hero,
  HeroBg,
  FixedDarkOverlay,
  HeroOverlay,
  HeroContent,
  TableBox,
} from './MyPage.styles.ts';

export default function MyPage() {
  const fetchMyPage = useMyPageFetch();
  const myPageList = useRecoilValue(myPageListState);
  const loading = useRecoilValue(loadingState);

  const [searchKeyword, setSearchKeyword] = useState('');
  const [page, setPage] = useState(0);

  const isReady = !loading;

  const columns = useMemo<BaseColumn<MyPageItem>[]>(
    () => [
      {
        key: 'registDate',
        header: '신청 일자',
        width: '140px',
        align: 'center',
        nowrap: true,
        render: row => row.registDate,
      },
      {
        key: 'startDate',
        header: '예약 일자',
        width: '140px',
        align: 'center',
        nowrap: true,
        render: row => row.startDate,
      },
      {
        key: 'startTime',
        header: '예약 시간',
        width: '140px',
        align: 'center',
        nowrap: true,
        render: row => `${row.startTime} ~ ${row.endTime}`,
      },
      {
        key: 'memberName',
        header: '예약자명',
        width: '140px',
        align: 'center',
        nowrap: true,
        render: row => row.memberName,
      },
      {
        key: 'phoneNo',
        header: '연락처',
        width: '140px',
        align: 'center',
        nowrap: true,
        render: row => row.phoneNo,
      },
    ],
    []
  );

  useEffect(() => {
    fetchMyPage({ page, titleAndCont: searchKeyword });
  }, [page]);

  return (
    <Wrapper>
      <Hero>
        <HeroBg>
          <img src="/matches-assets/hero.jpg" alt="상단 이미지" />
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
          <h1>My Reservation</h1>
          <span>마작 강의 예약 정보를 확인하세요.</span>
        </HeroContent>
      </Hero>
      <TableBox>
        {isReady && (
          <BaseTable
            columns={columns}
            data={myPageList?.content ?? []}
            page={page}
            searchLabel="제목 및 내용"
            totalPages={myPageList?.totalPages ?? 0}
            onPageChange={setPage}
            showWriteButton={false}
            searchKeyword={searchKeyword}
            onSearchKeywordChange={setSearchKeyword}
            onSearch={() => {
              setPage(0);
              fetchMyPage({ page: 0, titleAndCont: searchKeyword });
            }}
          />
        )}
      </TableBox>
    </Wrapper>
  );
}
