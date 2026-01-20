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

    const isIOS =
      /iP(hone|od|ad)/.test(navigator.userAgent) ||
      (navigator.userAgent.includes('Macintosh') && 'ontouchend' in document);

    // iOS면 먼저 창을 연다 (동기 구간)
    const popup = isIOS ? window.open('', '_blank') : null;

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

            // 파일명 파싱
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

            // iOS 처리
            if (isIOS && popup) {
              const url = URL.createObjectURL(blob);
              popup.location.href = url;
              setTimeout(() => URL.revokeObjectURL(url), 5000);
              return;
            }

            // 그 외 브라우저
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
          }),
      () => {
        if (popup) popup.close();
      },
      { ignoreErrorRedirect: true, disableLoading: true },
    );
  };

  return fetchNoticeDownload;
}
