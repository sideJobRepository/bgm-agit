// utils/axiosInstance.ts
import axios, { AxiosError, type AxiosRequestConfig } from 'axios';

const TOKEN_KEY = 'token';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: 15000,
});

// -------- request interceptor: 최신 토큰만 주입, refresh는 제외
api.interceptors.request.use((config) => {
    // refresh 엔드포인트에는 액세스 토큰 불필요(붙어도 상관없지만 명시적으로 제외)
    if (!config.url?.includes('/bgm-agit/refresh')) {
        const token = localStorage.getItem(TOKEN_KEY);
        (config as any).__hadAuth = !!token; // 이 요청이 인증 요청이었는지 표시(401 처리시 가드로 사용)
        if (token) {
            config.headers = config.headers ?? {};
            config.headers['Authorization'] = `Bearer ${token}`;
        }
    }
    return config;
});

let isRefreshing = false;
let waiters: Array<(token: string) => void> = [];

const addWaiter = (cb: (token: string) => void) => waiters.push(cb);
const notifyAll = (token: string) => {
    waiters.forEach((cb) => cb(token));
    waiters = [];
};

api.interceptors.response.use(
    (res) => res,
    async (error: AxiosError) => {
        const original = error.config as (AxiosRequestConfig & {
            __isRetryRequest?: boolean;
            __hadAuth?: boolean;
        });

        // 네트워크 자체 에러면 그대로
        if (!error.response) return Promise.reject(error);

        const status = error.response.status;

        // refresh 자체에서 난 에러는 중단(루프 방지)
        if (original?.url?.includes('/bgm-agit/refresh')) {
            return Promise.reject(error);
        }

        // 401이 아니거나 이미 재시도 했거나, 애초에 인증 헤더 없이 간 요청이면 패스
        if (status !== 401 || original?.__isRetryRequest || !original?.__hadAuth) {
            return Promise.reject(error);
        }

        // -------- refresh 한번만
        if (!isRefreshing) {
            isRefreshing = true;
            try {
                const { data } = await axios.post(
                    '/bgm-agit/refresh',
                    null,
                    {
                        baseURL: api.defaults.baseURL,
                        withCredentials: true, // HttpOnly refresh 쿠키 전송
                    }
                );

                const newToken = (data as any)?.token;
                if (!newToken) throw new Error('No access token from refresh');

                // 저장 키 통일!
                localStorage.setItem(TOKEN_KEY, newToken);
                // 이후 요청 기본값에도 반영
                api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

                isRefreshing = false;
                notifyAll(newToken);
            } catch (e) {
                isRefreshing = false;
                waiters = [];
                localStorage.removeItem(TOKEN_KEY);
                return Promise.reject(e);
            }
        }

        // -------- refresh 완료 대기 후, 원요청 "한 번만" 재시도
        return new Promise((resolve, reject) => {
            addWaiter((token: string) => {
                try {
                    original.__isRetryRequest = true;
                    original.headers = original.headers ?? {};
                    (original.headers as any)['Authorization'] = `Bearer ${token}`;
                    resolve(api(original));
                } catch (e) {
                    reject(e);
                }
            });
        });
    }
);

export default api;
