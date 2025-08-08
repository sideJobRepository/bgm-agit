// utils/axiosInstance.ts
import axios, { AxiosError, type AxiosRequestConfig } from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // 필요 시 교체
  timeout: 15000,
});

// 매 요청 Authorization 헤더 주입
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers = config.headers ?? {};
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let refreshWaiters: Array<(token: string) => void> = [];

const onRefreshed = (token: string) => {
  refreshWaiters.forEach((cb) => cb(token));
  refreshWaiters = [];
};

const addWaiter = (cb: (token: string) => void) => refreshWaiters.push(cb);

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as (AxiosRequestConfig & { __isRetryRequest?: boolean });

    // 네트워크/기타 오류
    if (!error.response) return Promise.reject(error);

    const status = error.response.status;

    // 401이 아니면 그대로 처리
    if (status !== 401 || original?.__isRetryRequest) {
      return Promise.reject(error);
    }

    // /refresh 자체에서 난 401이면 더 진행 불가
    if (original?.url?.includes('/bgm-agit/refresh')) {
      return Promise.reject(error);
    }

    // 재발급 단일 실행, 나머지는 대기
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const { data } = await axios.post(
          '/bgm-agit/refresh',
          null,
          {
            baseURL: api.defaults.baseURL,
            withCredentials: true, // HttpOnly refreshToken 쿠키 전송
          }
        );

        const newToken = (data as any)?.token;
        if (!newToken) throw new Error('No access token from refresh');

        // 전역 갱신
        localStorage.setItem('accessToken', newToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        isRefreshing = false;
        onRefreshed(newToken);
      } catch (e) {
        isRefreshing = false;
        refreshWaiters = [];
        return Promise.reject(e);
      }
    }

    // 재발급 완료 기다렸다가 원요청 재시도
    return new Promise((resolve, reject) => {
      addWaiter((token: string) => {
        try {
          original.__isRetryRequest = true;
          original.headers = original.headers ?? {};
          original.headers['Authorization'] = `Bearer ${token}`;
          resolve(api(original));
        } catch (e) {
          reject(e);
        }
      });
    });
  }
);

export default api;
