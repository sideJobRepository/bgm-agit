import styled from 'styled-components';
import type { WithTheme } from '../styles/styled-props.ts';
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

export default function ServiceRequest() {
  const user = useRecoilValue(userState);
  // 관리자 전용 게시판. 서버도 403 으로 막지만 비관리자는 API 를 부르지 않는다
  const isAdmin = !!user?.roles?.includes('ROLE_ADMIN');

  const fetchSupport = useServiceRequestFetch();

  const navigate = useNavigate();

  const items = useRecoilValue(serviceRequestState);

  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });

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

const NoticeBox = styled.div`
  padding: 10px;
`;

const TableBox = styled.div`
  padding: 40px 0;
`;

export const TableScrollBox = styled.div<WithTheme>`
  @media ${({ theme }) => theme.device.mobile} {
    width: 100%;
    overflow-x: auto;
  }
`;

const Table = styled.table<WithTheme>`
  width: 100%;
  border-collapse: collapse;
  font-size: ${({ theme }) => theme.sizes.medium};
  color: ${({ theme }) => theme.colors.subColor};
  table-layout: fixed;

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

const Td = styled.td<WithTheme>``;

const StatusLabel = styled.label<WithTheme & { $gb: string }>`
  display: flex;
  align-items: center;
  padding: 0 4px;
  margin-right: 8px;
  color: #ffffff;
  font-size: ${({ theme }) => theme.sizes.xsmall};
  background-color: ${({ $gb }) => ($gb === 'Y' ? '#1A7D55' : theme.colors.primary)};

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${({ theme }) => theme.sizes.xxsmall};
  }
`;

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
    font-family: ${theme.fonts.display};
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
  font-family: ${theme.fonts.display};\
    margin-top: 20px;

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${({ theme }) => theme.sizes.small};
  }
`;

const NoAccessBox = styled.div<WithTheme>`
  padding: 80px 0;
  text-align: center;
  font-size: ${({ theme }) => theme.sizes.medium};
  color: ${({ theme }) => theme.colors.subColor};
`;
