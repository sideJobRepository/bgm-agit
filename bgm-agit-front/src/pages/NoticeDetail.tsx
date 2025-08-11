import { Wrapper } from '../styles';
import { useNavigate } from 'react-router-dom';
import {
  useDeletePost,
  useInsertPost,
  useNoticeDownloadFetch,
  useNoticeFetch,
  useUpdatePost,
} from '../recoil/fetch.ts';
import { useEffect, useRef, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { noticeState } from '../recoil/state/noticeState.ts';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import type { default as ClassicEditorType } from '@ckeditor/ckeditor5-build-classic';
import type { FileLoader } from '@ckeditor/ckeditor5-upload';
import type { Editor } from '@ckeditor/ckeditor5-core';
import styled from 'styled-components';
import type { WithTheme } from '../styles/styled-props.ts';
import { showConfirmModal } from '../components/confirmAlert.tsx';
import type { AxiosRequestHeaders } from 'axios';
import { toast } from 'react-toastify';
import { useSearchParams } from 'react-router-dom';
import { FaTrash } from 'react-icons/fa';
import { userState } from '../recoil/state/userState.ts';
import { FaDownload } from 'react-icons/fa';

type NewNoticeState = {
  id: number | null;
  title: string;
  content: string;
  type: 'NOTICE' | 'EVENT';
};

export default function NoticeDetail() {
  const user = useRecoilValue(userState);
  const fetchNotice = useNoticeFetch();
  const fetchNoticeDownload = useNoticeDownloadFetch();

  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const page = 0;

  const { insert } = useInsertPost();
  const { update } = useUpdatePost();
  const { remove } = useDeletePost();

  const notices = useRecoilValue(noticeState);
  const navigate = useNavigate();

  const [isEditMode, setIsEditMode] = useState(false);

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

  const [deletedFileNames, setDeletedFileNames] = useState<string[]>([]);
  const [deletedFileUuid, setDeletedFileUuid] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const editorRef = useRef<ClassicEditorType | null>(null);

  function fileDownload(id: string) {
    const sliceId = id.split('/').pop()!; // 마지막 슬래시 이후 값만 추출
    fetchNoticeDownload(sliceId);
  }

  const handleSubmit = async () => {
    const formData = new FormData();

    formData.append('bgmAgitNoticeTitle', newNotice.title);

    formData.append('bgmAgitNoticeType', newNotice.type);

    if (isEditMode) {
      formData.append('bgmAgitNoticeId', id!);
      formData.append('bgmAgitNoticeCont', newNotice.content);

      deletedFileUuid.forEach(uuid => {
        formData.append('deletedFiles', uuid);
      });

      files.forEach(file => {
        formData.append('multipartFiles', file);
      });
    } else {
      formData.append('bgmAgitNoticeContent', newNotice.content);
      files.forEach(file => {
        formData.append('files', file);
      });
    }

    const requestFn = isEditMode ? update : insert;

    showConfirmModal({
      message: '저장하시겠습니까?',
      onConfirm: () => {
        if (!validation()) return;

        requestFn({
          url: '/bgm-agit/notice',
          body: formData,
          ignoreHttpError: true,
          onSuccess: () => {
            if (!isEditMode) {
              navigate(`/notice`);
              toast.success('공지사항이 작성되었습니다.');
            } else {
              showConfirmModal({
                message: (
                  <>
                    공지사항이 저장되었습니다. <br /> 목록으로 이동하시겠습니까?
                  </>
                ),
                onConfirm: () => {
                  navigate(`/notice`);
                },
              });
              fetchNotice({ page, titleOrCont: '' });
            }
            setIsEditMode(false);
          },
        });
      },
    });
  };

  //삭제
  async function deleteData() {
    const deleteId = newNotice.id!.toString();

    showConfirmModal({
      message: '삭제하시겠습니까?',
      onConfirm: () => {
        remove({
          url: `/bgm-agit/notice/${deleteId}`,
          ignoreHttpError: true,
          onSuccess: () => {
            toast.success('공지사항이 삭제되었습니다.');
            navigate(`/notice`);
          },
        });
      },
    });
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

  const notice = notices.content?.find(item => item.bgmAgitNoticeId === Number(id));

  useEffect(() => {
    if (id) fetchNotice({ page, titleOrCont: '' });
  }, []);

  useEffect(() => {
    const matched = notices.content?.find(item => item.bgmAgitNoticeId === Number(id));
    if (matched) {
      setNewNotice({
        id: matched.bgmAgitNoticeId,
        title: matched.bgmAgitNoticeTitle,
        content: matched.bgmAgitNoticeCont,
        type: matched.bgmAgitNoticeType,
      });
      setAttachedFiles(matched.bgmAgitNoticeFileList ?? []);
    }
  }, [notices, id]);

  //동영상 변환 함수
  function convertOembedToIframe(html: string): string {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const oembeds = doc.querySelectorAll('oembed');

    oembeds.forEach(oembed => {
      const url = oembed.getAttribute('url')!;
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        const videoId = extractYoutubeVideoId(url);
        const iframe = document.createElement('iframe');
        iframe.src = `https://www.youtube.com/embed/${videoId}`;
        iframe.width = '100%';
        iframe.height = '400';
        iframe.setAttribute('frameborder', '0');
        iframe.setAttribute('allowfullscreen', 'true');
        oembed.replaceWith(iframe);
      }
    });

    return doc.body.innerHTML;
  }

  function extractYoutubeVideoId(url: string): string {
    try {
      const u = new URL(url);
      if (u.hostname === 'youtu.be') {
        return u.pathname.substring(1);
      } else if (u.hostname.includes('youtube.com')) {
        return u.searchParams.get('v') || '';
      }
      return '';
    } catch {
      return '';
    }
  }

  return (
    <Wrapper>
      {id && !isEditMode ? (
        <>
          <ButtonBox>
            {user?.roles.includes('ROLE_ADMIN') && (
              <>
                <Button
                  onClick={() => {
                    setIsEditMode(true);
                  }}
                  color="#093A6E"
                >
                  수정
                </Button>
                <Button color="#FF5E57" onClick={() => deleteData()}>
                  삭제
                </Button>
              </>
            )}
            <Button
              onClick={() => {
                navigate(`/notice`);
              }}
              color="#988271"
            >
              목록
            </Button>
          </ButtonBox>
          <TitleBox>
            <div>
              <h3>{notice?.bgmAgitNoticeType === 'NOTICE' ? '공지사항' : '이벤트'}</h3>
              <span>{notice?.registDate} </span>
            </div>
            <h2>{notice?.bgmAgitNoticeTitle}</h2>
          </TitleBox>
          {attachedFiles.length > 0 && (
            <StyledFileUl>
              {attachedFiles.map((file, idx) => (
                <li key={idx}>
                  <a
                    onClick={() => {
                      fileDownload(file.url);
                    }}
                  >
                    {file.fileName}
                    <FaDownload />
                  </a>
                </li>
              ))}
            </StyledFileUl>
          )}

          <ContentBox
            className="ck-content"
            dangerouslySetInnerHTML={{
              __html: convertOembedToIframe(String(notice?.bgmAgitNoticeCont)),
            }}
          />
        </>
      ) : (
        <>
          <ButtonBox>
            <Button onClick={handleSubmit} color="#1A7D55">
              저장
            </Button>
            <Button
              onClick={() => {
                if (isEditMode) {
                  setIsEditMode(false);
                  setDeletedFileNames([]);
                  setDeletedFileUuid([]);

                  const matched = notices.content?.find(
                    item => item.bgmAgitNoticeId === Number(id)
                  );
                  if (matched) {
                    setNewNotice({
                      id: matched.bgmAgitNoticeId,
                      title: matched.bgmAgitNoticeTitle,
                      content: matched.bgmAgitNoticeCont,
                      type: matched.bgmAgitNoticeType,
                    });
                    setAttachedFiles(matched.bgmAgitNoticeFileList ?? []);
                  }
                } else {
                  navigate('/notice');
                }
              }}
              color="#988271"
            >
              취소
            </Button>
          </ButtonBox>
          <EditorWrapper>
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
            <InputBox
              type="text"
              placeholder="제목을 입력해주세요."
              value={newNotice.title}
              onChange={e => setNewNotice(prev => ({ ...prev, title: e.target.value }))}
            />
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
                      <FaDownload />
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
            <StyledFileInput type="file" multiple onChange={handleFileChange} />
            <EditorBox>
              <CKEditor
                editor={ClassicEditor}
                data={newNotice.content}
                config={{
                  mediaEmbed: {
                    previewsInData: true,
                  },
                }}
                onReady={(editor: Editor) => {
                  editorRef.current = editor as unknown as ClassicEditor;

                  editor.plugins.get('FileRepository').createUploadAdapter = (
                    loader: FileLoader
                  ) => {
                    return {
                      upload: async () => {
                        const file = await loader.file;
                        const formData = new FormData();

                        if (file) formData.append('file', file);

                        return new Promise(resolve => {
                          insert<FormData>({
                            url: '/bgm-agit/notice/file',
                            body: formData,
                            ignoreHttpError: true,
                            onSuccess: (data: unknown) => {
                              const url = data as string;
                              resolve({ default: url });
                            },
                          });
                        });
                      },
                      abort: () => {
                        console.warn('업로드 중단됨');
                      },
                    };
                  };
                }}
                onChange={(_, editor) => {
                  const data = editor.getData();
                  setNewNotice(prev => ({ ...prev, content: data }));
                }}
              />
            </EditorBox>
          </EditorWrapper>
        </>
      )}
    </Wrapper>
  );
}

const EditorWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100vh - 150px);
  box-sizing: border-box;
  padding-bottom: 40px;
