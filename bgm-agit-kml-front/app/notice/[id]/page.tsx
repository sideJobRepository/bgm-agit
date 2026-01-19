'use client';

import { useUserStore } from '@/store/user';
import { useFetchNoticeDetailL } from '@/services/notice.service';
import { use, useEffect, useState } from 'react';
import { useNoticeDetailStore } from '@/store/notice';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import styled from 'styled-components';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft
} from 'phosphor-react';

export default function NoticeDetail({
                                             params,
                                           }: {
  params: Promise<{ id: string }>;
}) {

  const { id } = use(params);
  const router = useRouter();

  const user = useUserStore((state) =>state.user);
  const fetchDetailNotice = useFetchNoticeDetailL();
  const detailNotice = useNoticeDetailStore((state) => state.noticeDetail);
  console.log("detailNotice", detailNotice);

  //수정상태
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    fetchDetailNotice(id)
  }, [id]);

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

  return <Wrapper>
    <>
    <TitleBox>
      <div>
        <span>{detailNotice?.registDate} </span>
        <ButtonBox>
          {user?.roles.includes('ROLE_ADMIN') && (
            <>
              <Button
                onClick={() => {
                  setIsEditMode(true);
                }}
                color="#415B9C"
              >
                수정
              </Button>
              <Button color="#D9625E" >
                삭제
              </Button>
            </>
          )}
          <Link
            href="/notice"
          >
            <ArrowLeft weight="bold"/>
            돌아가기
          </Link>
        </ButtonBox>
      </div>
      <h4>{detailNotice?.title}</h4>
    </TitleBox>
    {/*{attachedFiles.length > 0 && (*/}
    {/*  <StyledFileUl>*/}
    {/*    {attachedFiles.map((file, idx) => (*/}
    {/*      <li key={idx}>*/}
    {/*        <a*/}
    {/*          onClick={() => {*/}
    {/*            fileDownload(file.url);*/}
    {/*          }}*/}
    {/*        >*/}
    {/*          {file.fileName}*/}
    {/*          <FaDownload />*/}
    {/*        </a>*/}
    {/*      </li>*/}
    {/*    ))}*/}
    {/*  </StyledFileUl>*/}
    {/*)}*/}

    <ContentBox
      className="ck-content"
      dangerouslySetInnerHTML={{
        __html: convertOembedToIframe(String(detailNotice?.cont)),
      }}
    />
  </>
  </Wrapper>;
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
  flex-direction: column;
  height: calc(100vh - 150px);
  box-sizing: border-box;
  padding-bottom: 40px;
`;

const InputBox = styled.input`
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
    border-color: ${({ theme }) => theme.colors.noticeColor} !important;
    box-shadow: none !important;
  }
`;

const ButtonBox = styled.div`
  display: flex;
  align-items: center;
    justify-content: flex-end;
  gap: 4px;
    flex: 1;

    a {
        display: flex;
        position: relative;
        align-items: center;
        justify-content: flex-end;
        gap: 8px;
        width: 100%;
        font-weight: 500;
        color: ${({ theme }) => theme.colors.grayColor};
        font-size: ${({ theme }) => theme.desktop.sizes.sm};

        svg {
            width: 12px;
            height: 12px;
        }
    }
`;

const Button = styled.button<{ color: string }>`
  padding:0 16px;
    height: 32px;
  background-color: ${({ color }) => color};
  color: ${({ theme }) => theme.colors.white};
  font-size: ${({ theme }) => theme.desktop.sizes.md};
  border: none;
  border-radius: 4px;
  cursor: pointer;

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${({ theme }) => theme.mobile.sizes.md};
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
    background-color: rgb(253, 253, 255);
      
    span {
      margin-left: auto;
      color: ${({ theme }) => theme.colors.grayColor};
      font-size: ${({ theme }) => theme.desktop.sizes.xl};
        font-weight: 600;
      
        @media ${({ theme }) => theme.device.mobile} {
        font-size: ${({ theme }) => theme.mobile.sizes.xl};
      }
    }
  }

  h4 {
    display: flex;
    height: 100%;
    align-items: center;
    padding: 20px 10px;
    color: ${({ theme }) => theme.colors.subColor};
    font-size: ${({ theme }) => theme.desktop.sizes.h4Size};
    font-weight: ${({ theme }) => theme.weight.bold};
    font-family: 'Jua', sans-serif;
      white-space: normal;
      word-break: break-word;
      overflow-wrap: anywhere;

    @media ${({ theme }) => theme.device.mobile} {
      font-size: ${({ theme }) => theme.mobile.sizes.h4Size};
    }
  }
`;

const ContentBox = styled.div`
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
