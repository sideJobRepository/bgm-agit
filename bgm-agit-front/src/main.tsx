import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { setupPwa } from './utils/pwa.ts';

declare global {
  interface Window {
    Kakao: any;
  }
}

//kakao
if (window.Kakao && !window.Kakao.isInitialized()) {
  window.Kakao.init(import.meta.env.VITE_KAKAO_JS_KEY);
}

setupPwa();

createRoot(document.getElementById('root')!).render(<App />);
