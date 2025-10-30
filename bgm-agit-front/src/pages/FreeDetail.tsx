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
import { useCommunityDownloadFetch, useDetailCommunityFetch } from '../recoil/communityFetch.ts';
import { detailCommunityState } from '../recoil/state/community.ts';
import type { CommunityFile } from '../types/community.ts';
import LoginMoadl from '../components/LoginMoadl.tsx';

type NewCommunityState = {
  id: number | null;
  title: string;
  content: string;
};

export default function FreeDetail() {
  const user = useRecoilValue(userState);

  //로그인 모달
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  //디테일 조회
  const fetchDetailCommunity = useDetailCommunityFetch();
  const detailItem = useRecoilValue(detailCommunityState);
  const setDetailItem = useSetRecoilState(detailCommunityState);
  console.log('-detailItem', detailItem);

  const fetchCommunityDownload = useCommunityDownloadFetch();

  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');

  const { insert } = useInsertPost();
  const { update } = useUpdatePost();
  const { remove } = useDeletePost();

  const navigate = useNavigate();

  const [isEditMode, setIsEditMode] = useState(false);

  const [community, setNewCommunity] = useState<NewCommunityState>({
    id: null,
    title: '',
    content: '',
  });

  const [files, setFiles] = useState<File[]>([]);
  const [attachedFiles, setAttachedFiles] = useState<CommunityFile[]>([]);

  const [deletedFileNames, setDeletedFileNames] = useState<string[]>([]);
  const [deletedFileId, setDeletedFileId] = useState<string[]>([]);

  //댓글 입력 모드
  const [writeReplyMdoe, setWriteReplyMode] = useState(false);
  const [writeConent, setWriteConent] = useState('');

  // 수정 대상 commentId
  const [editCommentId, setEditCommentId] = useState<number | null>(null);

  // 답글 입력 상태
  const [replyToId, setReplyToId] = useState<number | null>(null);
  const replyInputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (replyToId && replyInputRef.current) {
      replyInputRef.current.focus(); // 답글창 생길 때 자동 포커스
    }
  }, [replyToId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const editorRef = useRef<ClassicEditorType | null>(null);

  function fileDownload(id: string) {
    console.log(id);

    fetchCommunityDownload(id);
  }

  //커뮤니티 저장
  const handleSubmit = async () => {
    const formData = new FormData();

    formData.append('title', community.title);

    if (isEditMode) {
      formData.append('id', id!);
      formData.append('memberId', detailItem.memberId);
      formData.append('content', community.content);

      deletedFileId.forEach(id => {
        formData.append('deletedFiles', id);
      });

      files.forEach(file => {
        formData.append('files', file);
      });
    } else {
      formData.append('memberId', String(user?.id));
      formData.append('cont', community.content);
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
          url: '/bgm-agit/free',
          body: formData,
          ignoreHttpError: true,
          onSuccess: () => {
            if (!isEditMode) {
              navigate(`/free`);
              toast.success('게시글이 작성되었습니다.');
            } else {
              showConfirmModal({
                message: (
                  <>
                    게시글이 저장되었습니다. <br /> 목록으로 이동하시겠습니까?
                  </>
                ),
                onConfirm: () => {
                  navigate(`/free`);
                },
              });
              fetchDetailCommunity(id!);
            }
            setIsEditMode(false);
          },
        });
      },
    });
  };

  //삭제
  async function deleteData() {
    const deleteId = community.id!.toString();

    showConfirmModal({
      message: '삭제하시겠습니까?',
      onConfirm: () => {
        remove({
          url: `/bgm-agit/free/${deleteId}`,
          ignoreHttpError: true,
          onSuccess: () => {
            toast.success('게시글이 삭제되었습니다.');
            navigate(`/free`);
          },
        });
      },
    });
  }

  function validation() {
    if (!community.title) {
      toast.error('타이틀을 입력해주세요.');
      return false;
    } else if (!community.content) {
      toast.error('내용을 입력해주세요.');
      return false;
    }
    return true;
  }

  //댓글 저장
  const handleReplySubmit = async (commentId: number | null, mode: boolean) => {
    //로그인 체크
    if (!user) {
      showConfirmModal({
        message: (
          <>
            로그인 후 이용 가능합니다. <br /> 로그인 하시겠습니까?
          </>
        ),
        onConfirm: () => {
          setIsLoginModalOpen(true);
        },
      });
      return;
    }
    let requestFn = insert;
    const param = {
      content: writeConent,
      freeId: detailItem.id,
      parentId: commentId,
      commentId: commentId,
    };

    if (!mode) {
      requestFn = update;
    }

    showConfirmModal({
      message: '저장하시겠습니까?',
      onConfirm: () => {
        requestFn({
          url: '/bgm-agit/comment',
          body: param,
          ignoreHttpError: true,
          onSuccess: () => {
            toast.success('댓글이 작성되었습니다.');
            setWriteReplyMode(false);
            setReplyToId(null);
            setWriteConent('');
            setEditCommentId(null);
            if (id) fetchDetailCommunity(id);
          },
        });
      },
    });
  };

  //댓글 삭제
  async function deleteReplyData(deleteId: number) {
    showConfirmModal({
      message: '삭제하시겠습니까?',
      onConfirm: () => {
        remove({
          url: `/bgm-agit/comment/${deleteId}`,
          ignoreHttpError: true,
          onSuccess: () => {
            toast.success('댓글이 삭제되었습니다.');
            if (id) fetchDetailCommunity(id);
          },
        });
      },
    });
  }

  useEffect(() => {
    if (id) {
      fetchDetailCommunity(id);
    }
  }, []);

  useEffect(() => {
    if (detailItem) {
      setNewCommunity({
        id: detailItem.id,
        title: detailItem.title,
        content: detailItem.content,
      });
      setAttachedFiles(detailItem.files ?? []);
    }
  }, [detailItem, id]);

  //언마운트
  useEffect(() => {
    return () => {
      setDetailItem({
        comments: [],
        content: '',
        files: [],
        id: 0,
        isAuthor: false,
        memberId: '',
        title: '',
        registDate: '',
        memberName: '',
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
            {(detailItem?.isAuthor || user?.roles.includes('ROLE_ADMIN')) && (
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
                navigate(`/free`);
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
                      fileDownload(file.uuidName);
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
              __html: convertOembedToIframe(String(detailItem?.content)),
            }}
          />
          <ReplyBox>
            <div className="reply-header-box">
              <h3>
                <FaCommentDots /> 댓글 <span>{detailItem?.comments?.length}</span>
              </h3>
              {!writeReplyMdoe && (
                <Button
                  color="#F2EDEA"
                  onClick={() => {
                    setWriteReplyMode(true);
                    setReplyToId(null);
                    setEditCommentId(null);
                  }}
                >
                  댓글달기
                </Button>
              )}
            </div>
            {writeReplyMdoe && (
              <div className="textarea-box">
                <div className="reply-button-box">
                  <Button color="#1A7D55" onClick={() => handleReplySubmit(null, true)}>
                    저장
                  </Button>
                  <Button
                    onClick={() => {
                      setWriteReplyMode(false);
                    }}
                    color="#FF5E57"
                  >
                    취소
                  </Button>
                </div>
                <TextArea
                  value={writeConent}
                  onChange={e => setWriteConent(e.target.value)}
                  placeholder="댓글을 입력해주세요."
                />
              </div>
            )}
            {detailItem?.comments?.map(item => (
              <div className="reply-box" key={item.commentId}>
                <div className="reply-top">
                  <span>
                    <strong>{item.memberName}</strong> {item.registDate}
                    {(item.isAuthor || user?.roles.includes('ROLE_ADMIN')) &&
                      item.delStatus === 'N' && (
                        <div className="reply-button-box">
                          {editCommentId === item.commentId ? (
                            <>
                              <Button
                                color="#1A7D55"
                                onClick={() => handleReplySubmit(item.commentId, false)}
                              >
                                저장
                              </Button>
                              <Button
                                color="#FF5E57"
                                onClick={() => {
                                  setEditCommentId(null);
                                  setWriteConent('');
                                }}
                              >
                                취소
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                color="#093A6E"
                                onClick={() => {
                                  setEditCommentId(item.commentId);
                                  setWriteConent(item.content);
                                  setWriteReplyMode(false);
                                  setReplyToId(null);
                                }}
                              >
                                수정
                              </Button>
                              <Button
                                color="#FF5E57"
                                onClick={() => deleteReplyData(item.commentId)}
                              >
                                삭제
                              </Button>
                            </>
                          )}
                        </div>
                      )}
                  </span>
                </div>
                <div className="reply-center">
                  {editCommentId === item.commentId ? (
                    <div className="textarea-box">
                      <TextArea
                        value={writeConent}
                        onChange={e => setWriteConent(e.target.value)}
                        placeholder="댓글을 수정해주세요."
                      />
                    </div>
                  ) : (
                    <div className="reply-center">{item.content}</div>
                  )}
                  {item.delStatus === 'N' && (
                    <div className="reply-button-box">
                      <Button
                        color="#F2EDEA"
                        onClick={() => {
                          setReplyToId(item.commentId);
                          setWriteReplyMode(false);
                          setEditCommentId(null);
                          setWriteConent('');
                        }}
                      >
                        답글
                      </Button>
                    </div>
                  )}
                </div>
                {replyToId === item.commentId && (
                  <div className="textarea-box">
                    <div className="reply-button-box">
                      <Button
                        color="#1A7D55"
                        onClick={() => handleReplySubmit(item.commentId, true)}
                      >
                        저장
                      </Button>
                      <Button color="#FF5E57" onClick={() => setReplyToId(null)}>
                        취소
                      </Button>
                    </div>
                    <TextArea
                      ref={replyInputRef}
                      value={writeConent}
                      onChange={e => setWriteConent(e.target.value)}
                      placeholder="답글을 입력해주세요."
                    />
                  </div>
                )}
                {item?.children?.map(item => (
                  <div className="reply-children-box" key={item.commentId}>
                    <BiSubdirectoryRight />
                    <div>
                      <div className="reply-top">
                        <span>
                          <strong>{item.memberName}</strong> {item.registDate}
                          {(item.isAuthor || user?.roles.includes('ROLE_ADMIN')) &&
                            item.delStatus === 'N' && (
                              <div className="reply-button-box">
                                {editCommentId === item.commentId ? (
                                  <>
                                    <Button
                                      color="#1A7D55"
                                      onClick={() => handleReplySubmit(item.commentId, false)}
                                    >
                                      저장
                                    </Button>
                                    <Button
                                      color="#FF5E57"
                                      onClick={() => {
                                        setEditCommentId(null);
                                        setWriteConent('');
                                      }}
                                    >
                                      취소
                                    </Button>
                                  </>
                                ) : (
                                  <>
                                    <Button
                                      color="#093A6E"
                                      onClick={() => {
                                        setEditCommentId(item.commentId);
                                        setWriteConent(item.content);
                                        setWriteReplyMode(false);
                                        setReplyToId(null);
                                      }}
                                    >
                                      수정
                                    </Button>
                                    <Button
                                      color="#FF5E57"
                                      onClick={() => deleteReplyData(item.commentId)}
                                    >
                                      삭제
                                    </Button>
                                  </>
                                )}
                              </div>
                            )}
                        </span>
                      </div>
                      {editCommentId === item.commentId ? (
                        <div className="textarea-box">
                          <TextArea
                            value={writeConent}
                            onChange={e => setWriteConent(e.target.value)}
                            placeholder="댓글을 수정해주세요."
                          />
                        </div>
                      ) : (
                        <div className="reply-center">{item.content}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ))}
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

                  setNewCommunity({
                    id: detailItem.id,
                    title: detailItem.title,
                    content: detailItem.content,
                  });
                  setAttachedFiles(detailItem.files ?? []);
                } else {
                  navigate('/free');
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
              value={community.title}
              onChange={e => setNewCommunity(prev => ({ ...prev, title: e.target.value }))}
            />
            <StyledFileUl>
              {attachedFiles
                .filter(file => !deletedFileNames.includes(file.fileName))
                .map((file, idx) => (
                  <li key={idx}>
                    <a
                      onClick={() => {
                        fileDownload(file.fileUrl);
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
                data={community.content}
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
                            url: '/bgm-agit/free/file',
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
                  setNewCommunity(prev => ({ ...prev, content: data }));
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
  padding: 10px;

  .textarea-box {
    display: flex;
    padding: 10px 0;
    flex-direction: column;
    gap: 4px;
    justify-content: right;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};

    .reply-button-box {
      justify-content: right;
    }
  }

  .reply-button-box {
    display: flex;
    margin-top: 6px;
    gap: 4px;

    button {
      font-family: 'Jua', sans-serif;
      font-size: ${({ theme }) => theme.sizes.xsmall};
      padding: 4px 6px;
    }
  }

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

  .reply-box {
    display: flex;
    flex-direction: column;
    padding-bottom: 10px;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  }

  .reply-children-box {
    display: flex;
    gap: 6px;
    margin-top: 8px;
  }

  .reply-top {
    font-size: ${({ theme }) => theme.sizes.xsmall};
    color: ${({ theme }) => theme.colors.navColor};
    margin-bottom: 12px;

    strong {
      font-family: 'Jua', sans-serif;
      color: ${({ theme }) => theme.colors.text};
      font-size: ${({ theme }) => theme.sizes.medium};
      margin-right: 8px;
    }
  }
  .reply-center {
    color: ${({ theme }) => theme.colors.subColor};
    font-size: ${({ theme }) => theme.sizes.small};

    button {
      color: ${({ theme }) => theme.colors.bronzeColor};
    }
  }
`;

const TextArea = styled.textarea<WithTheme>`
  width: 100%;
  padding: 8px;
  resize: none;
  font-size: ${({ theme }) => theme.sizes.small};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 6px;
  margin-bottom: 20px;
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.noticeColor};
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
