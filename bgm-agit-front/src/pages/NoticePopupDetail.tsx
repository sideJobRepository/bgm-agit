import { useNoticeDownloadFetch, useNoticeFetch } from '../recoil/fetch.ts';
import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { noticeState } from '../recoil/state/noticeState.ts';

import { FaDownload } from 'react-icons/fa';
import Modal from '../components/Modal.tsx';
import type { NoticeContent } from '../types/notice.ts';
import { theme } from '../styles/theme.ts';
import {
  PopupWrapper,
  ButtonBox,
  Button,
  TitleBox,
  ContentBox,
  StyledFileUl,
  PopupBox,
} from './NoticePopupDetail.styles.ts';

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
            <Button onClick={onClose} color={theme.colors.danger}>
              닫기
            </Button>
            <Button color={theme.colors.primary} onClick={hideToday}>
              오늘 하루 보지 않기
            </Button>
          </ButtonBox>
        </PopupBox>
      </PopupWrapper>
    </Modal>
  );
}
