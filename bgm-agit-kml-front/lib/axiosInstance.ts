// utils/axiosInstance.ts
import axios, { AxiosError, type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios';
import { tokenStore } from '@/services/tokenStore';
import { getDeviceId } from '@/lib/deviceId';

interface AuthAxiosRequestConfig extends InternalAxiosRequestConfig {
  __hadAuth?: boolean;
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, //env의 API URL
  timeout: 15000,
  withCredentials: true,
});

let refreshing: Promise<string | null> | null = null;

function clearAuthSession() {
  tokenStore.clear();
  window.dispatchEvent(new Event('auth:expired'));
}

function isAuthEndpoint(url?: string) {
  return !!url && (
    url.includes('/bgm-agit/refresh') ||
    url.includes('/bgm-agit/next/login') ||
    url.includes('/bgm-agit/next/signup')
  );
}

//토큰 재발급
export async function refreshToken(): Promise<string | null> {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const { data } = await axios.post('/bgm-agit/refresh?source=record', null, {
      baseURL: api.defaults.baseURL,
      withCredentials: true,
      headers: { 'X-Device-Id': getDeviceId() },
    });
    const newToken = data?.token ?? null;

    if (!newToken) {
      clearAuthSession();
      return null;
    }

    tokenStore.set(newToken);
    window.dispatchEvent(new CustomEvent('auth:refreshed', { detail: { user: data?.user } }));

    return newToken;
  } catch (e) {
    // 비로그인/세션 만료 시 401로 떨어지는 정상 경로 — 콘솔 오버레이 방지를 위해 warn 으로 다룸
    console.warn('[refreshToken] no active session:', e);
    clearAuthSession();
    return null;
  } finally {
    refreshing = null; // 락 해제
  }
}

api.interceptors.request.use(async (config: AuthAxiosRequestConfig) => {
  config.headers = config.headers ?? {};
  config.headers['X-Device-Id'] = getDeviceId();

  if (isAuthEndpoint(config.url)) return config;

  let token = tokenStore.get();
  if (!token) {
    if (!refreshing) refreshing = refreshToken(); // 모든 요청이 같은 Promise를 기다림
    token = await refreshing;
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
