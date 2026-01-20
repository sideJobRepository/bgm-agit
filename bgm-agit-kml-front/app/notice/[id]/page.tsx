'use client';

import { useUserStore } from '@/store/user';
import { useFetchNoticeDetailL } from '@/services/notice.service';
import { use, useEffect, useState } from 'react';
import { useNoticeDetailStore } from '@/store/notice';
import dynamic from 'next/dynamic';
import styled from 'styled-components';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, TrashSimple, FileText, Check } from 'phosphor-react';
import { useDeletePost, useInsertPost, useUpdatePost } from '@/services/main.service';
import { alertDialog, confirmDialog } from '@/utils/alert';

const NoticeEditor = dynamic(() => import('../../components/NoticeEditor'), {
  ssr: false,
});

type NewNoticeState = {
  id: number | null;
  title: string;
  content: string;
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

  const [isEditMode, setIsEditMode] = useState(false);
  const [newNotice, setNewNotice] = useState<NewNoticeState>({
    id: null,
    title: '',
    content: '',
  });

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append('title', newNotice.title);
    formData.append('cont', newNotice.content);

    if (isEditMode) {
      formData.append('id', id);
    }

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
          } else {
            const result = await confirmDialog(
              '공지사항이 저장되었습니다.\n목록으로 이동하시겠습니까?',
              'success'
            );
            if (result.isConfirmed) router.push(`/notice`);
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
        <>
          <ButtonBox>
            {user?.roles.includes('ROLE_ADMIN') && (
              <>
                <Button onClick={() => setIsEditMode(true)} color="#415B9C">
                  <FileText weight="bold"/>
                </Button>
                <Button onClick={deleteData} color="#D9625E">
                  <TrashSimple weight="bold"/>
                </Button>
              </>
            )}
          </ButtonBox>
          <TitleBox>
            <div>
              <span>{detailNotice?.registDate}</span>
              <Link href="/notice">
                <ArrowLeft weight="bold" />
                돌아가기
              </Link>
            </div>
            <h2>{detailNotice?.title}</h2>
          </TitleBox>
          <ContentBox
            className="ck-content"
            dangerouslySetInnerHTML={{
              __html: convertOembedToIframe(String(detailNotice?.cont)),
            }}
          />
        </>
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
                        console.log("data", data)
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

const StyledRadioGroup = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
`;

const StyledRadioLabel = styled.label`
  display: flex;
  align-items: center;
  font-size: ${({ theme }) => theme.desktop.sizes.md};
  color: ${({ theme }) => theme.colors.subColor};

  input {
    cursor: pointer;
    margin-right: 6px;
    accent-color: ${({ theme }) => theme.colors.noticeColor};
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
        background-color: rgb(242, 242, 243);

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

    h2 {
        display: flex;
        height: 100%;
        align-items: center;
        padding: 20px 10px;
        color: ${({ theme }) => theme.colors.inputColor};
        font-size: ${({ theme }) => theme.desktop.sizes.h2Size};
        font-weight: 600;
        white-space: normal;
        word-break: break-word;
        overflow-wrap: anywhere;

        @media ${({ theme }) => theme.device.mobile} {
            font-size: ${({ theme }) => theme.mobile.sizes.h2Size};
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

const StyledFileUl = styled.ul`
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
    font-size: ${({ theme }) => theme.desktop.sizes.sm};

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

const StyledFileInput = styled.input`
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
    font-size: ${({ theme }) => theme.desktop.sizes.sm};
  }
`;
