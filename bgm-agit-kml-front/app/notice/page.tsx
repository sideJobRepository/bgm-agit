'use client';

import { motion } from 'framer-motion';
import styled from 'styled-components';
import { withBasePath } from '@/lib/path';
import { useFetchNoticeList } from '@/services/notice.service';
import { useEffect, useMemo, useState } from 'react';
import { NoticeItem, useNoticeListStore } from '@/store/notice';
import { BaseColumn, BaseTable } from '@/app/components/BaseTable';
import { useRouter } from 'next/navigation';


export default function Notice() {
  const router = useRouter();
  const fetchNotice = useFetchNoticeList();
  const noticeList =  useNoticeListStore((state) => state.notice);

  const [searchKeyword, setSearchKeyword] = useState('');
  const [page, setPage] = useState(0);

  const columns = useMemo<BaseColumn<NoticeItem>[]>(() => [
    {
      key: 'registDate',
      header: '날짜',
      render: row => row.registDate,
    },
    {
      key: 'title',
      header: '제목',
      render: row => row.title,
    },
  ], []);

  console.log("noticeList", noticeList);

  useEffect(() => {
    fetchNotice({ page, titleAndCont: searchKeyword })
  }, [page]);

  return (
    <Wrapper>
      <Hero>
        <HeroBg>
          <img src={withBasePath('/bgmMain.jpeg')} alt="" />
        </HeroBg>
        <FixedDarkOverlay />
        <HeroOverlay   initial={{ width: '0%' }}
                       animate={{ width: '100%' }}
                       transition={{
                         duration: 1.2,
                         ease: [0.65, 0, 0.35, 1],
                       }} />

        <HeroContent>
          <h1>What’s New</h1>
          <span>
            새로운 소식과 중요 안내를 확인하세요.
          </span>
        </HeroContent>
      </Hero>
      <TableBox>
        {noticeList && (       <BaseTable
          columns={columns}
          data={noticeList.content}
          page={page}
          searchLabel="제목 및 내용"
          totalPages={noticeList.totalPages}
          onPageChange={setPage}
          showWriteButton
          onWriteClick={() => router.push('/noticeDetail')}
          onRowClick={(row) =>
            router.push(`/notice/${row.id}`)
          }
          searchKeyword={searchKeyword}
          onSearchKeywordChange={setSearchKeyword}
          onSearch={() => {
            setPage(0);
            fetchNotice({ page: 0, titleAndCont: searchKeyword });
          }}
        />)}

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
  background: rgba(0, 0, 0, 0.20); 
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
    font-size: ${({ theme }) => theme.desktop.sizes.md};
    font-weight: 600;
    opacity: 0.8;

    @media ${({ theme }) => theme.device.mobile} {
      font-size: ${({ theme }) => theme.desktop.sizes.md};
    }
  }
`;

const TableBox = styled.div`
  width: 100%;
  overflow: hidden;
`;



