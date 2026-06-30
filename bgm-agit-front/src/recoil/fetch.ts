import { useEffect } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import {
  detailDataState,
  imageUploadState,
  mainDataState,
  mainMenuState,
  searchState,
} from './state/mainState.ts';
import api from '../utils/axiosInstance';
import { useRequest } from './useRequest.ts';
import type { ReservationData } from '../types/reservation.ts';
import { reservationListDataState, reservationState } from './state/reservationState.ts';
import { myPageState, userState } from './state/userState.ts';
import { toast } from 'react-toastify';
import { isAxiosError, type AxiosRequestHeaders } from 'axios';
import { loadingState } from './state/mainState.ts';
import { noticePopupState, noticeState } from './state/noticeState.ts';
import type { params } from '../types/notice.ts';
import { roleState } from './state/roleState.ts';
import { tokenStore } from '../utils/tokenStore';
interface InsertOptions<T> {
  url: string;
  headers?: AxiosRequestHeaders;
  body: T;
  onSuccess?: (data: T) => void;
  ignoreHttpError?: boolean;
}

export function useFetchMainMenu() {
  const setMainMenu = useSetRecoilState(mainMenuState);
  const { request } = useRequest();

  useEffect(() => {
    request(() => api.get('/bgm-agit/main-menu').then(res => res.data), setMainMenu);
  }, []);
}

// 로그인 직후 등 권한이 바뀐 시점에 메뉴를 명령형으로 다시 받아온다.
// (reload 없이 서버 권한 필터링된 메뉴를 갱신하기 위함)
export function useRefetchMainMenu() {
  const setMainMenu = useSetRecoilState(mainMenuState);
  const { request } = useRequest();

  return () =>
    request(() => api.get('/bgm-agit/main-menu').then(res => res.data), setMainMenu);
}

export function useFetchMainData(param?: {
  labelGb?: number;
  link?: string;
  name?: string | null;
  category?: string | null;
}) {
  const setMain = useSetRecoilState(mainDataState);
  const { request } = useRequest();
  const trigger = useRecoilValue(imageUploadState);

  useEffect(() => {
    request(
      () =>
        api
          .get(`/bgm-agit/main-image`, {
            params: param ?? {},
          })
          .then(res => res.data),
      setMain
    );
  }, [param?.link, param?.labelGb, trigger]);
}

//디테일
export function useFetchDetailData(param?: {
  labelGb?: number;
  link?: string;
  name?: string | null;
  category?: string | null;
}) {
  const setMain = useSetRecoilState(detailDataState);
  const { request } = useRequest();
  const trigger = useRecoilValue(imageUploadState);
  const pageData = useRecoilValue(searchState);

  useEffect(() => {
    let paramLink;

    if (param?.link) paramLink = param?.link.split('/').filter(Boolean).pop();

    const params = {
      ...(param ?? {}), // 기존 값 유지
      ...(pageData.name && paramLink === pageData.gb
        ? { name: encodeURIComponent(pageData.name) }
        : null),
      ...(pageData.category && paramLink === pageData.gb ? { category: pageData.category } : null),
    };

    const pageSize: number = param?.labelGb === 2 ? 8 : 10;

    request(
      () =>
        api
          .get(`/bgm-agit/detail?page=${pageData.page}&size=${pageSize}`, {
            params: params ?? {},
          })
          .then(res => res.data),
      setMain
    );
  }, [param?.link, param?.labelGb, trigger, pageData]);
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

  const fetchReservationList = (
    page: number,
    dateRange: { startDate: string | null; endDate: string | null }
  ) => {
    request(
      () =>
        api
          .get('/bgm-agit/reservation/detail', {
            params: {
              page,
              startDate: dateRange.startDate,
              endDate: dateRange.endDate,
            },
          })
          .then(res => res.data),
      setReservationList
    );
  };

  return fetchReservationList;
}

export function useRoletFetch() {
  const { request } = useRequest();
  const setRole = useSetRecoilState(roleState);

  // mahjong=true 면 자체로그인(MAHJONG) 회원, 아니면 소셜(KAKAO/NAVER/GOOGLE) 회원 목록을 받는다.
  // 두 엔드포인트 모두 동일한 BgmAgitRoleResponse 페이지 형태를 반환한다.
  const fetchRole = (page: number, memberEmail: string, mahjong = false) => {
    const url = mahjong ? '/bgm-agit/mahjong-role' : '/bgm-agit/role';
    request(
      () =>
        api
          .get(url, {
            params: { page, res: memberEmail },
          })
          .then(res => res.data),
      setRole
    );
  };

  return fetchRole;
}

//공지사항
export function useNoticeFetch() {
  const { request } = useRequest();
  const setNotice = useSetRecoilState(noticeState);

  const fetchNotice = (params: params) => {
    request(() => api.get('/bgm-agit/notice', { params }).then(res => res.data), setNotice);
  };

  return fetchNotice;
}

