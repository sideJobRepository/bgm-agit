import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useRecoilValue, useResetRecoilState } from 'recoil';
import styled, { keyframes } from 'styled-components';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import type { default as ClassicEditorType } from '@ckeditor/ckeditor5-build-classic';
import type { FileLoader } from '@ckeditor/ckeditor5-upload';
import type { Editor } from '@ckeditor/ckeditor5-core';
import {
  Chats,
  ArrowLeft,
  TrashSimple,
  FileText,
  Check,
  FilePlus,
  DownloadSimple,
  PencilSimpleLine,
} from 'phosphor-react';
import { toast } from 'react-toastify';
import { useDeletePost, useInsertPost, useUpdatePost } from '../recoil/fetch.ts';
import { useDetailReviewFetch } from '../recoil/reviewFetch.ts';
import { detailReviewState } from '../recoil/state/reviewState.ts';
import { userState } from '../recoil/state/userState.ts';
import { loadingState } from '../recoil/state/mainState.ts';
import { showConfirmModal } from '../components/confirmAlert.tsx';
import type { ReviewComment, ReviewFile } from '../types/review.ts';
import type { WithTheme } from '../styles/styled-props.ts';

type NewReviewState = {
  id: number | null;
  title: string;
  content: string;
};

type ExistingFile = {
  id: number;
  fileName: string;
  fileUrl: string;
  status: 'NORMAL' | 'DELETED';
  fileFolder: string;
};

