import { NoticeBox, TableBox, TableScrollBox, Table, Th, Td, StatusLabel, SearchWrapper, TitleBox, SearchBox, PaginationWrapper, Button, ButtonBox, NoSearchBox } from './Inquiry.styles.ts';
import { useMediaQuery } from 'react-responsive';
import { Wrapper } from '../styles';
import SearchBar from '../components/SearchBar.tsx';
import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { useNavigate } from 'react-router-dom';
import { userState } from '../recoil/state/userState.ts';
import Pagination from '../components/Pagination.tsx';
import { useSupportFetch } from '../recoil/supportFetch.ts';
import { supportState } from '../recoil/state/supportState.ts';
import { theme } from '../styles/theme.ts';

export default function Inquiry() {
  const user = useRecoilValue(userState);

  const fetchSupport = useSupportFetch();

  const navigate = useNavigate();

  const items = useRecoilValue(supportState);
  console.log('items', user);
  console.log('items', items);

  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });

  const [searchKeyword, setSearchKeyword] = useState('');
  const [page, setPage] = useState(0);

  useEffect(() => {
    fetchSupport({ page, titleOrCont: searchKeyword });
  }, [page, searchKeyword]);

  const handlePageClick = (pageNum: number) => {
    setPage(pageNum);
  };

  return (
    <Wrapper>
      <NoticeBox>
        <SearchWrapper bgColor={theme.colors.primary}>
          <TitleBox textColor="#ffffff">
            <h2>Customer Support</h2>
            <p>궁금한 점이나 요청사항을 남겨주시면 빠르게 답변드리겠습니다.</p>
          </TitleBox>
          <SearchBox>
            <SearchBar<string> color={theme.colors.primary} label="제목 및 내용" onSearch={setSearchKeyword} />
          </SearchBox>
        </SearchWrapper>
        <TableBox>
          {user?.roles.includes('ROLE_USER') && (
            <ButtonBox>
              <Button
                color={theme.colors.primary}
                onClick={() => {
                  navigate(`/inquiryDetail`);
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
                      navigate(`/inquiryDetail?id=${item.id}`);
                    }}
                  >
                    <Td>{index + 1}</Td>
                    <Td style={{ display: 'flex' }}>
                      <StatusLabel $gb={item.answerStatus}>
                        {item.answerStatus === 'Y' ? '답변완료' : '답변대기'}
                      </StatusLabel>
                      {item.title}
                    </Td>
                    {!isMobile && <Td>{item.registDate}</Td>}
                    <Td>{item.memberName}</Td>
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
