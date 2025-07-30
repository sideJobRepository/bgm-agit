import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';
import { mainDataState, mainMenuState } from './state/mainState.ts';
import api from '../utils/axiosInstance';
import { useRequest } from './useRequest.ts';
import type { ReservationData } from '../types/reservation.ts';
import { reservationListDataState, reservationState } from './state/reservationState.ts';
import { userState } from './state/userState.ts';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';
import type { AxiosRequestHeaders } from 'axios';
import { noticeState } from './state/noticeState.ts';
import type { params } from '../types/notice.ts';
import type { CustomUser } from '../types/user.ts';

interface InsertOptions<T> {
  url: string;
  headers?: AxiosRequestHeaders;
  body: T;
  onSuccess?: (data: T) => void;
  ignoreHttpError?: boolean; // 이거 추가
}

export function useFetchMainMenu() {
  const setMainMenu = useSetRecoilState(mainMenuState);
  const { request } = useRequest();

  useEffect(() => {
    request(() => api.get('/bgm-agit/main-menu').then(res => res.data), setMainMenu);
  }, []);
}

export function useFetchMainData(param?: { labelGb?: number; link?: string }) {
  const setMain = useSetRecoilState(mainDataState);
  const { request } = useRequest();

  useEffect(() => {
    request(
      () =>
        api
          .get('/bgm-agit/main-image', {
            params: param ?? {},
          })
          .then(res => res.data),
      setMain
    );
  }, [param?.link, param?.labelGb]);
}

export function useReservationFetch() {
  const { request } = useRequest();
  const setReservation = useSetRecoilState(reservationState);

  const fetchReservation = (params: ReservationData) => {
    request(
      () => api.get('/bgm-agit/reservation', { params }).then(res => res.data),
      setReservation
    );
  };

  return fetchReservation;
}

export function useReservationListFetch() {
  const { request } = useRequest();
  const setReservationList = useSetRecoilState(reservationListDataState);

  const fetchReservationList = (params: params) => {
    request(
      () => api.get('/bgm-agit/notice', { params }).then(res => res.data),
      setReservationList
    );
  };

  return fetchReservationList;
}

export function useNoticeFetch() {
  const { request } = useRequest();
  const setNotice = useSetRecoilState(noticeState);

  const fetchNotice = (params: params) => {
    request(() => api.get('/bgm-agit/notice', { params }).then(res => res.data), setNotice);
  };

  return fetchNotice;
}

export function useNoticeDownloadFetch() {
  const { request } = useRequest();

  const fetchNoticeDownload = (id: string) => {
    request(
      () =>
        api
          .get(`/bgm-agit/notice/download/notice/${id}`, {
            responseType: 'blob',
          })
          .then(res => {
            const blob = new Blob([res.data], {
              type: res.headers['content-type'],
            });

            const isIOS =
              /iP(hone|od|ad)/.test(navigator.userAgent) ||
              (navigator.userAgent.includes('Macintosh') && 'ontouchend' in document);

            // ⬇ 파일 이름 파싱 로직
            let fileName = 'download.bin';
            const disposition = res.headers['content-disposition'];
            if (disposition) {
              // 우선 RFC 5987 (filename*=UTF-8'') 형식 파싱
              const rfcMatch = disposition.match(/filename\*=UTF-8''(.+?)(?:;|$)/);
              if (rfcMatch && rfcMatch[1]) {
                fileName = decodeURIComponent(rfcMatch[1]);
              } else {
                // fallback: 일반 filename="..." 형식 파싱
                const normalMatch = disposition.match(/filename="?([^"]+)"?/);
                if (normalMatch && normalMatch[1]) {
                  fileName = decodeURIComponent(normalMatch[1]);
                }
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
                  .catch(err => {
                    console.error('iOS 공유 실패:', err);
                  });
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

  return fetchNoticeDownload;
}

export function useLoginPost() {
  const { request } = useRequest();
  const setUser = useSetRecoilState(userState);

  const postUser = (code: string, onSuccess?: () => void) => {
    request(
      () =>
        api.post('/bgm-agit/kakao-login', { code }).then(res => {
          const decoded = jwtDecode<CustomUser>(res.data.token);
          sessionStorage.setItem('user', JSON.stringify(decoded));
          sessionStorage.setItem('token', res.data.token);
          return decoded;
        }),
      decodedUser => {
        setUser(decodedUser);
        if (onSuccess) {
          onSuccess();
          toast.success('로그인에 성공하였습니다.');
        }
      }
    );
  };

  return { postUser };
}

export function useInsertPost() {
  const { request } = useRequest();

  const insert = <T>({ url, body, onSuccess, ignoreHttpError, headers }: InsertOptions<T>) => {
    request(
      () => api.post<T>(url, body, { headers }).then(res => res.data),
      data => {
        if (onSuccess) {
          onSuccess(data);
        }
      },
      { ignoreHttpError }
    );
  };

  return { insert };
}

export function useUpdatePost() {
  const { request } = useRequest();

  const update = <T>({ url, body, onSuccess, ignoreHttpError, headers }: InsertOptions<T>) => {
    request(
      () => api.put<T>(url, body, { headers }).then(res => res.data),
      data => {
        if (onSuccess) {
          onSuccess(data);
        }
      },
      { ignoreHttpError }
    );
  };

  return { update };
}

export function useDeletePost() {
  const { request } = useRequest();

  const remove = <T>({
    url,
    onSuccess,
    ignoreHttpError,
    headers,
  }: Omit<InsertOptions<T>, 'body'>) => {
    request(
      () => api.delete<T>(url, { headers }).then(res => res.data),
      data => {
        if (onSuccess) {
          onSuccess(data);
        }
      },
      { ignoreHttpError }
    );
  };

  return { remove };
}
