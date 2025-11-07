import { useNoticeDownloadFetch, useNoticeFetch } from '../recoil/fetch.ts';
import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { noticeState } from '../recoil/state/noticeState.ts';
import styled from 'styled-components';
import type { WithTheme } from '../styles/styled-props.ts';

import { FaDownload } from 'react-icons/fa';
import Modal from '../components/Modal.tsx';
import type { NoticeContent } from '../types/notice.ts';

export default function NoticePopupDetail({
  item,
  onClose,
}: {
  item: NoticeContent;
  onClose: () => void;
}) {
  const fetchNotice = useNoticeFetch();
  const fetchNoticeDownload = useNoticeDownloadFetch();

  const id = item?.bgmAgitNoticeId;

  const page = 0;

  const notices = useRecoilValue(noticeState);
  console.log('notices', notices);

  const [attachedFiles, setAttachedFiles] = useState<
    { fileName: string; url: string; uuidName: string }[]
  >([]);

  function fileDownload(id: string) {
    const sliceId = id.split('/').pop()!; // 마지막 슬래시 이후 값만 추출
    fetchNoticeDownload(sliceId);
  }

  const notice = notices.content?.find(item => item.bgmAgitNoticeId === Number(id));

  useEffect(() => {
    if (id) fetchNotice({ page, titleOrCont: '' });
  }, []);

  useEffect(() => {
    const matched = notices.content?.find(item => item.bgmAgitNoticeId === Number(id));
    if (matched) {
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

  //오늘하루 보지 않기
  function hideToday() {
    const today = new Date().toISOString().slice(0, 10);
    localStorage.setItem(`notice_${id}_hide_until`, today);
    onClose();
  }

  return (
    <Modal onClose={onClose}>
      <PopupWrapper>
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
        <PopupBox>
          <ButtonBox>
            <Button onClick={onClose} color="#FF5E57">
              닫기
            </Button>
            <Button color="#482768" onClick={hideToday}>
              오늘 하루 보지 않기
            </Button>
          </ButtonBox>
        </PopupBox>
      </PopupWrapper>
    </Modal>
  );
}

const PopupWrapper = styled.div<WithTheme>`
  width: 800px;
  position: relative;
  height: calc(100dvh - 40px);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  border-radius: 12px 12px 0 0;

  @media ${({ theme }) => theme.device.tablet} {
    width: calc(100vw - 40px);
  }
`;

const ButtonBox = styled.div`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 40px;
  padding: 8px;
  gap: 4px;
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
    border-radius: 12px 12px 0 0;

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
  width: 100%;
  padding: 20px 10px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.bronzeColor};
  margin-bottom: 20px;
  flex: 1;

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
  padding: 10px;
  gap: 4px;
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

const PopupBox = styled.div<WithTheme>`
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: ${({ theme }) => theme.colors.topBg};
  z-index: 3;
  border-radius: 0 0 12px 12px;
`;
