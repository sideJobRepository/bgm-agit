import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

declare global {
  interface Window {
    Kakao: any;
  }
}

//kakao
if (window.Kakao && !window.Kakao.isInitialized()) {
  window.Kakao.init(import.meta.env.VITE_KAKAO_JS_KEY);
}

createRoot(document.getElementById('root')!).render(<App />);
