import { useMediaQuery } from 'react-responsive';
import { Wrapper } from '../styles';
import SearchBar from '../components/SearchBar.tsx';
import { useEffect, useState } from 'react';
import { useNoticeFetch } from '../recoil/fetch.ts';
import { useRecoilValue } from 'recoil';
import { noticeState } from '../recoil/state/noticeState.ts';
import { userState } from '../recoil/state/userState.ts';

import { useNavigate } from 'react-router-dom';
import Pagination from '../components/Pagination.tsx';
import { theme } from '../styles/theme.ts';
import { NoticeBox, TableBox, Table, Th, Td, SearchWrapper, TitleBox, SearchBox, PaginationWrapper, Button, ButtonBox, NoSearchBox } from './Notice.styles.ts';

interface NoticeProps {
  mainGb: boolean;
}

export default function Notice({ mainGb }: NoticeProps) {
  const fetchNotice = useNoticeFetch();

  const navigate = useNavigate();

  const items = useRecoilValue(noticeState);

  const user = useRecoilValue(userState);
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });

  const [searchKeyword, setSearchKeyword] = useState('');
  const [page, setPage] = useState(0);

  useEffect(() => {
    fetchNotice({ page, titleOrCont: searchKeyword });
  }, [page, searchKeyword]);

  const handlePageClick = (pageNum: number) => {
    setPage(pageNum);
  };

  return (
    <>
      {mainGb ? (
        <Wrapper>
          <NoticeBox>
            <SearchWrapper bgColor={theme.colors.primary}>
              <TitleBox textColor={theme.colors.textStrong}>
                <h2>News & Updates</h2>
                <p>공지사항 및 이벤트를 빠르게 확인해보세요.</p>
              </TitleBox>
              <SearchBox>
                <SearchBar<string>
                  color={theme.colors.primary}
                  label="제목 및 내용"
                  onSearch={setSearchKeyword}
                />
              </SearchBox>
            </SearchWrapper>
            <TableBox>
              {user?.roles.includes('ROLE_ADMIN') && (
                <ButtonBox>
                  <Button
                    color={theme.colors.primary}
                    onClick={() => {
                      navigate(`/noticeDetail`);
                    }}
                  >
                    작성
                  </Button>
                </ButtonBox>
              )}
              <Table>
                <thead>
                  <tr>
                    <Th>번호</Th>
                    <Th>제목</Th>
                    {!isMobile && <Th>날짜</Th>}
                    <Th>분류</Th>
                  </tr>
                </thead>
                <tbody>
                  {items?.content?.map((notice, index) => (
                    <tr
                      key={notice.bgmAgitNoticeId}
                      onClick={() => {
                        navigate(`/noticeDetail?id=${notice.bgmAgitNoticeId}`);
                      }}
                    >
                      <Td>{index + 1}</Td>
                      <Td>{notice.bgmAgitNoticeTitle}</Td>
                      {!isMobile && <Td>{notice.registDate}</Td>}
                      <Td>{notice.bgmAgitNoticeType === 'NOTICE' ? '공지사항' : '이벤트'}</Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              {items?.content.length === 0 && <NoSearchBox>검색된 결과가 없습니다.</NoSearchBox>}
              <PaginationWrapper>
                <Pagination
                  current={page}
                  totalPages={items?.totalPages}
                  onChange={handlePageClick}
                />
              </PaginationWrapper>
            </TableBox>
          </NoticeBox>
        </Wrapper>
      ) : (
        <>
          <Table>
            <thead>
              <tr>
                <Th>번호</Th>
                <Th>제목</Th>
                {!isMobile && <Th>날짜</Th>}
                <Th>분류</Th>
              </tr>
            </thead>
            <tbody>
              {items?.content.slice(0, 6).map((notice, index) => (
                <tr
                  key={notice.bgmAgitNoticeId}
                  onClick={() => {
                    navigate(`/noticeDetail?id=${notice.bgmAgitNoticeId}`);
                  }}
                >
                  <Td>{index + 1}</Td>
                  <Td>{notice.bgmAgitNoticeTitle}</Td>
                  {!isMobile && <Td>{notice.registDate}</Td>}
                  <Td>{notice.bgmAgitNoticeType === 'NOTICE' ? '공지사항' : '이벤트'}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
          {items?.content.length === 0 && <NoSearchBox>검색된 결과가 없습니다.</NoSearchBox>}
        </>
      )}
    </>
  );
}
