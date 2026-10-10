import { useMediaQuery } from 'react-responsive';
import { Wrapper } from '../styles';
import SearchBar from '../components/SearchBar.tsx';
import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { useNavigate } from 'react-router-dom';
import { useCommunityFetch } from '../recoil/communityFetch.ts';
import { communityState } from '../recoil/state/communitySate.ts';
import { FaCommentDots } from 'react-icons/fa';
import { userState } from '../recoil/state/userState.ts';
import Pagination from '../components/Pagination.tsx';
import { theme } from '../styles/theme.ts';
import {
  NoticeBox,
  TableBox,
  TableScrollBox,
  Table,
  Th,
  Td,
  SearchWrapper,
  TitleBox,
  SearchBox,
  PaginationWrapper,
  Button,
  ButtonBox,
  NoSearchBox,
} from './Free.styles.ts';

export default function Free() {
  const user = useRecoilValue(userState);

  const fetchCommunity = useCommunityFetch();

  const navigate = useNavigate();

  const items = useRecoilValue(communityState);

  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });

  const [searchKeyword, setSearchKeyword] = useState('');
  const [page, setPage] = useState(0);

  useEffect(() => {
    fetchCommunity({ page, titleOrCont: searchKeyword });
  }, [page, searchKeyword]);

  const handlePageClick = (pageNum: number) => {
    setPage(pageNum);
  };

  return (
    <Wrapper>
      <NoticeBox>
        <SearchWrapper bgColor={theme.colors.primary}>
          <TitleBox textColor="#ffffff">
            <h2>Community Board</h2>
            <p>소소한 일상부터 궁금한 이야기까지, 자유롭게 나눠보세요.</p>
          </TitleBox>
          <SearchBox>
            <SearchBar<string> color={theme.colors.primary} label="제목 및 내용" onSearch={setSearchKeyword} />
          </SearchBox>
        </SearchWrapper>
        <TableBox>
          {user && (
            <ButtonBox>
              <Button
                color={theme.colors.primary}
                onClick={() => {
                  navigate(`/freeDetail`);
                }}
              >
                작성
              </Button>
            </ButtonBox>
          )}
          <TableScrollBox>
            <Table>
              <thead>
                <tr>
                  <Th style={{ width: '50px' }}>번호</Th>
                  <Th style={{ width: '250px' }}>제목</Th>
                  {!isMobile && <Th style={{ width: '120px' }}>날짜</Th>}
                  <Th style={{ width: '120px' }}>닉네임</Th>
                </tr>
              </thead>
              <tbody>
                {items?.content?.map((item, index) => (
                  <tr
                    key={item.id}
                    onClick={() => {
                      navigate(`/freeDetail?id=${item.id}`);
                    }}
                  >
                    <Td>{index + 1}</Td>
                    <Td style={{ display: 'flex' }}>
                      {item.title}
                      <span>
                        <FaCommentDots />
                        {item.commentCount}
                      </span>
                    </Td>
                    {!isMobile && <Td>{item.registDate}</Td>}
                    <Td>{item.memberNickname}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </TableScrollBox>
          {items?.content.length === 0 && <NoSearchBox>검색된 결과가 없습니다.</NoSearchBox>}
          <PaginationWrapper>
            <Pagination current={page} totalPages={items?.totalPages} onChange={handlePageClick} />
          </PaginationWrapper>
        </TableBox>
      </NoticeBox>
    </Wrapper>
  );
}
