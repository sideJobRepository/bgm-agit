import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // 환경변수로 설정
  timeout: 60000,
  withCredentials: true,
});

export default api;
