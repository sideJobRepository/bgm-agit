import { Wrapper } from '../styles';
import { useNavigate } from 'react-router-dom';
import { useDeletePost, useInsertPost, useUpdatePost } from '../recoil/fetch.ts';
import React, { useEffect, useRef, useState } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { BiSubdirectoryRight } from 'react-icons/bi';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import type { default as ClassicEditorType } from '@ckeditor/ckeditor5-build-classic';
import type { FileLoader } from '@ckeditor/ckeditor5-upload';
import type { Editor } from '@ckeditor/ckeditor5-core';
import styled from 'styled-components';
import type { WithTheme } from '../styles/styled-props.ts';
import { showConfirmModal } from '../components/confirmAlert.tsx';
import { toast } from 'react-toastify';
import { useSearchParams } from 'react-router-dom';
import { FaCommentDots, FaTrash } from 'react-icons/fa';
import { userState } from '../recoil/state/userState.ts';
import { FaDownload } from 'react-icons/fa';
import LoginMoadl from '../components/LoginMoadl.tsx';
import { useDetailSupportFetch, useSupportDownloadFetch } from '../recoil/supportFetch.ts';
import { detailSupportState } from '../recoil/state/supportState.ts';
import type { SupportFile } from '../types/support.ts';

type NewSupportState = {
  id: string;
  title: string;
  cont: string;
};

