import styled from 'styled-components';
import type { WithTheme } from '../styles/styled-props.ts';
import { useMediaQuery } from 'react-responsive';
import { Wrapper } from '../styles';
import SearchBar from '../components/SearchBar.tsx';
import { useEffect, useState } from 'react';
import { useNoticeFetch } from '../recoil/fetch.ts';
import { useRecoilValue } from 'recoil';
import { noticeState } from '../recoil/state/noticeState.ts';

interface NoticeProps {
  mainGb: boolean;
}

export default function Notice({ mainGb }: NoticeProps) {
  const fetchNotice = useNoticeFetch();
  const items = useRecoilValue(noticeState);
  console.log('items', items);
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });

  const [searchKeyword, setSearchKeyword] = useState('');
  const [page, setPage] = useState(0);

  useEffect(() => {
    fetchNotice({ page, titleOrCont: searchKeyword });
  }, [page, searchKeyword]);

  const handlePageClick = (pageNum: number) => {
    setPage(pageNum);
  };

  //상세 모달
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<{ title: string; content: string } | null>(
    null
  );

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
                <SearchBar color="#988271" label="제목 및 내용" onSearch={setSearchKeyword} />
              </SearchBox>
            </SearchWrapper>
            <TableBox>
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
                  {items?.content?.map(notice => (
                    <tr
                      key={notice.bgmAgitNoticeId}
                      onClick={() => {
                        setSelectedNotice({
                          title: notice.bgmAgitNoticeTitle,
                          content: notice.bgmAgitNoticeCont,
                        });
                        setModalOpen(true);
                      }}
                    >
                      <Td>{notice.bgmAgitNoticeId}</Td>
                      <Td>{notice.bgmAgitNoticeTitle}</Td>
                      {!isMobile && <Td>{notice.registDate}</Td>}
                      <Td>{notice.bgmAgitNoticeType === 'NOTICE' ? '공지' : '이벤트'}</Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
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
      ) : (
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
            {items?.content.slice(0, 6).map(notice => (
              <tr
                key={notice.bgmAgitNoticeId}
                onClick={() => {
                  setSelectedNotice({
                    title: notice.bgmAgitNoticeTitle,
                    content: notice.bgmAgitNoticeCont,
                  });
                  setModalOpen(true);
                }}
              >
                <Td>{notice.bgmAgitNoticeId}</Td>
                <Td>{notice.bgmAgitNoticeTitle}</Td>
                {!isMobile && <Td>{notice.registDate}</Td>}
                <Td>{notice.bgmAgitNoticeType === 'NOTICE' ? '공지' : '이벤트'}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      {modalOpen && selectedNotice && (
        <ModalBackdrop onClick={() => setModalOpen(false)}>
          <ModalBox onClick={e => e.stopPropagation()}>
            <h2>{selectedNotice.title}</h2>
            <p>{selectedNotice.content}</p>
            <CloseButton onClick={() => setModalOpen(false)}>닫기</CloseButton>
          </ModalBox>
        </ModalBackdrop>
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

const ModalBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ModalBox = styled.div<WithTheme>`
  background: ${({ theme }) => theme.colors.white};
  padding: 24px;
  width: 90%;
  max-width: 480px;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  text-align: center;

  h2 {
    font-size: ${({ theme }) => theme.sizes.large};
    color: ${({ theme }) => theme.colors.menuColor};
    margin-bottom: 40px;
  }

  p {
    font-size: ${({ theme }) => theme.sizes.medium};
    color: ${({ theme }) => theme.colors.subColor};
    white-space: pre-wrap;
  }

  @media ${({ theme }) => theme.device.mobile} {
    h2 {
      font-size: ${({ theme }) => theme.sizes.medium};
    }
    p {
      font-size: ${({ theme }) => theme.sizes.small};
    }
  }
`;

const CloseButton = styled.button<WithTheme>`
  margin-top: 60px;
  padding: 6px 16px;
  background-color: ${({ theme }) => theme.colors.noticeColor};
  color: ${({ theme }) => theme.colors.white};
  font-size: ${({ theme }) => theme.sizes.medium};
  border: none;
  border-radius: 4px;
  cursor: pointer;

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${({ theme }) => theme.sizes.small};
  }
`;