export default function ReviewDetail() {
  const { id = 'new' } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { insert } = useInsertPost();
  const { update } = useUpdatePost();
  const { remove } = useDeletePost();

  const user = useRecoilValue(userState);
  const loading = useRecoilValue(loadingState);
  const detailReview = useRecoilValue(detailReviewState);
  const resetDetailReview = useResetRecoilState(detailReviewState);
  const fetchDetailReview = useDetailReviewFetch();

  const [isEditMode, setIsEditMode] = useState(false);
  const [newReview, setNewReview] = useState<NewReviewState>({
    id: null,
    title: '',
    content: '',
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [attachedFiles, setAttachedFiles] = useState<ExistingFile[]>([]);

  const [writeReplyMode, setWriteReplyMode] = useState(false);
  const [replyToId, setReplyToId] = useState<number | null>(null);
  const [editCommentId, setEditCommentId] = useState<number | null>(null);

  const [writeContent, setWriteContent] = useState('');
  const replyInputRef = useRef<HTMLTextAreaElement | null>(null);

  const editorRef = useRef<ClassicEditorType | null>(null);

  const isReady = !loading && detailReview;

  useEffect(() => {
    if (id === 'new') {
      resetDetailReview();
      setIsEditMode(false);
      setNewReview({ id: null, title: '', content: '' });
      setFiles([]);
      setAttachedFiles([]);
      return;
    }
    if (id) fetchDetailReview(id);
  }, [id]);

  useEffect(() => {
    if (id === 'new') return;
    if (!detailReview) return;

    setNewReview({
      id: detailReview.id,
      title: detailReview.title,
      content: detailReview.cont,
    });

    setAttachedFiles(
      (detailReview.files ?? []).map((file: ReviewFile) => ({
        id: file.id,
        fileName: file.fileName,
        fileUrl: file.fileUrl,
        status: 'NORMAL',
        fileFolder: file.fileFolder,
      }))
    );
  }, [id, detailReview]);

  const convertOembedToIframe = (html: string): string => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const oembeds = doc.querySelectorAll('oembed');

    oembeds.forEach(oembed => {
      const url = oembed.getAttribute('url') ?? '';
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
  };

  const extractYoutubeVideoId = (url: string): string => {
    try {
      const u = new URL(url);
      if (u.hostname === 'youtu.be') return u.pathname.substring(1);
      if (u.hostname.includes('youtube.com')) return u.searchParams.get('v') || '';
      return '';
    } catch {
      return '';
    }
  };

  const fileDownload = (file: ExistingFile) => {
    const sliceId = file.fileUrl.split('/').pop();
    if (!sliceId) return;
    const base = import.meta.env.VITE_API_BASE_URL ?? '';
    const downloadUrl = `${base}/bgm-agit/download/${file.fileFolder}/${sliceId}`;
    window.open(downloadUrl, '_blank');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selectedFiles = Array.from(e.target.files);
    setFiles(prev => [...prev, ...selectedFiles]);
    e.target.value = '';
  };

  const handleReplySubmit = (commentId: number | null, isInsert: boolean) => {
    const body = {
      cont: writeContent,
      reviewerId: detailReview?.id,
      memberId: user?.id,
      commentId,
    };

    const requestFn = isInsert ? insert : update;

    showConfirmModal({
      message: '댓글을 저장 하시겠습니까?',
      onConfirm: () => {
        requestFn({
          url: '/bgm-agit/review-comment',
          body,
          ignoreHttpError: true,
          onSuccess: () => {
            toast.success('댓글이 작성되었습니다.');
            setWriteReplyMode(false);
            setReplyToId(null);
            setWriteContent('');
            setEditCommentId(null);
            if (id && id !== 'new') fetchDetailReview(id);
          },
        });
      },
    });
  };

  const deleteReplyData = (deleteId: number) => {
    showConfirmModal({
      message: '댓글을 삭제 하시겠습니까?',
      onConfirm: () => {
        remove({
          url: `/bgm-agit/review-comment/${deleteId}`,
          ignoreHttpError: true,
          onSuccess: () => {
            toast.success('댓글이 삭제되었습니다.');
            if (id && id !== 'new') fetchDetailReview(id);
          },
        });
      },
    });
  };

  const handleSubmit = () => {
    const formData = new FormData();
    formData.append('title', newReview.title);
    formData.append('cont', newReview.content);
    if (user?.id) formData.append('memberId', String(user.id));

    if (isEditMode) {
      formData.append('id', id);
      attachedFiles
        .filter(file => file.status === 'DELETED')
        .forEach(file => formData.append('deletedFiles', String(file.id)));
    }

    files.forEach(file => formData.append('files', file));

    const requestFn = isEditMode ? update : insert;

    showConfirmModal({
      message: '저장 하시겠습니까?',
      onConfirm: () => {
        requestFn({
          url: '/bgm-agit/review',
          body: formData,
          ignoreHttpError: true,
          onSuccess: () => {
            if (!isEditMode) {
              navigate('/review');
              toast.success('후기가 작성되었습니다.');
              setFiles([]);
            } else {
              showConfirmModal({
                message: '후기가 수정되었습니다.\n목록으로 이동하시겠습니까?',
                onConfirm: () => navigate('/review'),
                onCancel: () => {
                  if (id && id !== 'new') fetchDetailReview(id);
                  setFiles([]);
                },
              });
            }
            setIsEditMode(false);
          },
        });
      },
    });
  };

  const deleteData = () => {
    const deleteId = newReview.id?.toString();
    if (!deleteId) return;

    showConfirmModal({
      message: '삭제 하시겠습니까?',
      onConfirm: () => {
        remove({
          url: `/bgm-agit/review/${deleteId}`,
          ignoreHttpError: true,
          onSuccess: () => {
            toast.success('후기가 삭제되었습니다.');
            navigate('/review');
          },
        });
      },
    });
  };

  const cancelClick = () => {
    showConfirmModal({
      message: '정말 이전으로 되돌아 가시겠습니까?',
      onConfirm: () => {
        if (isEditMode) {
          setIsEditMode(false);
          if (detailReview) {
            setNewReview({
              id: detailReview.id,
              title: detailReview.title,
              content: detailReview.cont,
            });
          }
        } else {
          navigate('/review');
        }
      },
    });
  };

  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleDeleteExistingFile = (fileId: number) => {
    setAttachedFiles(prev =>
      prev.map(file => (file.id === fileId ? { ...file, status: 'DELETED' } : file))
    );
  };

  return (
    <Wrapper>
      {id !== 'new' && !isEditMode ? (
        !isReady ? (
          <>
            <TitleBox>
              <div>
                <SkeletonBox style={{ width: '100px', height: '20px' }} />
                <SkeletonBox style={{ width: '60px', height: '20px' }} />
              </div>
              <h3>
                <SkeletonBox style={{ width: '50%', height: '28px' }} />
              </h3>
            </TitleBox>

            <StyledFileUl>
              {[...Array(2)].map((_, i) => (
                <li key={i}>
                  <SkeletonBox style={{ width: '200px', height: '20px' }} />
                </li>
              ))}
            </StyledFileUl>

            <ContentBox>
              <SkeletonBox style={{ width: '100%', height: '300px' }} />
            </ContentBox>
          </>
        ) : (
          <>
            {detailReview?.isAuthor && (
              <ButtonBox>
                <Button onClick={() => setIsEditMode(true)} color="#415B9C">
                  <FileText weight="bold" />
                </Button>
                <Button onClick={deleteData} color="#D9625E">
                  <TrashSimple weight="bold" />
                </Button>
              </ButtonBox>
            )}
            <TitleBox>
              <div>
                <span>
                  {detailReview?.registDate}
                  <strong>{detailReview?.nickName}</strong>
                </span>
                <a
                  onClick={() => {
                    navigate('/review');
                  }}
                >
                  <ArrowLeft weight="bold" />
                  돌아가기
                </a>
              </div>
              <h3>{detailReview?.title}</h3>
            </TitleBox>
            {attachedFiles.length > 0 && (
              <StyledFileUl>
                {attachedFiles.map((file, idx) => (
                  <li key={idx}>
                    <a
                      onClick={() => {
                        fileDownload(file);
                      }}
                    >
                      {file.fileName}
                      <FileSvgBox $color="#6DAE81">
                        <DownloadSimple weight="bold" />
                      </FileSvgBox>
                    </a>
                  </li>
                ))}
              </StyledFileUl>
            )}
            <ContentBox
              className="ck-content"
              dangerouslySetInnerHTML={{
                __html: convertOembedToIframe(String(detailReview?.cont ?? '')),
              }}
            />
            <ReplyBox>
              <div className="reply-header-box">
                <h4>
                  <Chats weight="bold" /> 댓글 <span>{detailReview?.comments?.length}</span>
                </h4>
                {user?.roles?.includes('ROLE_ADMIN') && !writeReplyMode && (
                  <Button
                    color="#4A90E2"
                    onClick={() => {
                      setWriteReplyMode(true);
                      setReplyToId(null);
                      setEditCommentId(null);
                    }}
                  >
                    <PencilSimpleLine weight="bold" />
                  </Button>
                )}
              </div>
              {writeReplyMode && (
                <div className="textarea-box">
                  <div className="reply-button-box">
                    <Button color="#4A90E2" onClick={() => handleReplySubmit(null, true)}>
                      <Check weight="bold" />
                    </Button>
                    <Button
                      onClick={() => {
                        setWriteReplyMode(false);
                        setWriteContent('');
                      }}
                      color="#D9625E"
                    >
                      <ArrowLeft weight="bold" />
                    </Button>
                  </div>
                  <TextArea
                    value={writeContent}
                    onChange={e => setWriteContent(e.target.value)}
                    placeholder="댓글을 입력해주세요."
                  />
                </div>
              )}
              {detailReview?.comments?.map((item: ReviewComment) => (
                <div className="reply-box" key={item.commentId}>
                  <div className="reply-top">
                    <span>
                      <strong>{item.nickname}</strong> {item.registDate}
                      {(item.isAuthor || user?.roles?.includes('ROLE_ADMIN')) &&
                        item.delStatus === 'N' && (
                          <div className="reply-button-box">
                            {editCommentId === item.commentId ? (
                              <>
                                <Button
                                  color="#4A90E2"
                                  onClick={() => handleReplySubmit(item.commentId, false)}
                                >
                                  <Check weight="bold" />
                                </Button>
                                <Button
                                  color="#D9625E"
                                  onClick={() => {
                                    setEditCommentId(null);
                                    setWriteContent('');
                                  }}
                                >
                                  <ArrowLeft weight="bold" />
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button
                                  color="#415B9C"
                                  onClick={() => {
                                    setEditCommentId(item.commentId);
                                    setWriteContent(item.cont);
                                    setWriteReplyMode(false);
                                    setReplyToId(null);
                                  }}
                                >
                                  <FileText weight="bold" />
                                </Button>
                                <Button
                                  color="#D9625E"
                                  onClick={() => deleteReplyData(item.commentId)}
                                >
                                  <TrashSimple weight="bold" />
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
                          value={writeContent}
                          onChange={e => setWriteContent(e.target.value)}
                          placeholder="댓글을 수정해주세요."
                        />
                      </div>
                    ) : (
                      <div className="reply-center">{item.cont}</div>
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
                        value={writeContent}
                        onChange={e => setWriteContent(e.target.value)}
                        placeholder="답글을 입력해주세요."
                      />
                    </div>
                  )}
                </div>
              ))}
            </ReplyBox>
          </>
        )
      ) : (
        <>
          <ButtonBox>
            <Button onClick={handleSubmit} color="#4A90E2">
              <Check weight="bold" />
            </Button>
            <Button onClick={() => cancelClick()} color="#D9625E">
              <ArrowLeft weight="bold" />
            </Button>
          </ButtonBox>
          <EditorWrapper>
            <InputBox
              type="text"
              placeholder="제목을 입력해주세요."
              value={newReview.title}
              onChange={e => setNewReview(prev => ({ ...prev, title: e.target.value }))}
            />
            <FileButtonBox>
              <Button type="button" color="#415B9C" onClick={() => fileInputRef.current?.click()}>
                <FilePlus weight="bold" />
              </Button>
            </FileButtonBox>
            <StyledFileUl>
              {attachedFiles
                .filter(file => file.status !== 'DELETED')
                .map((file, idx) => (
                  <li key={idx}>
                    <a>
                      {file.fileName}
                      <FileSvgBox $color="#D9625E">
                        <TrashSimple
                          weight="bold"
                          onClick={() => handleDeleteExistingFile(file.id)}
                        />
                      </FileSvgBox>
                      <FileSvgBox $color="#6DAE81">
                        <DownloadSimple weight="bold" onClick={() => fileDownload(file)} />
                      </FileSvgBox>
                    </a>
                  </li>
                ))}

              {files.map((file, idx) => (
                <li key={`${file.name}-${idx}`}>
                  {file.name}
                  <FileSvgBox $color="#D9625E">
                    <TrashSimple onClick={() => handleRemoveFile(idx)} weight="bold" />
                  </FileSvgBox>
                </li>
              ))}
            </StyledFileUl>
            <input ref={fileInputRef} type="file" multiple hidden onChange={handleFileChange} />
            <EditorBox>
              <CKEditor
                editor={ClassicEditor}
                data={newReview.content}
                config={{ mediaEmbed: { previewsInData: true } }}
                onReady={(editor: Editor) => {
                  editorRef.current = editor as ClassicEditorType;
                  editor.plugins.get('FileRepository').createUploadAdapter = (
                    loader: FileLoader
                  ) => ({
                    upload: async () => {
                      const file = await loader.file;
                      if (!file) return { default: '' };

                      const formData = new FormData();
                      formData.append('file', file);

                      return new Promise(resolve => {
                        insert<FormData>({
                          url: '/bgm-agit/ckEditor/file/kml-notice',
                          body: formData,
                          ignoreHttpError: true,
                          onSuccess: (data: unknown) => resolve({ default: data as string }),
                        });
                      });
                    },
                    abort: () => {},
                  });
                }}
                onChange={(_, editor) => {
                  const content = editor.getData();
                  setNewReview(prev => ({ ...prev, content }));
                }}
              />
            </EditorBox>
          </EditorWrapper>
        </>
      )}
    </Wrapper>
  );
}

const Wrapper = styled.div<WithTheme>`
  max-width: 1500px;
  min-width: 1280px;
  min-height: 600px;
  height: 100%;
  margin: auto;
  padding: 24px 8px;

  @media ${({ theme }) => theme.device.mobile} {
    max-width: 100%;
    min-width: 100%;
    min-height: unset;
  }
`;

const EditorWrapper = styled.div`
  display: flex;
  margin-top: 12px;
  flex-direction: column;
  height: calc(100vh - 160px);
  box-sizing: border-box;
  padding-bottom: 40px;
`;

const InputBox = styled.input<WithTheme>`
  height: 40px;
  width: 100%;
  margin-bottom: 10px;
  padding: 0 8px;
  color: ${({ theme }) => theme.colors.inputColor};
  border: 1px solid #c4c4c4;
  border-radius: 4px;
  box-shadow: none;
  font-size: ${({ theme }) => theme.desktop.sizes.h4Size};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.inputColor};
  }

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${({ theme }) => theme.mobile.sizes.h4Size};
  }
`;

const EditorBox = styled.section<WithTheme>`
  flex: 1;
  min-height: 0;

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
    border-color: ${({ theme }) => theme.colors.inputColor} !important;
    box-shadow: none !important;
  }
`;

const ButtonBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  flex: 1;
  margin-bottom: 16px;
`;

const FileButtonBox = styled.div<WithTheme>`
  display: flex;
  justify-content: end;
  padding-top: 8px;
  border-top: 1px solid ${({ theme }) => theme.colors.lineColor};
`;

const Button = styled.button<WithTheme & { color: string }>`
  display: flex;
  align-items: center;
  padding: 8px;
  background-color: ${({ color }) => color};
  color: ${({ theme }) => theme.colors.white};
  font-size: ${({ theme }) => theme.desktop.sizes.md};
  border: none;
  border-radius: 999px;
  cursor: pointer;
  white-space: nowrap;
  box-shadow: 2px 4px 2px rgba(0, 0, 0, 0.2);

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${({ theme }) => theme.mobile.sizes.md};
  }

  svg {
    width: 16px;
    height: 16px;
  }

  &:hover {
    opacity: 0.8;
  }
`;

const TitleBox = styled.div<WithTheme>`
  display: flex;
  position: relative;
  flex-direction: column;
  width: 100%;
  border-bottom: 1px solid ${({ theme }) => theme.colors.lineColor};

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: ${({ theme }) => theme.colors.lineColor};
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 32px;
    height: 2px;
    background: ${({ theme }) => theme.colors.blackColor};
  }

  > div {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 12px 8px;
    width: 100%;
    background-color: ${({ theme }) => theme.colors.softColor};

    span {
      color: ${({ theme }) => theme.colors.grayColor};
      font-size: ${({ theme }) => theme.desktop.sizes.xl};
      font-weight: 600;

      @media ${({ theme }) => theme.device.mobile} {
        font-size: ${({ theme }) => theme.mobile.sizes.xl};
      }

      strong {
        margin-left: 8px;
      }
    }

    a {
      display: flex;
      position: relative;
      align-items: center;
      justify-content: flex-end;
      gap: 4px;
      font-weight: 500;
      margin-left: 8px;
      color: ${({ theme }) => theme.colors.grayColor};
      font-size: ${({ theme }) => theme.desktop.sizes.sm};
      cursor: pointer;

      svg {
        width: 12px;
        height: 12px;
      }
    }
  }

  h3 {
    display: flex;
    height: 100%;
    align-items: center;
    padding: 20px 10px;
    color: ${({ theme }) => theme.colors.inputColor};
    font-size: ${({ theme }) => theme.desktop.sizes.h3Size};
    font-weight: 600;
    white-space: normal;
    word-break: break-word;
    overflow-wrap: anywhere;

    @media ${({ theme }) => theme.device.mobile} {
      font-size: ${({ theme }) => theme.mobile.sizes.h3Size};
    }
  }
`;

const ContentBox = styled.div<WithTheme>`
  height: 100%;
  width: 100%;
  min-height: calc(100vh - 300px);
  padding: 20px 10px;
  border-bottom: 2px solid ${({ theme }) => theme.colors.lineColor};
  margin-bottom: 20px;

  iframe {
    width: 100%;
    height: auto;
    aspect-ratio: 16 / 9;
    max-width: 100%;
    border: none;
    display: block;
  }

  figure.media {
    margin: 20px 0;
    max-height: unset;
    overflow: visible;
  }

  img {
    max-width: 100%;
    height: auto;
    display: block;
  }
`;

const FileSvgBox = styled.div<{ $color: string }>`
  display: flex;
  background-color: ${({ $color }) => $color};
  padding: 2px;
  border-radius: 999px;
  align-items: center;

  svg {
    width: 10px;
    height: 10px;
    cursor: pointer;
    color: white;

    &:hover {
      opacity: 0.6;
    }
  }
`;

const StyledFileUl = styled.ul<WithTheme>`
  display: flex;
  flex-direction: column;
  width: 100%;
  color: ${({ theme }) => theme.colors.inputColor};
  padding-bottom: 8px;
  margin-bottom: 8px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.lineColor};

  li {
    display: flex;
    justify-content: end;
    margin-top: 8px;
    gap: 8px;
    font-size: ${({ theme }) => theme.desktop.sizes.sm};

    a {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 8px;
      background-color: ${({ theme }) => theme.colors.border};
      border-radius: 4px;
      cursor: pointer;
    }
  }
`;

const shimmer = keyframes`
  0% { background-position: -100% 0; }
  100% { background-position: 100% 0; }
`;

const SkeletonBox = styled.div`
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s infinite;
  border-radius: 4px;
`;

const ReplyBox = styled.div<WithTheme>`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 16px;
  padding: 10px;

  svg {
    width: 12px;
    height: 12px;
  }

  .textarea-box {
    display: flex;
    padding: 10px 0;
    flex-direction: column;
    gap: 12px;
    justify-content: right;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  }

  .reply-button-box {
    display: flex;
    margin-top: 6px;
    gap: 4px;
    justify-content: right;
  }

  .reply-header-box {
    display: flex;
    justify-content: space-between;
    padding-bottom: 16px;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
    font-family: 'Jua', sans-serif;

    h4 {
      display: flex;
      font-size: ${({ theme }) => theme.desktop.sizes.h4Size};
      color: ${({ theme }) => theme.colors.inputColor};
      gap: 6px;
      align-items: center;

      @media ${({ theme }) => theme.device.mobile} {
        font-size: ${({ theme }) => theme.mobile.sizes.h4Size};
      }

      span {
        font-size: ${({ theme }) => theme.desktop.sizes.xl};
        color: ${({ theme }) => theme.colors.inputColor};

        @media ${({ theme }) => theme.device.mobile} {
          font-size: ${({ theme }) => theme.mobile.sizes.xl};
        }
      }
    }
  }

  .reply-box {
    display: flex;
    flex-direction: column;
    padding-bottom: 10px;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  }

  .reply-top {
    font-size: ${({ theme }) => theme.desktop.sizes.md};
    color: ${({ theme }) => theme.colors.navColor};
    margin-bottom: 12px;

    @media ${({ theme }) => theme.device.mobile} {
      font-size: ${({ theme }) => theme.mobile.sizes.md};
    }

    strong {
      font-family: 'Jua', sans-serif;
      color: ${({ theme }) => theme.colors.text};
      font-size: ${({ theme }) => theme.desktop.sizes.xl};
      margin-right: 8px;

      @media ${({ theme }) => theme.device.mobile} {
        font-size: ${({ theme }) => theme.mobile.sizes.xl};
      }
    }
  }

  .reply-center {
    color: ${({ theme }) => theme.colors.subColor};
    font-size: ${({ theme }) => theme.desktop.sizes.xl};

    @media ${({ theme }) => theme.device.mobile} {
      font-size: ${({ theme }) => theme.mobile.sizes.xl};
    }
  }
`;

const TextArea = styled.textarea<WithTheme>`
  width: 100%;
  padding: 8px;
  resize: none;
  font-size: ${({ theme }) => theme.desktop.sizes.sm};
  color: ${({ theme }) => theme.colors.inputColor};
  border: 1px solid ${({ theme }) => theme.colors.grayColor};
  border-radius: 6px;
  margin-bottom: 20px;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.inputColor};
  }
`;
