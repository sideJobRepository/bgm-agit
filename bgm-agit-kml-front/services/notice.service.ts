import { useRequest } from '@/hooks/useRequest';
import { NoticeFiles, useNoticeDetailStore, useNoticeListStore } from '@/store/notice';
import api from '@/lib/axiosInstance';

export type params = {
  page?: number;
  titleAndCont?: string;
};

export function useFetchNoticeList() {
  const { request } = useRequest();
  const setNotice = useNoticeListStore((state) => state.setNotice);

  const fetchNotice = (params: params) => {
    request(() => api.get(`/bgm-agit/kml-notice?size=5`, { params }).then(res => res.data), setNotice);
  };

  return fetchNotice;
}

export function useFetchNoticeDetailL() {
  const { request } = useRequest();
  const setDetailNotice = useNoticeDetailStore((state) => state.setDetailNotice);

  const fetchDetailNotice = (id: string) => {
    request(() => api.get(`/bgm-agit/kml-notice/${id}`).then(res => res.data), setDetailNotice);
  };

  return fetchDetailNotice;
}

export function useNoticeDownloadFetch() {
  const { request } = useRequest();

  const fetchNoticeDownload = (file: NoticeFiles) => {

    const sliceId = file.fileUrl.split('/').pop()!;

    request(
      () =>
        api
          .get(`/bgm-agit/download/${file.fileFolder}/${sliceId}`, {
            responseType: 'blob',
          })
          .then(res => {
            const blob = new Blob([res.data], {
              type: res.headers['content-type'],
            });

            const isIOS =
              /iP(hone|od|ad)/.test(navigator.userAgent) ||
              (navigator.userAgent.includes('Macintosh') && 'ontouchend' in document);

            // 파일 이름 파싱
            let fileName = 'download.bin';
            const disposition = res.headers['content-disposition'];
            if (disposition) {
              const rfcMatch = disposition.match(/filename\*=UTF-8''(.+?)(?:;|$)/);
              if (rfcMatch?.[1]) fileName = decodeURIComponent(rfcMatch[1]);
              else {
                const normalMatch = disposition.match(/filename="?([^"]+)"?/);
                if (normalMatch?.[1]) fileName = decodeURIComponent(normalMatch[1]);
              }
            }

            if (isIOS && navigator.canShare) {
              const file = new File([blob], fileName, { type: blob.type });
              if (navigator.canShare({ files: [file] })) {
                navigator
                  .share({
                    files: [file],
                    title: '파일 다운로드',
                    text: '공지사항 첨부파일입니다.',
                  })
                  .catch(err => console.error('iOS 공유 실패:', err));
                return;
              }
            }

            // 일반 브라우저 다운로드
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
          }),
      () => {},
      { ignoreErrorRedirect: true }
    );
  };

  return fetchNoticeDownload;
}