import { useRequest } from './useRequest.ts';
import { useSetRecoilState } from 'recoil';
import api from '../utils/axiosInstance.ts';
import { detailServiceRequestState, serviceRequestState } from './state/serviceRequestState.ts';
import type { params } from '../types/support.ts';

// 서비스 요청(유지보수 요청) 게시판 — 관리자 전용. 구조는 1:1 문의(supportFetch.ts)와 같다
export function useServiceRequestFetch() {
  const { request } = useRequest();
  const setServiceRequest = useSetRecoilState(serviceRequestState);

  return (params: params) => {
    request(
      () => api.get('/bgm-agit/service-request', { params }).then(res => res.data),
      setServiceRequest
    );
  };
}

export function useDetailServiceRequestFetch() {
  const { request } = useRequest();
  const setDetail = useSetRecoilState(detailServiceRequestState);

  return (id: string) => {
    request(() => api.get(`/bgm-agit/service-request/${id}`).then(res => res.data), setDetail);
  };
}

export function useServiceRequestDownloadFetch() {
  const { request } = useRequest();

  return (id: string) => {
    request(
      () =>
        api
          .get(`/bgm-agit/service-request/download/service-request/${id}`, {
            responseType: 'blob',
          })
          .then(res => {
            const blob = new Blob([res.data], {
              type: res.headers['content-type'],
            });

            const isIOS =
              /iP(hone|od|ad)/.test(navigator.userAgent) ||
              (navigator.userAgent.includes('Macintosh') && 'ontouchend' in document);

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
                    text: '서비스 요청 첨부파일입니다.',
                  })
                  .catch(err => console.error('iOS 공유 실패:', err));
                return;
              }
            }

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
}
