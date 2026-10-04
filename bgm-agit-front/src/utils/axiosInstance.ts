// utils/axiosInstance.ts
import axios, { AxiosError, type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios';
import { tokenStore } from './tokenStore';
import { getDeviceId } from './deviceId';

interface AuthAxiosRequestConfig extends InternalAxiosRequestConfig {
  __hadAuth?: boolean;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
});

let refreshing: Promise<string | null> | null = null;

// 마지막 재발급으로 받은 사용자. auth:refreshed 이벤트는 그 순간 듣고 있는 쪽만 받는데,
// 새로고침 직후 Layout 보다 먼저 뜨는 ClosedMenuGuard 의 요청이 재발급을 일으키면 이벤트가 유실돼
// 토큰은 있는데 화면은 비로그인으로 보였다. Layout 이 붙을 때 이 값을 직접 읽는다
let refreshedUser: unknown = null;

export function getRefreshedUser() {
  return tokenStore.get() ? refreshedUser : null;
}

function isAuthEndpoint(url?: string) {
   return !!url && (
    url.includes('/bgm-agit/refresh') ||
    url.includes('/bgm-agit/login') ||
    url.includes('/bgm-agit/next/login') ||
    url.includes('/bgm-agit/next/signup') ||
    url.includes('/bgm-agit/kakao-login') ||
    url.includes('/bgm-agit/google-login') ||
    url.includes('/bgm-agit/naver-login')
  );
}

async function refreshToken(): Promise<string | null> {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const { data } = await axios.post('/bgm-agit/refresh?source=main', null, {
      baseURL: api.defaults.baseURL,
      withCredentials: true,
      headers: { 'X-Device-Id': getDeviceId() },
    });
    const newToken = data?.token ?? null;
    if (!newToken) {
      tokenStore.clear();
      window.dispatchEvent(new Event('auth:expired'));
      return null;
    }

    tokenStore.set(newToken);
    refreshedUser = data?.user ?? null;
    window.dispatchEvent(new CustomEvent('auth:refreshed', { detail: { user: data?.user } }));
    return newToken;
  } catch (e) {
    console.error(e);
    tokenStore.clear();
    window.dispatchEvent(new Event('auth:expired'));
    return null;
  } finally {
    refreshing = null; // 락 해제
  }
}

export async function restoreAuthSession(): Promise<void> {
  if (typeof window === 'undefined') {
    return;
  }

  if (tokenStore.get()) {
    return;
  }

  // 인터셉터와 동일한 단일-비행 락 공유 (새로고침 시 refresh 중복 호출 → 토큰 회전 레이스로
  // 한쪽이 401 나서 auth:expired 로그아웃되는 문제 방지)
  if (!refreshing) refreshing = refreshToken();
  await refreshing;
}

api.interceptors.request.use(async (config: AuthAxiosRequestConfig) => {
  config.headers = config.headers ?? {};
  config.headers['X-Device-Id'] = getDeviceId();

  if (isAuthEndpoint(config.url)) return config;

  let token = tokenStore.get();
  if (!token) {
    if (!refreshing) refreshing = refreshToken(); // 첫 호출만 실제 실행
    token = await refreshing; // 모두 같은 Promise를 기다림
  }

  config.__hadAuth = !!token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
    r => r,
    async (error: AxiosError) => {
      const original = error.config as AxiosRequestConfig & {
        __isRetryRequest?: boolean;
        __hadAuth?: boolean;
      };

      if (!error.response) return Promise.reject(error);
      const status = error.response.status;

      // refresh 자체 실패면 중단
      if (isAuthEndpoint(original?.url)) {
        return Promise.reject(error);
      }

      // 401만 처리 + 이미 재시도했거나 애초에 인증 없이 간 요청이면 패스
      if (status !== 401 || original?.__isRetryRequest) {
        return Promise.reject(error);
      }

      // request 인터셉터와 동일한 락(refreshing)을 공유
      if (!refreshing) refreshing = refreshToken();
      const newToken = await refreshing;
      if (!newToken) return Promise.reject(error);

      original.__isRetryRequest = true;
      original.headers = original.headers ?? {};
      original.headers.Authorization = `Bearer ${newToken}`;
      return api(original);
    }
);


export default api;
