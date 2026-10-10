import { useMediaQuery } from 'react-responsive';
import { Wrapper } from '../styles';
import SearchBar from '../components/SearchBar.tsx';
import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { useNavigate } from 'react-router-dom';
import { userState } from '../recoil/state/userState.ts';
import Pagination from '../components/Pagination.tsx';
import { useServiceRequestFetch } from '../recoil/serviceRequestFetch.ts';
import { serviceRequestState } from '../recoil/state/serviceRequestState.ts';
import { theme } from '../styles/theme.ts';
import { NoticeBox, TableBox, TableScrollBox, Table, Th, Td, StatusLabel, SearchWrapper, TitleBox, SearchBox, PaginationWrapper, Button, ButtonBox, NoSearchBox, NoAccessBox } from './ServiceRequest.styles.ts';

export default function ServiceRequest() {
  const user = useRecoilValue(userState);
  // 관리자 전용 게시판. 서버도 403 으로 막지만 비관리자는 API 를 부르지 않는다
  const isAdmin = !!user?.roles?.includes('ROLE_ADMIN');

  const fetchSupport = useServiceRequestFetch();

  const navigate = useNavigate();

  const items = useRecoilValue(serviceRequestState);

  const isMobile = useMediaQuery({ query: theme.device.mobile });

  const [searchKeyword, setSearchKeyword] = useState('');
  const [page, setPage] = useState(0);

  useEffect(() => {
    if (!isAdmin) return;
    fetchSupport({ page, titleOrCont: searchKeyword });
  }, [page, searchKeyword, isAdmin]);

  const handlePageClick = (pageNum: number) => {
    setPage(pageNum);
  };

  if (!isAdmin) {
    return (
      <Wrapper>
        <NoAccessBox>관리자만 이용할 수 있는 화면입니다.</NoAccessBox>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <NoticeBox>
        <SearchWrapper bgColor={theme.colors.primary}>
          <TitleBox textColor="#ffffff">
            <h2>Service Request</h2>
            <p>유지보수·기능 요청을 남겨주시면 확인 후 처리 결과를 답변으로 남깁니다.</p>
          </TitleBox>
          <SearchBox>
            <SearchBar<string> color={theme.colors.primary} label="제목 및 내용" onSearch={setSearchKeyword} />
          </SearchBox>
        </SearchWrapper>
        <TableBox>
          {isAdmin && (
            <ButtonBox>
              <Button
                color={theme.colors.primary}
                onClick={() => {
                  navigate(`/serviceRequestDetail`);
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
                  <Th style={{ width: '120px' }}>작성자</Th>
                </tr>
              </thead>
              <tbody>
                {items?.content?.map((item, index) => (
                  <tr
                    key={item.id}
                    onClick={() => {
                      navigate(`/serviceRequestDetail?id=${item.id}`);
                    }}
                  >
                    <Td>{index + 1}</Td>
                    <Td style={{ display: 'flex' }}>
                      <StatusLabel $gb={item.answerStatus}>
                        {item.answerStatus === 'Y' ? '처리완료' : '처리대기'}
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
