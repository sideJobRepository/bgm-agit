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
import { showConfirmModal } from '../components/confirmAlert.tsx';
import { toast } from '../utils/toast';
import { useSearchParams } from 'react-router-dom';
import { FaCommentDots, FaTrash } from 'react-icons/fa';
import { userState } from '../recoil/state/userState.ts';
import { FaDownload } from 'react-icons/fa';
import LoginMoadl from '../components/LoginMoadl.tsx';
import { useDetailSupportFetch, useSupportDownloadFetch } from '../recoil/supportFetch.ts';
import { detailSupportState } from '../recoil/state/supportState.ts';
import type { SupportFile } from '../types/support.ts';
import { theme } from '../styles/theme.ts';
import { EditorWrapper, InputBox, EditorBox, ButtonBox, Button, TitleBox, ContentBox, ReplyBox, StyledFileUl, StyledFileInput } from './InquiryDetail.styles.ts';

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
              color={theme.colors.primary}
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
                    color={theme.colors.primary}
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
              color={theme.colors.primary}
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
