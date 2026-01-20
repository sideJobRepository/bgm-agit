'use client';

import { useUserStore } from '@/store/user';
import { useFetchNoticeDetailL, useNoticeDownloadFetch } from '@/services/notice.service';
import { use, useEffect, useRef, useState } from 'react';
import { NoticeFiles, useNoticeDetailStore } from '@/store/notice';
import dynamic from 'next/dynamic';
import styled, {keyframes} from 'styled-components';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, TrashSimple, FileText, Check, FilePlus, DownloadSimple   } from 'phosphor-react';
import { useDeletePost, useInsertPost, useUpdatePost } from '@/services/main.service';
import { alertDialog, confirmDialog } from '@/utils/alert';
import { useLoadingStore } from '@/store/loading';

const NoticeEditor = dynamic(() => import('../../components/NoticeEditor'), {
  ssr: false,
});

type NewNoticeState = {
  id: number | null;
  title: string;
  content: string;
};

type ExistingFile = {
  id: number;        // 서버 파일 ID
  fileName: string;
  fileUrl: string;
  status: 'NORMAL' | 'DELETED';
  fileFolder: string;
};


export default function NoticeDetail({
                                       params,
                                     }: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const { insert } = useInsertPost();
  const { update } = useUpdatePost();
  const { remove } = useDeletePost();

  const user = useUserStore((state) => state.user);
  const fetchDetailNotice = useFetchNoticeDetailL();
  const detailNotice = useNoticeDetailStore((state) => state.noticeDetail);
  const clearDetail = useNoticeDetailStore((state) => state.clearDetail);
  const fetchFileDownload =useNoticeDownloadFetch();

  const [isEditMode, setIsEditMode] = useState(false);
  const [newNotice, setNewNotice] = useState<NewNoticeState>({
    id: null,
    title: '',
    content: '',
  });

  //파일
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [files, setFiles] = useState<File[]>([]);
  const [attachedFiles, setAttachedFiles] = useState<ExistingFile[]>([]);

  function fileDownload(file : NoticeFiles) {

    fetchFileDownload(file);
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const selectedFiles = Array.from(e.target.files);

    setFiles(prev => [...prev, ...selectedFiles]);

    // 같은 파일 다시 선택 가능하게 초기화
    e.target.value = '';
  };


  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append('title', newNotice.title);
    formData.append('cont', newNotice.content);

    if (isEditMode) {
      formData.append('id', id);

      attachedFiles
        .filter(file => file.status === 'DELETED')
        .forEach(file => {
          formData.append('deleteFileIds', String(file.id));
        });

    }

    files.forEach((file) => {
      formData.append('files', file);
    });

    const requestFn = isEditMode ? update : insert;
    const result = await confirmDialog('저장 하시겠습니까?', 'warning');

    if (result.isConfirmed) {
      requestFn({
        url: '/bgm-agit/kml-notice',
        body: formData,
        ignoreErrorRedirect: true,
        onSuccess: async () => {
          if (!isEditMode) {
            router.push(`/notice`);
            await alertDialog('공지사항이 작성되었습니다.', 'success');
            setFiles([]);
          } else {
            const result = await confirmDialog(
              '공지사항이 수정되었습니다.\n목록으로 이동하시겠습니까?',
              'success'
            );
            if (result.isConfirmed) {
              router.push(`/notice`)
            }else {
              fetchDetailNotice(id)
              setFiles([]);
            }
          }
          setIsEditMode(false);
        },
      });
    }
  };

  const deleteData = async () => {
    const deleteId = newNotice.id!.toString();
    const result = await confirmDialog('삭제 하시겠습니까?', 'warning');

    if (result.isConfirmed) {
      remove({
        url: `/bgm-agit/kml-notice/${deleteId}`,
        ignoreErrorRedirect: true,
        onSuccess: async () => {
          await alertDialog('공지사항이 삭제되었습니다.', 'success');
          router.push(`/notice`);
        },
      });
    }
  };

  const cancleClick = async () => {

    const result = await confirmDialog('정말 이전으로 되돌아 가시겠습니까?', 'warning');

    if (result.isConfirmed) {
      if (isEditMode) {
        setIsEditMode(false);
        if (detailNotice) {
          setNewNotice({
            id: detailNotice.id,
            title: detailNotice.title,
            content: detailNotice.cont,
          });
        }
      } else {
        router.push('/notice');
      }
    }
  }

  //파일 추가 삭제
  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  //기존파일
  const handleDeleteExistingFile = (fileId: number) => {
    setAttachedFiles(prev =>
      prev.map(file =>
        file.id === fileId
          ? { ...file, status: 'DELETED' }
          : file
      )
    );
  };

  //로딩
  const loading = useLoadingStore((state) => state.loading)
  const isReady = !loading && detailNotice;

  useEffect(() => {
    if (id && id !== 'new') fetchDetailNotice(id);
    else clearDetail();
  }, [id]);

  useEffect(() => {
    if (detailNotice) {
      setNewNotice({
        id: detailNotice.id,
        title: detailNotice.title,
        content: detailNotice.cont,
      });
      setAttachedFiles(
        (detailNotice.files ?? []).map(file => ({
          id: file.id,
          fileName: file.fileName,
          fileUrl: file.fileUrl,
          status: 'NORMAL',
          fileFolder: file.fileFolder
        }))
      );
      console.log("파일 테스트", detailNotice.files)
    }
  }, [detailNotice]);

  const convertOembedToIframe = (html: string): string => {
    if (typeof window === 'undefined') return html; // SSR에서는 그냥 원본 반환

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const oembeds = doc.querySelectorAll('oembed');

    oembeds.forEach((oembed) => {
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

  return (
    <Wrapper>
      {id && id !== 'new' && !isEditMode ? (
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
            {user?.roles.includes('ROLE_ADMIN') && (
              <ButtonBox>
                  <>
                    <Button onClick={() => setIsEditMode(true)} color="#415B9C">
                      <FileText weight="bold"/>
                    </Button>
                    <Button onClick={deleteData} color="#D9625E">
                      <TrashSimple weight="bold"/>
                    </Button>
                  </>
              </ButtonBox>
              )}
            <TitleBox>
              <div>
                <span>{detailNotice?.registDate}</span>
                <Link href="/notice">
                  <ArrowLeft weight="bold" />
                  돌아가기
                </Link>
              </div>
              <h3>{detailNotice?.title}</h3>
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
                        <DownloadSimple  weight="bold" onClick={() => fileDownload(file)}/>
                      </FileSvgBox>
                    </a>
                  </li>
                ))}
              </StyledFileUl>
            )}
            <ContentBox
              className="ck-content"
              dangerouslySetInnerHTML={{
                __html: convertOembedToIframe(String(detailNotice?.cont)),
              }}
            />
          </>
        )
      ) : (
        <>
          <ButtonBox>
            <Button onClick={handleSubmit} color="#4A90E2">
              <Check weight="bold"/>
            </Button>
            <Button
              onClick={() =>
                cancleClick()
              }
              color="#D9625E"
            >
              <ArrowLeft weight="bold"/>
            </Button>
          </ButtonBox>
          <EditorWrapper>
            <InputBox
              type="text"
              placeholder="제목을 입력해주세요."
              value={newNotice.title}
              onChange={(e) =>
                setNewNotice((prev) => ({ ...prev, title: e.target.value }))
              }
            />
            <FileButtonBox>
              <Button
                type="button"
                color="#415B9C"
                onClick={() => fileInputRef.current?.click()}
              >
                <FilePlus weight="bold"/>
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
                        <TrashSimple  weight="bold" onClick={() => handleDeleteExistingFile(file.id)}/>
                      </FileSvgBox>
                      <FileSvgBox $color="#6DAE81">
                        <DownloadSimple  weight="bold" onClick={() => fileDownload(file)}/>
                      </FileSvgBox>
                    </a>
                  </li>
                ))}

                {files.map((file, idx) => (
                  <li key={`${file.name}-${idx}`}>
                    {file.name}
                    <FileSvgBox $color="#D9625E">
                      <TrashSimple  onClick={() => handleRemoveFile(idx)} weight="bold"/>
                    </FileSvgBox>
                  </li>
                ))}

            </StyledFileUl>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              hidden
              onChange={handleFileChange}
            />
            <EditorBox>
              <NoticeEditor
                value={newNotice.content}
                onChange={(content) =>
                  setNewNotice((prev) => ({ ...prev, content }))
                }
                onUpload={(file) => {
                  const formData = new FormData();
                  formData.append('file', file);
                  return new Promise<string>((resolve) => {
                    insert<FormData>({
                      url: '/bgm-agit/ckEditor/file/kml-notice',
                      body: formData,
                      ignoreErrorRedirect: true,
                      onSuccess: (data: unknown) => {
                        console.log('data', data);
                        resolve(data as string);
                      },
                    });
                  });
                }}
              />
            </EditorBox>
          </EditorWrapper>
        </>
      )}
    </Wrapper>
  );
}

export const Wrapper = styled.div`
    max-width: 1500px;
  min-width: 1280px;
  min-height: 600px;
  height: 100%;
  margin: 0 auto;
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

const InputBox = styled.input`
  height: 40px;
  width: 100%;
  margin-bottom: 10px;
  padding: 0 8px;
    color: ${({ theme }) => theme.colors.inputColor};
  border: 1px solid #c4c4c4; /* CKEditor 기본 테두리 색상 */
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

const EditorBox = styled.section`
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

const FileButtonBox = styled.div`
    display: flex;
    justify-content: end;
  padding-top: 8px;
    border-top: 1px solid ${({ theme }) => theme.colors.lineColor};
`

const Button = styled.button<{ color: string }>`
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

const TitleBox = styled.div`
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

const ContentBox = styled.div`
  height: 100%;
  width: 100%;
  min-height: calc(100vh - 300px);
  padding: 20px 10px;
  border-bottom: 2px solid ${({ theme }) => theme.colors.lineColor};
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

    img {
        max-width: 100%;
        height: auto;
        display: block;
    }
`;

const FileSvgBox = styled.div<{$color: string}>`
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
`

const StyledFileUl = styled.ul`
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