export default function InquiryDetail() {
  const user = useRecoilValue(userState);

  //로그인 모달
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  //디테일 조회
  const fetchDetailSupport = useDetailSupportFetch();
  const detailItem = useRecoilValue(detailSupportState);
  const setDetailItem = useSetRecoilState(detailSupportState);

  const fetchSupportDownload = useSupportDownloadFetch();

  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');

  const { insert } = useInsertPost();
  const { update } = useUpdatePost();
  const { remove } = useDeletePost();

  const navigate = useNavigate();

  const [isEditMode, setIsEditMode] = useState(false);

  const [isReplyEditMode, setIsReplyEditMode] = useState(false);

  const [supportItem, setSupportItem] = useState<NewSupportState>({
    id: '',
    title: '',
    cont: '',
  });

  //댓글
  const [supportReplyItem, setSupportReplyItem] = useState<NewSupportState>({
    id: '',
    title: '',
    cont: '',
  });

  const [files, setFiles] = useState<File[]>([]);
  const [attachedFiles, setAttachedFiles] = useState<SupportFile[]>([]);

  const [deletedFileNames, setDeletedFileNames] = useState<string[]>([]);
  const [deletedFileId, setDeletedFileId] = useState<string[]>([]);

  //답글 파일
  // 댓글용 파일 상태 추가
  const [replyFiles, setReplyFiles] = useState<File[]>([]);
  const [replyAttachedFiles, setReplyAttachedFiles] = useState<SupportFile[]>([]);
  const [replyDeletedFileNames, setReplyDeletedFileNames] = useState<string[]>([]);
  const [replyDeletedFileId, setReplyDeletedFileId] = useState<string[]>([]);

  //댓글 입력 모드
  const [writeReplyMdoe, setWriteReplyMode] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  //답글 파일
  const handleReplyFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setReplyFiles(Array.from(e.target.files));
    }
  };

  const editorRef = useRef<ClassicEditorType | null>(null);

  function fileDownload(id: string) {
    fetchSupportDownload(id);
  }

  //문의 저장
  const handleSubmit = async () => {
    const formData = new FormData();

    formData.append('title', supportItem.title);

    if (isEditMode) {
      formData.append('id', id!);
      formData.append('memberId', detailItem.memberId);
      formData.append('cont', supportItem.cont);

      deletedFileId.forEach(id => {
        formData.append('deletedFiles', id);
      });

      files.forEach(file => {
        formData.append('files', file);
      });
    } else {
      formData.append('memberId', String(user?.id));
      formData.append('cont', supportItem.cont);
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
          url: '/bgm-agit/inquiry',
          body: formData,
          ignoreHttpError: true,
          onSuccess: () => {
            if (!isEditMode) {
              navigate(`/inquiry`);
              toast.success('게시글이 작성되었습니다.');
            } else {
              showConfirmModal({
                message: (
                  <>
                    게시글이 저장되었습니다. <br /> 목록으로 이동하시겠습니까?
                  </>
                ),
                onConfirm: () => {
                  navigate(`/inquiry`);
                },
              });
              fetchDetailSupport(id!);
            }
            setIsEditMode(false);
          },
        });
      },
    });
  };

  //삭제
  async function deleteData() {
    const deleteId = supportItem.id!.toString();

    showConfirmModal({
      message: '삭제하시겠습니까?',
      onConfirm: () => {
        remove({
          url: `/bgm-agit/inquiry/${deleteId}`,
          ignoreHttpError: true,
          onSuccess: () => {
            toast.success('게시글이 삭제되었습니다.');
            navigate(`/inquiry`);
          },
        });
      },
    });
  }

  function validation() {
    if (!supportItem.title) {
      toast.error('타이틀을 입력해주세요.');
      return false;
    } else if (!supportItem.cont) {
      toast.error('내용을 입력해주세요.');
      return false;
    }
    return true;
  }

  //댓글 저장
  const handleReplySubmit = async () => {
    const formData = new FormData();

    formData.append('title', supportReplyItem.title);
    formData.append('parentId', detailItem.id);

    if (isReplyEditMode) {
      formData.append('id', detailItem.reply.id);

      formData.append('cont', supportReplyItem.cont);

      replyDeletedFileId.forEach(id => {
        formData.append('deletedFiles', id);
      });

      replyFiles.forEach(file => {
        formData.append('files', file);
      });
    } else {
      formData.append('cont', supportReplyItem.cont);
      replyFiles.forEach(file => {
        formData.append('files', file);
      });
    }

    const requestFn = isReplyEditMode ? update : insert;

    showConfirmModal({
      message: '답글을 저장하시겠습니까?',
      onConfirm: () => {
        if (!validationReply()) return;

        requestFn({
          url: '/bgm-agit/inquiry',
          body: formData,
          ignoreHttpError: true,
          onSuccess: () => {
            if (!isReplyEditMode) {
              navigate(`/inquiry`);
              toast.success('답글이 작성되었습니다.');
            } else {
              showConfirmModal({
                message: (
                  <>
                    답글이 저장되었습니다. <br /> 목록으로 이동하시겠습니까?
                  </>
                ),
                onConfirm: () => {
                  navigate(`/inquiry`);
                },
              });
              fetchDetailSupport(id!);
            }
            setIsReplyEditMode(false);
            setWriteReplyMode(false);
          },
        });
      },
    });
  };

  function validationReply() {
    if (!supportReplyItem.title) {
      toast.error('타이틀을 입력해주세요.');
      return false;
    } else if (!supportReplyItem.cont) {
      toast.error('내용을 입력해주세요.');
      return false;
    }
    return true;
  }

  //댓글 삭제
  async function deleteReplyData() {
    const deleteId = detailItem?.reply.id;

    showConfirmModal({
      message: '답글을 삭제하시겠습니까?',
      onConfirm: () => {
        remove({
          url: `/bgm-agit/inquiry/${deleteId}`,
          ignoreHttpError: true,
          onSuccess: () => {
            toast.success('답글이 삭제되었습니다.');
            if (id) fetchDetailSupport(id);
          },
        });
      },
    });
  }

  useEffect(() => {
    if (id) {
      fetchDetailSupport(id);
    }
  }, []);

  useEffect(() => {
    if (detailItem) {
      setSupportItem({
        id: detailItem.id,
        title: detailItem.title,
        cont: detailItem.cont,
      });

      if (detailItem.reply) {
        setSupportReplyItem({
          id: detailItem.reply.id,
          title: detailItem.reply.title,
          cont: detailItem.reply.cont,
        });

        setReplyAttachedFiles(detailItem.reply.files ?? []);
      }

      setAttachedFiles(detailItem.files ?? []);
    }
  }, [detailItem, id]);

  //언마운트
  useEffect(() => {
    return () => {
      setDetailItem({
        reply: {
          answerStatus: '',
          cont: '',
          files: [],
          id: '',
          memberId: '',
          memberName: '',
          registDate: '',
          title: '',
        },
        cont: '',
        files: [],
        id: 0,
        memberId: '',
        title: '',
        registDate: '',
        memberName: '',
        answerStatus: '',
      });
    };
  }, []);

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
            {detailItem?.answerStatus === 'N' && (
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
                navigate(`/inquiry`);
              }}
              color="#988271"
            >
              목록
            </Button>
          </ButtonBox>
          <TitleBox>
            <div>
              <h3>{detailItem?.memberName}</h3>
              <span>{detailItem?.registDate} </span>
            </div>
            <h2>{detailItem?.title}</h2>
          </TitleBox>
          {detailItem?.files?.length > 0 && (
            <StyledFileUl>
              {detailItem.files.map((file, idx) => (
                <li key={idx}>
                  <a
                    onClick={() => {
                      fileDownload(file.uuid);
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
              __html: convertOembedToIframe(String(detailItem?.cont)),
            }}
          />
          <ReplyBox>
            <div className="reply-header-box">
              <h3>
                <FaCommentDots />
                {detailItem?.reply?.answerStatus === 'Y' ? '답변완료' : '답변대기'}
              </h3>
              {!writeReplyMdoe && !detailItem.reply && user?.roles.includes('ROLE_ADMIN') && (
                <Button
                  color="#F2EDEA"
                  onClick={() => {
                    setWriteReplyMode(true);
                  }}
                >
                  답변달기
                </Button>
              )}
            </div>
            {detailItem?.reply && !writeReplyMdoe && (
              <>
                {user?.roles.includes('ROLE_ADMIN') && (
                  <ButtonBox>
                    <>
                      <Button
                        onClick={() => {
                          setIsReplyEditMode(true);
                          setWriteReplyMode(true);
                        }}
                        color="#093A6E"
                      >
                        수정
                      </Button>
                      <Button color="#FF5E57" onClick={() => deleteReplyData()}>
                        삭제
                      </Button>
                    </>
                  </ButtonBox>
                )}
                <TitleBox>
                  <div>
                    <h3>
                      <BiSubdirectoryRight style={{ marginRight: '8px' }} />
                      관리자
                    </h3>
                    <span>{detailItem?.reply?.registDate} </span>
                  </div>
                  <h2>{detailItem?.reply?.title}</h2>
                </TitleBox>
                {detailItem?.reply?.files?.length > 0 && (
                  <StyledFileUl>
                    {detailItem.reply?.files.map((file, idx) => (
                      <li key={idx}>
                        <a
                          onClick={() => {
                            fileDownload(file.uuid);
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
                    __html: convertOembedToIframe(String(detailItem?.reply?.cont)),
                  }}
                />
              </>
            )}
            {writeReplyMdoe && (
              <>
                <ButtonBox>
                  <Button onClick={handleReplySubmit} color="#1A7D55">
                    저장
                  </Button>
                  <Button
                    onClick={() => {
                      if (isReplyEditMode) {
                        setIsReplyEditMode(false);
                        setReplyDeletedFileNames([]);
                        setReplyDeletedFileId([]);

                        setSupportReplyItem({
                          id: detailItem.reply.id,
                          title: detailItem.reply.title,
                          cont: detailItem.reply.cont,
                        });
                        setReplyAttachedFiles(detailItem.reply.files ?? []);
                      } else {
                        navigate('/inquiry');
                      }
                    }}
                    color="#988271"
                  >
                    취소
                  </Button>
                </ButtonBox>
                <EditorWrapper>
                  <InputBox
                    type="text"
                    placeholder="제목을 입력해주세요."
                    value={supportReplyItem.title}
                    onChange={e =>
                      setSupportReplyItem(prev => ({ ...prev, title: e.target.value }))
                    }
                  />
                  <StyledFileUl>
                    {replyAttachedFiles
                      .filter(file => !replyDeletedFileNames.includes(file.fileName))
                      .map((file, idx) => (
                        <li key={idx}>
                          <a
                            onClick={() => {
                              fileDownload(file.uuid);
                            }}
                          >
                            {file.fileName}
                            <FaDownload />
                          </a>
                          <FaTrash
                            onClick={() => {
                              setReplyDeletedFileId(prev => [...prev, file.id]);
                              setReplyDeletedFileNames(prev => [...prev, file.fileName]);
                            }}
                          />
                        </li>
                      ))}
                  </StyledFileUl>
                  <StyledFileInput type="file" multiple onChange={handleReplyFileChange} />
                  <EditorBox>
                    <CKEditor
                      editor={ClassicEditor}
                      data={supportReplyItem.cont}
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
                                  url: '/bgm-agit/inquiry/file',
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
                        setSupportReplyItem(prev => ({ ...prev, cont: data }));
                      }}
                    />
                  </EditorBox>
                </EditorWrapper>
              </>
            )}
          </ReplyBox>
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
                  setDeletedFileId([]);

                  setSupportItem({
                    id: detailItem.id,
                    title: detailItem.title,
                    cont: detailItem.cont,
                  });
                  setAttachedFiles(detailItem.files ?? []);
                } else {
                  navigate('/inquiry');
                }
              }}
              color="#988271"
            >
              취소
            </Button>
          </ButtonBox>
          <EditorWrapper>
            <InputBox
              type="text"
              placeholder="제목을 입력해주세요."
              value={supportItem.title}
              onChange={e => setSupportItem(prev => ({ ...prev, title: e.target.value }))}
            />
            <StyledFileUl>
              {attachedFiles
                .filter(file => !deletedFileNames.includes(file.fileName))
                .map((file, idx) => (
                  <li key={idx}>
                    <a
                      onClick={() => {
                        fileDownload(file.uuid);
                      }}
                    >
                      {file.fileName}
                      <FaDownload />
                    </a>
                    <FaTrash
                      onClick={() => {
                        setDeletedFileId(prev => [...prev, file.id]);
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
                data={supportItem.cont}
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
                            url: '/bgm-agit/inquiry/file',
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
                  setSupportItem(prev => ({ ...prev, cont: data }));
                }}
              />
            </EditorBox>
          </EditorWrapper>
        </>
      )}
      {isLoginModalOpen && <LoginMoadl onClose={() => setIsLoginModalOpen(false)} />}
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
      display: flex;
      align-items: center;
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

const ReplyBox = styled.div<WithTheme>`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 16px;

  .reply-header-box {
    display: flex;
    justify-content: space-between;
    padding-bottom: 16px;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
    font-family: 'Jua', sans-serif;

    h3 {
      display: flex;
      color: ${({ theme }) => theme.colors.bronzeColor};
      gap: 6px;
      align-items: center;

      span {
        font-size: ${({ theme }) => theme.sizes.medium};
        color: ${({ theme }) => theme.colors.bronzeColor};
      }
    }

    button {
      color: ${({ theme }) => theme.colors.bronzeColor};
      font-family: 'Jua', sans-serif;
    }
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
