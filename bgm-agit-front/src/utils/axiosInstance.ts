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

async function refreshToken(): Promise<string | null> {
  if (typeof window === 'undefined' || localStorage.getItem('login') !== '1') {
    return null;
  }

  try {
    const { data } = await axios.post('/bgm-agit/refresh?source=main', null, {
      baseURL: api.defaults.baseURL,
      withCredentials: true,
      headers: { 'X-Device-Id': getDeviceId() },
    });
    const newToken = data?.token ?? null;
    tokenStore.set(newToken);
    window.dispatchEvent(new CustomEvent('auth:refreshed', { detail: { user: data?.user } }));
    return newToken;
  } catch (e) {
    console.error(e);
    localStorage.removeItem('login');
    return null;
  } finally {
    refreshing = null; // 락 해제
  }
}

api.interceptors.request.use(async (config: AuthAxiosRequestConfig) => {
  config.headers = config.headers ?? {};
  config.headers['X-Device-Id'] = getDeviceId();

  if (config.url?.includes('/bgm-agit/refresh')) return config;

  let token = tokenStore.get();
  if (!token && localStorage.getItem('login') === '1') {
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
      if (original?.url?.includes('/bgm-agit/refresh')) {
        return Promise.reject(error);
      }

      // 401만 처리 + 이미 재시도했거나 애초에 인증 없이 간 요청이면 패스
      if (status !== 401 || original?.__isRetryRequest || !original?.__hadAuth) {
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
