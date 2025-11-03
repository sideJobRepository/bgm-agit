import styled from 'styled-components';
import type { WithTheme } from '../styles/styled-props.ts';
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
            <SearchWrapper bgColor="#988271">
              <TitleBox textColor="#ffffff">
                <h2>News & Updates</h2>
                <p>공지사항 및 이벤트를 빠르게 확인해보세요.</p>
              </TitleBox>
              <SearchBox>
                <SearchBar<string>
                  color="#988271"
                  label="제목 및 내용"
                  onSearch={setSearchKeyword}
                />
              </SearchBox>
            </SearchWrapper>
            <TableBox>
              {user?.roles.includes('ROLE_ADMIN') && (
                <ButtonBox>
                  <Button
                    color="#988271"
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

const NoticeBox = styled.div`
  padding: 10px;
`;

const TableBox = styled.div`
  padding: 40px 0;
`;

const Table = styled.table<WithTheme>`
  width: 100%;
  border-collapse: collapse;
  font-size: ${({ theme }) => theme.sizes.medium};
  color: ${({ theme }) => theme.colors.subColor};

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${({ theme }) => theme.sizes.xsmall};
  }

  th,
  td {
    padding: 14px;
    text-align: center;
  }

  tbody tr {
    cursor: pointer;

    @media ${({ theme }) => theme.device.mobile} {
      font-size: ${({ theme }) => theme.sizes.xxsmall};
    }

    &:hover {
      opacity: 0.6;
    }
  }

  td {
    border-bottom: 1px solid ${({ theme }) => theme.colors.lineColor};
  }
`;

const Th = styled.th<WithTheme>`
  background-color: ${({ theme }) => theme.colors.basicColor};
  font-weight: ${({ theme }) => theme.weight.semiBold};
`;

const Td = styled.td``;

const SearchWrapper = styled.div.withConfig({
  shouldForwardProp: prop => prop !== 'bgColor',
})<{ bgColor: string } & WithTheme>`
  display: flex;
  width: 100%;
  background-color: ${({ bgColor }) => bgColor};
  padding: 20px;
  align-items: center;

  @media ${({ theme }) => theme.device.mobile} {
    flex-direction: column;
    padding: 10px;
  }
`;

const TitleBox = styled.div.withConfig({
  shouldForwardProp: prop => prop !== 'textColor',
})<{ textColor: string } & WithTheme>`
  display: flex;
  flex-direction: column;
  width: 60%;
  height: 60px;
  color: ${({ textColor }) => textColor};

  h2 {
    font-family: 'Bungee', sans-serif;
    font-weight: ${({ theme }) => theme.weight.bold};
    font-size: ${({ theme }) => theme.sizes.xxlarge};
  }
  p {
    margin-top: auto;
    font-weight: ${({ theme }) => theme.weight.semiBold};
    font-size: ${({ theme }) => theme.sizes.medium};
  }

  @media ${({ theme }) => theme.device.mobile} {
    width: 100%;
    height: 40px;
    text-align: center;
    margin-bottom: 10px;

    h2 {
      font-size: ${({ theme }) => theme.sizes.large};
    }
    p {
      font-size: ${({ theme }) => theme.sizes.xsmall};
    }
  }
`;

const SearchBox = styled.div<WithTheme>`
  width: 40%;

  @media ${({ theme }) => theme.device.mobile} {
    width: 100%;
  }
`;

const PaginationWrapper = styled.div`
  text-align: center;
  margin-top: 20px;
`;

const Button = styled.button<WithTheme & { color: string }>`
  padding: 6px 16px;
  background-color: ${({ color }) => color};
  color: ${({ theme }) => theme.colors.white};
  font-size: ${({ theme }) => theme.sizes.medium};
  border: none;
  border-radius: 4px;
  cursor: pointer;

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${({ theme }) => theme.sizes.small};
  }
`;

const ButtonBox = styled.div`
  display: flex;
  justify-content: right;
  margin-bottom: 10px;
`;

const NoSearchBox = styled.div<WithTheme>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
  font-size: ${({ theme }) => theme.sizes.menu};
  font-weight: ${({ theme }) => theme.weight.semiBold};
  font-family: 'Jua', sans-serif;\
    margin-top: 20px;

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${({ theme }) => theme.sizes.small};
  }
`;