`;

const InputBox = styled.input<WithTheme>`
  height: 40px;
  width: 100%;
  margin-bottom: 10px;
  padding: 0 8px;

  border: 1px solid #c4c4c4; /* CKEditor 기본 테두리 색상 */
  border-radius: 4px;
  box-shadow: none;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.noticeColor};
  }
`;

const EditorBox = styled.section<WithTheme>`
  flex: 1;
  min-height: 0; /* 이게 핵심! */

  .ck-editor {
    height: 100% !important;
    min-height: 0 !important;
    max-height: 100% !important;
  }

  .ck-editor__main {
    height: 100% !important;
  }

  .ck-editor__editable_inline {
    height: 100% !important;
    min-height: 0 !important;
    box-sizing: border-box;
    overflow: auto;
  }

  .ck.ck-editor__editable.ck-focused:not(.ck-editor__nested-editable) {
    border-color: ${({ theme }) => theme.colors.noticeColor} !important;
    box-shadow: none !important;
  }
`;

const ButtonBox = styled.div`
  flex-shrink: 0;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  margin-bottom: 10px;
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

  input {
    cursor: pointer;
    margin-right: 6px;
    accent-color: ${({ theme }) => theme.colors.noticeColor};
  }
`;

const TitleBox = styled.div<WithTheme>`
  display: flex;
  flex-direction: column;
  width: 100%;
  border-top: 1px solid ${({ theme }) => theme.colors.bronzeColor};
  border-bottom: 1px solid ${({ theme }) => theme.colors.basicColor};

  div {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 20px;
    width: 100%;
    background-color: ${({ theme }) => theme.colors.basicColor};

    h3 {
      color: ${({ theme }) => theme.colors.bronzeColor};
      font-size: ${({ theme }) => theme.sizes.menu};
      font-weight: ${({ theme }) => theme.weight.bold};

      @media ${({ theme }) => theme.device.mobile} {
        font-size: ${({ theme }) => theme.sizes.large};
      }
    }
    span {
      margin-left: auto;
      color: ${({ theme }) => theme.colors.subColor};
      font-size: ${({ theme }) => theme.sizes.medium};

      @media ${({ theme }) => theme.device.mobile} {
        font-size: ${({ theme }) => theme.sizes.small};
      }
    }
  }

  h2 {
    display: flex;
    height: 100%;
    align-items: center;
    padding: 20px 10px;
    color: ${({ theme }) => theme.colors.subColor};
    font-size: ${({ theme }) => theme.sizes.xlarge};
    font-weight: ${({ theme }) => theme.weight.bold};
    font-family: 'Jua', sans-serif;

    @media ${({ theme }) => theme.device.mobile} {
      font-size: ${({ theme }) => theme.sizes.menu};
    }
  }
