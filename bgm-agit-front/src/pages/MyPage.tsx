import { motion } from 'framer-motion';
import styled from 'styled-components';
import { useEffect, useMemo, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { type BaseColumn, BaseTable } from '../components/academy/BaseTable.tsx';
import type { MyPageItem } from '../types/myPage.ts';
import { useMyPageFetch } from '../recoil/myPageFetch.ts';
import { myPageListState } from '../recoil/state/myPageState.ts';
import { loadingState } from '../recoil/state/mainState.ts';
import type { WithTheme } from '../styles/styled-props.ts';

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
