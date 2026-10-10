import { Wrapper } from '../styles';
import { useNavigate } from 'react-router-dom';
import {
  useDeletePost,
  useInsertPost,
  useNoticeDetailFetch,
  useNoticeDownloadFetch,
  useNoticeFetch,
  useUpdatePost,
} from '../recoil/fetch.ts';
import { useEffect, useRef, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { noticeDetailState } from '../recoil/state/noticeState.ts';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import type { default as ClassicEditorType } from '@ckeditor/ckeditor5-build-classic';
import type { FileLoader } from '@ckeditor/ckeditor5-upload';
import type { Editor } from '@ckeditor/ckeditor5-core';
import { showConfirmModal } from '../components/confirmAlert.tsx';
import { toast } from '../utils/toast';
import { useSearchParams } from 'react-router-dom';
import { FaTrash } from 'react-icons/fa';
import { userState } from '../recoil/state/userState.ts';
import { FaDownload } from 'react-icons/fa';
import { theme } from '../styles/theme.ts';
import { EditorWrapper, InputBox, EditorBox, ButtonBox, Button, StyledRadioGroup, StyledRadioLabel, TitleBox, ContentBox, StyledFileUl, StyledFileInput } from './NoticeDetail.styles.ts';

type NewNoticeState = {
  id: number | null;
  title: string;
  content: string;
  type: 'NOTICE' | 'EVENT';
  popupUseStatus: string;
};

export default function NoticeDetail() {
  const user = useRecoilValue(userState);
  const fetchNotice = useNoticeFetch();
  const fetchNoticeDetail = useNoticeDetailFetch();
  const fetchNoticeDownload = useNoticeDownloadFetch();

  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');

  const page = 0;

  const { insert } = useInsertPost();
  const { update } = useUpdatePost();
  const { remove } = useDeletePost();

  const noticeDetail = useRecoilValue(noticeDetailState);

  const navigate = useNavigate();

  const [isEditMode, setIsEditMode] = useState(false);

  const [newNotice, setNewNotice] = useState<NewNoticeState>({
    id: null,
    title: '',
    content: '',
    type: 'NOTICE',
    popupUseStatus: '',
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
    formData.append('popupUseStatus', newNotice.popupUseStatus);

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

  // 상세는 단건 API로 조회한다. 목록에서 find 하면 2페이지 이후 글은 못 찾음
  const notice = noticeDetail;

  useEffect(() => {
    if (id) fetchNoticeDetail(id);
  }, [id]);

  useEffect(() => {
    if (notice && notice.bgmAgitNoticeId === Number(id)) {
      setNewNotice({
        id: notice.bgmAgitNoticeId,
        title: notice.bgmAgitNoticeTitle,
        content: notice.bgmAgitNoticeCont,
        type: notice.bgmAgitNoticeType,
        popupUseStatus: notice.bgmAgitPopupUseStatus,
      });
      setAttachedFiles(notice.bgmAgitNoticeFileList ?? []);
    }
  }, [notice, id]);

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
              color={theme.colors.primary}
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

                  if (notice) {
                    setNewNotice({
                      id: notice.bgmAgitNoticeId,
                      title: notice.bgmAgitNoticeTitle,
                      content: notice.bgmAgitNoticeCont,
                      type: notice.bgmAgitNoticeType,
                      popupUseStatus: notice.bgmAgitPopupUseStatus,
                    });
                    setAttachedFiles(notice.bgmAgitNoticeFileList ?? []);
                  }
                } else {
                  navigate('/notice');
                }
              }}
              color={theme.colors.primary}
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
              <StyledRadioLabel>
                <input
                  type="checkbox"
                  name="bgmAgitPopup"
                  checked={newNotice.popupUseStatus === 'Y'}
                  onChange={e =>
                    setNewNotice(prev => ({
                      ...prev,
                      popupUseStatus: e.target.checked ? 'Y' : 'N',
                    }))
                  }
                />
                팝업
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
