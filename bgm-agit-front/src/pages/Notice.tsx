import styled from 'styled-components';
import type { WithTheme } from '../styles/styled-props.ts';
import { useMediaQuery } from 'react-responsive';
import { Wrapper } from '../styles';
import SearchBar from '../components/SearchBar.tsx';
import { useEffect, useState } from 'react';
import {
  useDeletePost,
  useInsertPost,
  useNoticeDownloadFetch,
  useNoticeFetch,
  useUpdatePost,
} from '../recoil/fetch.ts';
import { useRecoilValue } from 'recoil';
import { noticeState } from '../recoil/state/noticeState.ts';
import { userState } from '../recoil/state/userState.ts';
import type { AxiosRequestHeaders } from 'axios';
import { toast } from 'react-toastify';
import { showConfirmModal } from '../components/confirmAlert.tsx';
import { FaTrash } from 'react-icons/fa';

interface NoticeProps {
  mainGb: boolean;
}

type NewNoticeState = {
  id: number | null;
  title: string;
  content: string;
  type: 'NOTICE' | 'EVENT';
};

export default function Notice({ mainGb }: NoticeProps) {
  const fetchNotice = useNoticeFetch();
  const { insert } = useInsertPost();
  const { update } = useUpdatePost();
  const { remove } = useDeletePost();
  const fetchNoticeDownload = useNoticeDownloadFetch();
  const items = useRecoilValue(noticeState);
  console.log('item', items);
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
  const [isEditMode, setIsEditMode] = useState(false);
  const [writeModalOpen, setWriteModalOpen] = useState(false);
  const [newNotice, setNewNotice] = useState<NewNoticeState>({
    id: null,
    title: '',
    content: '',
    type: 'NOTICE',
  });
  const [files, setFiles] = useState<File[]>([]);
  const [attachedFiles, setAttachedFiles] = useState<
    { fileName: string; url: string; uuidName: string }[]
  >([]);

  //파일 삭제
  const [originalDeletedFileNames, setOriginalDeletedFileNames] = useState<string[]>([]);
  const [deletedFileNames, setDeletedFileNames] = useState<string[]>([]);
  const [deletedFileUuid, setDeletedFileUuid] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  //신규 저장
  function insertData() {
    const formData = new FormData();
    formData.append('bgmAgitNoticeTitle', newNotice.title);
    formData.append('bgmAgitNoticeContent', newNotice.content);
    formData.append('bgmAgitNoticeType', newNotice.type);

    files.forEach(file => {
      formData.append('files', file);
    });
    const token = sessionStorage.getItem('token');

    showConfirmModal({
      message: '저장하시겠습니까?',
      onConfirm: () => {
        if (!validation()) return;

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
            setNewNotice({ id: null, title: '', content: '', type: 'NOTICE' });
            setFiles([]);
            setAttachedFiles([]);
            fetchNotice({ page, titleOrCont: searchKeyword });
          },
        });
      },
    });
  }

  //업데이트
  async function updateData() {
    const formData = new FormData();
    formData.append('bgmAgitNoticeId', newNotice.id!.toString());
    formData.append('bgmAgitNoticeTitle', newNotice.title);
    formData.append('bgmAgitNoticeCont', newNotice.content);
    formData.append('bgmAgitNoticeType', newNotice.type);

    // 삭제파일
    deletedFileUuid.forEach(uuid => {
      formData.append('deletedFiles', uuid);
    });

    // 새로 선택한 파일도 추가
    files.forEach(file => {
      formData.append('multipartFiles', file);
    });

    const token = sessionStorage.getItem('token');
    showConfirmModal({
      message: '수정하시겠습니까?',
      onConfirm: () => {
        if (!validation()) return;

        update({
          headers: {
            Authorization: `Bearer ${token}`,
          } as AxiosRequestHeaders,
          url: `/bgm-agit/notice`,
          body: formData,
          ignoreHttpError: true,
          onSuccess: () => {
            toast.success('공지사항이 수정되었습니다.');
            setWriteModalOpen(false);
            setIsEditMode(false);
            setIsDetailMode(false);
            setNewNotice({ id: null, title: '', content: '', type: 'NOTICE' });
            setFiles([]);
            setAttachedFiles([]);
            setDeletedFileNames([]);
            setDeletedFileUuid([]);
            fetchNotice({ page, titleOrCont: searchKeyword });
          },
        });
      },
    });
  }

  //업데이트
  async function deleteData() {
    const deleteId = newNotice.id!.toString();

    const token = sessionStorage.getItem('token');
    showConfirmModal({
      message: '삭제하시겠습니까?',
      onConfirm: () => {
        remove({
          headers: {
            Authorization: `Bearer ${token}`,
          } as AxiosRequestHeaders,
          url: `/bgm-agit/notice/${deleteId}`,
          ignoreHttpError: true,
          onSuccess: () => {
            toast.success('공지사항이 삭제되었습니다.');
            setWriteModalOpen(false);
            setIsEditMode(false);
            setIsDetailMode(false);
            setNewNotice({ id: null, title: '', content: '', type: 'NOTICE' });
            setFiles([]);
            setAttachedFiles([]);
            setDeletedFileNames([]);
            setDeletedFileUuid([]);
            fetchNotice({ page, titleOrCont: searchKeyword });
          },
        });
      },
    });
  }

  function fileDownload(id: string) {
    const sliceId = id.split('/').pop()!; // 마지막 슬래시 이후 값만 추출
    fetchNoticeDownload(sliceId);
  }

  function validation() {
    if (!newNotice.title) {
      toast.error('타이틀을 입력해주세요.');
      return false;
    } else if (!newNotice.content) {
      toast.error('내용을 입력해주세요.');
      return false;
    }
    return true;
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
                      setIsDetailMode(false);
                      setNewNotice({ id: null, title: '', content: '', type: 'NOTICE' });
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
                          id: notice.bgmAgitNoticeId,
                          title: notice.bgmAgitNoticeTitle,
                          content: notice.bgmAgitNoticeCont,
                          type: notice.bgmAgitNoticeType,
                        });
                        setAttachedFiles(notice.bgmAgitNoticeFileList ?? []);
                        setIsDetailMode(true);
                        setWriteModalOpen(true);
                        setDeletedFileNames([]);
                        setDeletedFileUuid([]);
                        setOriginalDeletedFileNames([]);
                      }}
                    >
                      <Td>{notice.bgmAgitNoticeId}</Td>
                      <Td>{notice.bgmAgitNoticeTitle}</Td>
                      {!isMobile && <Td>{notice.registDate}</Td>}
                      <Td>{notice.bgmAgitNoticeType === 'NOTICE' ? '공지사항' : '이벤트'}</Td>
                    </tr>
                  ))}
                </tbody>
                {items?.content.length === 0 && <NoSearchBox>검색된 결과가 없습니다.</NoSearchBox>}
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
                    id: notice?.bgmAgitNoticeId,
                    title: notice.bgmAgitNoticeTitle,
                    content: notice.bgmAgitNoticeCont,
                    type: notice.bgmAgitNoticeType,
                  });
                  setAttachedFiles(notice.bgmAgitNoticeFileList ?? []);
                  setIsDetailMode(true);
                  setWriteModalOpen(true);
                  setDeletedFileNames([]); // 삭제 초기화
                  setDeletedFileUuid([]);
                  setOriginalDeletedFileNames([]);
                }}
              >
                <Td>{notice.bgmAgitNoticeId}</Td>
                <Td>{notice.bgmAgitNoticeTitle}</Td>
                {!isMobile && <Td>{notice.registDate}</Td>}
                <Td>{notice.bgmAgitNoticeType === 'NOTICE' ? '공지사항' : '이벤트'}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      {writeModalOpen && (
        <ModalBackdrop onClick={() => setWriteModalOpen(false)}>
          <ModalBox onClick={e => e.stopPropagation()}>
            {!isDetailMode && (
              <>
                <StyledRadioGroup>
                  <StyledRadioLabel>
                    <input
                      type="radio"
                      name="bgmAgitNoticeType"
                      value="NOTICE"
                      checked={newNotice.type === 'NOTICE'}
                      onChange={e =>
                        setNewNotice(prev => ({
                          ...prev,
                          type: e.target.value as 'NOTICE' | 'EVENT',
                        }))
                      }
                    />
                    공지
                  </StyledRadioLabel>
                  <StyledRadioLabel>
                    <input
                      type="radio"
                      name="bgmAgitNoticeType"
                      value="EVENT"
                      checked={newNotice.type === 'EVENT'}
                      onChange={e =>
                        setNewNotice(prev => ({
                          ...prev,
                          type: e.target.value as 'NOTICE' | 'EVENT',
                        }))
                      }
                    />
                    이벤트
                  </StyledRadioLabel>
                </StyledRadioGroup>
                <StyledInput
                  type="text"
                  placeholder="제목"
                  value={newNotice.title}
                  onChange={e => setNewNotice(prev => ({ ...prev, title: e.target.value }))}
                />
                {attachedFiles?.length > 0 && (
                  <StyledFileUl>
                    {attachedFiles
                      .filter(file => !deletedFileNames.includes(file.fileName))
                      .map((file, idx) => (
                        <li key={idx}>
                          <a
                            onClick={() => {
                              fileDownload(file.url);
                            }}
                          >
                            {file.fileName}
                          </a>
                          <FaTrash
                            onClick={() => {
                              setDeletedFileUuid(prev => [...prev, file.uuidName]);
                              setDeletedFileNames(prev => [...prev, file.fileName]);
                            }}
                          />
                        </li>
                      ))}
                  </StyledFileUl>
                )}
                <StyledFileInput type="file" multiple onChange={handleFileChange} />
                <StyledTextarea
                  placeholder="내용"
                  value={newNotice.content}
                  onChange={e => setNewNotice(prev => ({ ...prev, content: e.target.value }))}
                />
              </>
            )}
            {isDetailMode && (
              <>
                <DetailTop>{newNotice.type === 'NOTICE' ? '공지사항' : '이벤트'}</DetailTop>
                <DetailCont>
                  <h2>{newNotice.title}</h2>
                  {attachedFiles?.length > 0 && (
                    <StyledFileUl>
                      {attachedFiles.map((file, idx) => (
                        <li key={idx}>
                          <a
                            onClick={() => {
                              fileDownload(file.url);
                            }}
                          >
                            {file.fileName}
                          </a>
                        </li>
                      ))}
                    </StyledFileUl>
                  )}
                  <p>{newNotice.content}</p>
                </DetailCont>
              </>
            )}
            <ButtonBox2>
              {!isDetailMode && (
                <Button color="#1A7D55" onClick={isEditMode ? updateData : insertData}>
                  저장
                </Button>
              )}
              {isDetailMode && user?.roles.includes('ROLE_ADMIN') && (
                <>
                  <Button
                    color="#093A6E"
                    onClick={() => {
                      setIsEditMode(true);
                      setIsDetailMode(false);
                    }}
                  >
                    수정
                  </Button>
                  <Button onClick={deleteData} color="#FF5E57">
                    삭제
                  </Button>
                </>
              )}
              <Button
                color="#988271"
                onClick={() => {
                  setWriteModalOpen(false);
                  setIsEditMode(false);
                  setIsDetailMode(false);
                  setDeletedFileNames(originalDeletedFileNames);
                }}
              >
                닫기
              </Button>
            </ButtonBox2>
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
  z-index: 4;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ModalBox = styled.div<WithTheme>`
  background: ${({ theme }) => theme.colors.white};
  position: relative;
  padding: 24px;
  width: 90%;
  max-width: 480px;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  text-align: center;

  @media ${({ theme }) => theme.device.mobile} {
    h2 {
      font-size: ${({ theme }) => theme.sizes.medium};
    }
    p {
      font-size: ${({ theme }) => theme.sizes.small};
    }
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
    border: 1px solid ${({ theme }) => theme.colors.noticeColor};
    background-color: transparent;
  }
`;

const StyledTextarea = styled.textarea<WithTheme>`
  width: 100%;
  min-height: 200px;
  margin-bottom: 10px;
  border: 1px solid ${({ theme }) => theme.colors.lineColor};
  outline: none;
  padding: 8px;
  color: ${({ theme }) => theme.colors.subColor};
  font-size: ${({ theme }) => theme.sizes.medium};
  background-color: transparent;
  resize: none;

  &:focus {
    border: 1px solid ${({ theme }) => theme.colors.noticeColor};
    background-color: transparent;
  }
`;

const StyledFileInput = styled.input<WithTheme>`
  margin-bottom: 10px;
  width: 100%;
  padding: 10px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.lineColor};

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

const DetailTop = styled.div<WithTheme>`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  top: 0;
  left: 0;
  width: 100%;
  height: 50px;
  border-radius: 12px 12px 0 0;
  background-color: ${({ theme }) => theme.colors.basicColor};
  color: ${({ theme }) => theme.colors.menuColor};
  font-family: 'Jua', sans-serif;
  font-size: ${({ theme }) => theme.sizes.bigLarge};

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${({ theme }) => theme.sizes.large};
  }
`;

const DetailCont = styled.div<WithTheme>`
  display: flex;
  flex-direction: column;
  margin: 50px 0 30px 0;

  h2 {
    width: 100%;
    text-align: left;
    padding: 10px;
    font-size: ${({ theme }) => theme.sizes.large};
    color: ${({ theme }) => theme.colors.subColor};
    font-weight: ${({ theme }) => theme.weight.semiBold};
  }

  p {
    width: 100%;
    margin-top: 20px;
    min-height: 200px;
    padding: 10px;
    text-align: left;
    border: 1px solid ${({ theme }) => theme.colors.lineColor};
    color: ${({ theme }) => theme.colors.subColor};
    font-size: ${({ theme }) => theme.sizes.small};
  }

  @media ${({ theme }) => theme.device.mobile} {
    h2 {
      font-size: ${({ theme }) => theme.sizes.medium};
    }
    p {
      font-size: ${({ theme }) => theme.sizes.xsmall};
    }
  }
`;

const StyledFileUl = styled.ul<WithTheme>`
  display: flex;
  flex-direction: column;
  text-align: left;
  width: 100%;
  color: ${({ theme }) => theme.colors.subColor};
  border-top: 1px solid ${({ theme }) => theme.colors.lineColor};

  li {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px;
    font-size: ${({ theme }) => theme.sizes.xsmall};

    a {
      cursor: pointer;
    }

    svg {
      cursor: pointer;
    }
  }
`;

const ButtonBox2 = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  justify-content: center;
`;

const NoSearchBox = styled.div<WithTheme>`
  font-size: ${({ theme }) => theme.sizes.menu};
  font-weight: ${({ theme }) => theme.weight.semiBold};
  font-family: 'Jua', sans-serif;\
    margin-top: 20px;

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${({ theme }) => theme.sizes.small};
  }
`;
