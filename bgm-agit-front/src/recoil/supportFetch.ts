import { useRequest } from './useRequest.ts';
import { useSetRecoilState } from 'recoil';
import api from '../utils/axiosInstance.ts';
import { detailSupportState, supportState } from './state/supportState.ts';
import type { params } from '../types/support.ts';

export function useSupportFetch() {
  const { request } = useRequest();
  const setSupport = useSetRecoilState(supportState);

  const fetchSupport = (params: params) => {
    request(() => api.get('/bgm-agit/inquiry', { params }).then(res => res.data), setSupport);
  };

  return fetchSupport;
}

export function useDetailSupportFetch() {
  const { request } = useRequest();
  const setDetailSupport = useSetRecoilState(detailSupportState);

  const fetchDetailSupport = (id: string) => {
    request(() => api.get(`/bgm-agit/inquiry/${id}`).then(res => res.data), setDetailSupport);
  };

  return fetchDetailSupport;
}

export function useSupportDownloadFetch() {
  const { request } = useRequest();

  const fetchSupportDownload = (id: string) => {
    request(
      () =>
        api
          .get(`/bgm-agit/inquiry/download/inquiry/${id}`, {
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
                    text: '문의게시판 첨부파일입니다.',
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
      { ignoreHttpError: true }
    );
  };

  return fetchSupportDownload;
}