export function useNoticePopupFetch() {
  const { request } = useRequest();
  const setNoticePopup = useSetRecoilState(noticePopupState);

  const fetchNoticePopup = () => {
    request(() => api.get('/bgm-agit/notice/popup').then(res => res.data), setNoticePopup);
  };

  return fetchNoticePopup;
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
      { ignoreHttpError: true }
    );
  };

  return fetchNoticeDownload;
}

//myPage
export function useMyPageFetch() {
  const { request } = useRequest();
  const setMyPage = useSetRecoilState(myPageState);

  const fetchReservation = () => {
    request(() => api.get('/bgm-agit/mypage').then(res => res.data), setMyPage);
  };

  return fetchReservation;
}

export function useLoginPost() {
  const setUser = useSetRecoilState(userState);
  const setLoading = useSetRecoilState(loadingState);

  const postUser = async (
    code: string,
    name: string,
    onSuccess?: () => void,
    onError?: () => void
  ) => {
    setLoading(true);
    try {
      const res = await api.post(`/bgm-agit/${name}-login`, { code });
      tokenStore.set(res.data.token as string);
      setUser(res.data.user);
      onSuccess?.();
      toast.success('로그인에 성공하였습니다.');
    } catch (e) {
      // 서버가 내려준 안내 메시지(예: "이미 가입된 계정이 있습니다.")를 그대로 노출
      const message =
        (isAxiosError(e) && (e.response?.data as { message?: string })?.message) ||
        '로그인에 실패하였습니다.';
      toast.error(message);
      onError?.();
    } finally {
      setLoading(false);
    }
  };

  return { postUser };
}

// 메인사이트 자체로그인 (닉네임 + 비밀번호). /bgm-agit/login → refreshToken_main 쿠키 발급
export function useFormLoginPost() {
  const setUser = useSetRecoilState(userState);
  const setLoading = useSetRecoilState(loadingState);

  const postFormLogin = async (
    payload: { nickname: string; password: string },
    onSuccess?: () => void,
    onError?: () => void
  ) => {
    setLoading(true);
    try {
      const res = await api.post('/bgm-agit/login', payload);
      tokenStore.set(res.data.token as string);
      setUser(res.data.user);
      onSuccess?.();
      toast.success('로그인에 성공하였습니다.');
    } catch (e) {
      const message =
        (isAxiosError(e) && (e.response?.data as { message?: string })?.message) ||
        '로그인에 실패하였습니다.';
      toast.error(message);
      onError?.();
    } finally {
      setLoading(false);
    }
  };

  return { postFormLogin };
}

// 메인사이트 자체 회원가입. 기존 폼 가입 엔드포인트 재사용 (socialType=MAHJONG 생성)
export function useSignupPost() {
  const setLoading = useSetRecoilState(loadingState);

  const postSignup = async (
    payload: { name: string; nickname: string; phoneNo: string; password: string },
    onSuccess?: () => void,
    onError?: () => void
  ) => {
    setLoading(true);
    try {
      // 메인사이트 가입은 보드게임 회원(mahjongUse=false) → 가입 시 KML 등록하지 않음.
      // 마작 기록 이용은 마이페이지의 "마작 기록 이용 신청"으로 별도 전환.
      const res = await api.post('/bgm-agit/next/signup', { ...payload, mahjongUse: false });
      const data = res.data as { success?: boolean; message?: string };
      if (data?.success === false) {
        toast.error(data.message ?? '회원가입에 실패했습니다.');
        onError?.();
        return;
      }
      toast.success(data?.message ?? '회원가입이 완료되었습니다.');
      onSuccess?.();
    } catch (e) {
      const message =
        (isAxiosError(e) && (e.response?.data as { message?: string })?.message) ||
        '회원가입에 실패했습니다.';
      toast.error(message);
      onError?.();
    } finally {
      setLoading(false);
    }
  };

  return { postSignup };
}

// 마이페이지 비밀번호 변경. 실패 시 백엔드 메시지(예: "현재 비밀번호가 일치하지 않습니다.")를 그대로 노출
export function useChangeMyPasswordPost() {
  const setLoading = useSetRecoilState(loadingState);

  const changeMyPassword = async (
    payload: { currentPassword: string; newPassword: string },
    onSuccess?: () => void,
    onError?: () => void
  ) => {
    setLoading(true);
    try {
      await api.put('/bgm-agit/mypage/password', payload);
      toast.success('비밀번호가 변경되었습니다.');
      onSuccess?.();
    } catch (e) {
      const message =
        (isAxiosError(e) && (e.response?.data as { message?: string })?.message) ||
        '비밀번호 변경에 실패했습니다.';
      toast.error(message);
      onError?.();
    } finally {
      setLoading(false);
    }
  };

  return { changeMyPassword };
}

export function useInsertPost() {
  const { request } = useRequest();

  const insert = <T>({ url, body, onSuccess, ignoreHttpError, headers }: InsertOptions<T>) => {
    request(
      () => api.post<T>(url, body, { headers }).then(res => res.data),
      data => onSuccess?.(data),
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
      data => onSuccess?.(data),
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
      data => onSuccess?.(data),
      { ignoreHttpError }
    );
  };

  return { remove };
}