`;

const ContentBox = styled.div<WithTheme>`
  height: 100%;
  width: 100%;
  min-height: calc(100vh - 360px);
  padding: 20px 10px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.bronzeColor};
  margin-bottom: 20px;

  iframe {
    width: 100%;
    height: auto; /* 고정 height 제거 */
    aspect-ratio: 16 / 9; /* 16:9 비율 유지 */
    max-width: 100%;
    border: none;
    display: block;
  }

  figure.media {
    margin: 20px 0;
    max-height: unset;
    overflow: visible;
  }
`;

const StyledFileUl = styled.ul<WithTheme>`
  display: flex;
  flex-direction: column;
  text-align: left;
  width: 100%;
  color: ${({ theme }) => theme.colors.bronzeColor};
  padding-top: 10px;
  gap: 4px;
  padding-bottom: 10px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.basicColor};

  li {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: ${({ theme }) => theme.sizes.xsmall};

    a {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 8px;
      background-color: ${({ theme }) => theme.colors.basicColor};
      border-radius: 4px;
      cursor: pointer;

      &:hover {
        opacity: 0.7;
      }
    }

    svg {
      cursor: pointer;
    }
  }
`;

const StyledFileInput = styled.input<WithTheme>`
  margin-bottom: 10px;
  width: 100%;
  padding: 10px 0;
  border: none;

  &::-webkit-file-upload-button {
    background: ${({ theme }) => theme.colors.noticeColor};
    color: ${({ theme }) => theme.colors.white};
    border: none;
    padding: 6px 12px;
    cursor: pointer;
    font-size: ${({ theme }) => theme.sizes.small};
  }
`;
