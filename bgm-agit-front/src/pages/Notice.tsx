import styled from 'styled-components';
import type { WithTheme } from '../styles/styled-props.ts';
import { useMediaQuery } from 'react-responsive';
import { Wrapper } from '../styles';
import SearchBar from '../components/SearchBar.tsx';
import { useEffect, useState } from 'react';
import { useInsertPost, useNoticeFetch } from '../recoil/fetch.ts';
import { useRecoilValue } from 'recoil';
import { noticeState } from '../recoil/state/noticeState.ts';
import { userState } from '../recoil/state/userState.ts';
import type { AxiosRequestHeaders } from 'axios';
import { toast } from 'react-toastify';

interface NoticeProps {
  mainGb: boolean;
}

export default function Notice({ mainGb }: NoticeProps) {
  const fetchNotice = useNoticeFetch();
  const { insert } = useInsertPost();
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

  const [isDetailMode, setIsDetailMode] = useState(false);
  const [writeModalOpen, setWriteModalOpen] = useState(false);
  const [newNotice, setNewNotice] = useState({ title: '', content: '', type: 'NOTICE' });
  const [files, setFiles] = useState<File[]>([]);
  const [attachedFiles, setAttachedFiles] = useState<{ fileName: string; url: string }[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  function insertData() {
    const formData = new FormData();
    formData.append('bgmAgitNoticeTitle', newNotice.title);
    formData.append('bgmAgitNoticeContent', newNotice.content);
    formData.append('bgmAgitNoticeType', newNotice.type);

    files.forEach(file => {
      formData.append('files', file);
    });
    const token = sessionStorage.getItem('token');

    insert({
      headers: {
        Authorization: `Bearer ${token}`,
      } as AxiosRequestHeaders,
      url: '/bgm-agit/notice',
      body: formData,
      ignoreHttpError: true,
      onSuccess: () => {
        toast.success('공지사항이 작성되었습니다.');
        setWriteModalOpen(false);
        setNewNotice({ title: '', content: '', type: 'NOTICE' });
        setFiles([]);
        setAttachedFiles([]);
        fetchNotice({ page, titleOrCont: searchKeyword });
      },
    });
  }

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
              {user?.roles.includes('ROLE_ADMIN') && (
                <ButtonBox>
                  <Button
                    onClick={() => {
                      setIsDetailMode(false);
                      setNewNotice({ title: '', content: '', type: 'NOTICE' });
                      setFiles([]);
                      setAttachedFiles([]);
                      setWriteModalOpen(true);
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
                  {items?.content?.map(notice => (
                    <tr
                      key={notice.bgmAgitNoticeId}
                      onClick={() => {
                        setNewNotice({
                          title: notice.bgmAgitNoticeTitle,
                          content: notice.bgmAgitNoticeCont,
                          type: notice.bgmAgitNoticeType,
                        });
                        setAttachedFiles(notice.bgmAgitNoticeFileList ?? []);
                        setIsDetailMode(true);
                        setWriteModalOpen(true);
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
                  setNewNotice({
                    title: notice.bgmAgitNoticeTitle,
                    content: notice.bgmAgitNoticeCont,
                    type: notice.bgmAgitNoticeType,
                  });
                  setAttachedFiles(notice.bgmAgitNoticeFileList ?? []);
                  setIsDetailMode(true);
                  setWriteModalOpen(true);
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
      {writeModalOpen && (
        <ModalBackdrop onClick={() => setWriteModalOpen(false)}>
          <ModalBox onClick={e => e.stopPropagation()}>
            <StyledRadioGroup>
              <StyledRadioLabel>
                <input
                  type="radio"
                  name="bgmAgitNoticeType"
                  value="NOTICE"
                  disabled={isDetailMode}
                  checked={newNotice.type === 'NOTICE'}
                  onChange={e => setNewNotice(prev => ({ ...prev, type: e.target.value }))}
                />
                공지
              </StyledRadioLabel>
              <StyledRadioLabel>
                <input
                  type="radio"
                  name="bgmAgitNoticeType"
                  value="EVENT"
                  disabled={isDetailMode}
                  checked={newNotice.type === 'EVENT'}
                  onChange={e => setNewNotice(prev => ({ ...prev, type: e.target.value }))}
                />
                이벤트
              </StyledRadioLabel>
            </StyledRadioGroup>
            <StyledInput
              type="text"
              placeholder="제목"
              value={newNotice.title}
              readOnly={isDetailMode}
              onChange={e => setNewNotice(prev => ({ ...prev, title: e.target.value }))}
            />
            {!isDetailMode && <StyledFileInput type="file" multiple onChange={handleFileChange} />}
            {attachedFiles?.length > 0 && (
              <StyledFileUl>
                {attachedFiles.map((file, idx) => (
                  <li key={idx}>
                    <a href={file.url} target="_blank" rel="noopener noreferrer">
                      {file.fileName}
                    </a>
                  </li>
                ))}
              </StyledFileUl>
            )}
            <StyledTextarea
              placeholder="내용"
              value={newNotice.content}
              readOnly={isDetailMode}
              onChange={e => setNewNotice(prev => ({ ...prev, content: e.target.value }))}
            />
            {!isDetailMode && <Button onClick={insertData}>제출</Button>}
            <Button onClick={() => setWriteModalOpen(false)}>닫기</Button>
          </ModalBox>
        </ModalBackdrop>
      )}
    </>
  );
}

// styled-components들은 이전과 동일하게 유지

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
    margin-bottom: 60px;
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

const Button = styled.button<WithTheme>`
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

const ButtonBox = styled.div`
  display: flex;
  justify-content: right;
  margin-bottom: 10px;
`;

const StyledInput = styled.input<WithTheme>`
  width: 100%;
  margin-bottom: 10px;
  border: 1px solid ${({ theme }) => theme.colors.lineColor};
  outline: none;
  padding: 8px;
  font-size: ${({ theme }) => theme.sizes.medium};
  background-color: transparent;
  color: ${({ theme }) => theme.colors.subColor};

  &:focus {
    border-bottom: 1px solid ${({ theme }) => theme.colors.noticeColor};
    background-color: transparent;
  }
`;

const StyledTextarea = styled.textarea<WithTheme>`
  width: 100%;
  height: 100px;
  margin-bottom: 10px;
  border: 1px solid ${({ theme }) => theme.colors.lineColor};
  outline: none;
  padding: 8px;
  color: ${({ theme }) => theme.colors.subColor};
  font-size: ${({ theme }) => theme.sizes.medium};
  background-color: transparent;
  resize: none;

  &:focus {
    border-bottom: 1px solid ${({ theme }) => theme.colors.noticeColor};
    background-color: transparent;
  }
`;

const StyledFileInput = styled.input<WithTheme>`
  margin-bottom: 10px;
  width: 100%;

  &::-webkit-file-upload-button {
    background: ${({ theme }) => theme.colors.noticeColor};
    color: ${({ theme }) => theme.colors.white};
    border: none;
    padding: 6px 12px;
    cursor: pointer;
    font-size: ${({ theme }) => theme.sizes.small};
    border-radius: 4px;
  }
`;

const StyledRadioGroup = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
`;

const StyledRadioLabel = styled.label<WithTheme>`
  display: flex;
  align-items: center;
  font-size: ${({ theme }) => theme.sizes.medium};
  color: ${({ theme }) => theme.colors.subColor};
  cursor: pointer;

  input {
    margin-right: 6px;
    accent-color: ${({ theme }) => theme.colors.noticeColor};
  }
`;

const StyledFileUl = styled.ul<WithTheme>`
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
  color: ${({ theme }) => theme.colors.subColor};
`;
