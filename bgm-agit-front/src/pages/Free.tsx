import styled from 'styled-components';
import type { WithTheme } from '../styles/styled-props.ts';
import { useMediaQuery } from 'react-responsive';
import { Wrapper } from '../styles';
import SearchBar from '../components/SearchBar.tsx';
import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { useNavigate } from 'react-router-dom';
import { useCommunityFetch } from '../recoil/communityFetch.ts';
import { communityState } from '../recoil/state/community.ts';
import { FaCommentDots } from 'react-icons/fa';
import { userState } from '../recoil/state/userState.ts';

export default function Free() {
  const user = useRecoilValue(userState);

  const fetchCommunity = useCommunityFetch();

  const navigate = useNavigate();

  const items = useRecoilValue(communityState);

  console.log('커뮤니티 아이템', items);

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
        <SearchWrapper bgColor="#988271">
          <TitleBox textColor="#ffffff">
            <h2>Community Board</h2>
            <p>소소한 일상부터 궁금한 이야기까지, 자유롭게 나눠보세요.</p>
          </TitleBox>
          <SearchBox>
            <SearchBar<string> color="#988271" label="제목 및 내용" onSearch={setSearchKeyword} />
          </SearchBox>
        </SearchWrapper>
        <TableBox>
          {user && (
            <ButtonBox>
              <Button
                color="#988271"
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
                  <Th style={{ width: '120px' }}>아이디</Th>
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
                    <Td>{item.memberName}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </TableScrollBox>
          {items?.content.length === 0 && <NoSearchBox>검색된 결과가 없습니다.</NoSearchBox>}
          <PaginationWrapper>
            {[...Array(items?.totalPages ?? 0)].map((_, idx) => (
              <PageButton key={idx} active={idx === page} onClick={() => handlePageClick(idx)}>
                {idx + 1}
              </PageButton>
            ))}
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

const Td = styled.td<WithTheme>`
  span {
    display: flex;
    align-items: center;
    margin-left: 8px;
    gap: 4px;
    font-size: ${({ theme }) => theme.sizes.small};

    @media ${({ theme }) => theme.device.mobile} {
      font-size: ${({ theme }) => theme.sizes.xxsmall};
    }
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

const PageButton = styled.button.withConfig({
  shouldForwardProp: prop => prop !== 'active',
})<{ active: boolean } & WithTheme>`
  margin: 0 5px;
  padding: 4px 8px;
  border: 1px solid ${({ theme }) => theme.colors.basicColor};
  border-radius: 4px;
  cursor: pointer;
  background-color: ${({ active, theme }) =>
    active ? theme.colors.noticeColor : theme.colors.white};
  color: ${({ active, theme }) => (active ? theme.colors.white : theme.colors.subColor)};

  &:hover {
    opacity: 0.8;
  }
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
