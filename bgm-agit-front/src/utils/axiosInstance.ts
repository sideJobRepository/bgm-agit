// utils/axiosInstance.ts
import axios, { AxiosError, type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios';
import { tokenStore } from './tokenStore';

interface AuthAxiosRequestConfig extends InternalAxiosRequestConfig {
  __hadAuth?: boolean;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
});

let refreshing: Promise<string | null> | null = null;

async function refreshToken(): Promise<string | null> {
  try {
    const { data } = await axios.post('/bgm-agit/refresh', null, {
      baseURL: api.defaults.baseURL,
      withCredentials: true,
    });
    const newToken = data?.token ?? null;
    tokenStore.set(newToken);
    window.dispatchEvent(new CustomEvent('auth:refreshed', { detail: { user: data?.user } }));
    return newToken;
  } catch (e) {
    console.error(e);
    return null;
  } finally {
    refreshing = null; // 락 해제
  }
}

api.interceptors.request.use(async (config: AuthAxiosRequestConfig) => {
  if (config.url?.includes('/bgm-agit/refresh')) return config;

  let token = tokenStore.get();
  console.log('token', token);
  if (!token) {
    if (!refreshing) refreshing = refreshToken(); // 첫 호출만 실제 실행
    token = await refreshing; // 모두 같은 Promise를 기다림
  }

  config.__hadAuth = !!token;
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let waiters: Array<(t: string) => void> = [];
const addWaiter = (cb: (t: string) => void) => waiters.push(cb);
const notifyAll = (t: string) => {
  waiters.forEach(cb => cb(t));
  waiters = [];
};

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
    if (original?.url?.includes('/bgm-agit/refresh')) {
      return Promise.reject(error);
    }

    // 401만 처리 + 이미 재시도했거나 애초에 인증 없이 간 요청이면 패스
    if (status !== 401 || original?.__isRetryRequest || !original?.__hadAuth) {
      return Promise.reject(error);
    }

    // 단일 refresh
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        console.log('---- 재발급 리프래쉬 로직');
        const { data } = await axios.post(
          '/bgm-agit/refresh',
          null,
          { baseURL: api.defaults.baseURL, withCredentials: true } // HttpOnly 쿠키
        );
        const newToken = data?.token;
        if (!newToken) throw new Error('No access token from refresh');

        tokenStore.set(newToken);
        isRefreshing = false;
        notifyAll(newToken);
      } catch (e) {
        isRefreshing = false;
        waiters = [];
        tokenStore.clear();
        return Promise.reject(e);
      }
    }

    // refresh 완료 후 원요청 1회만 재시도
    return new Promise((resolve, reject) => {
      addWaiter(token => {
        try {
          original.__isRetryRequest = true;
          original.headers = original.headers ?? {};
          original.headers.Authorization = `Bearer ${token}`;
          resolve(api(original));
        } catch (e) {
          reject(e);
        }
      });
    });
  }
);

export default api;
