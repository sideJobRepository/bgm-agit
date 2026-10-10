import Swal, { type SweetAlertIcon } from 'sweetalert2';
import { theme } from '../styles/theme.ts';

/**
 * 알림. 예전 react-toastify 의 toast.success / error / warning / info 와 같은 모양으로 부르면
 * SweetAlert2 창을 띄운다.
 *
 * - 성공·안내는 [확인] 을 누르거나 3초 뒤(짧게 넘겨도 최소 2.5초) 저절로 닫힌다
 * - 실패·경고는 [확인] 을 눌러야 닫힌다
 * - 창은 한 번에 하나라, 새 알림이 오면 앞 알림을 바꾼다
 * - heightAuto·scrollbarPadding 을 끈다. 켜 두면 html/body 높이·여백을 바꿔 화면이 흔들린다
 * - 줄바꿈은 메시지에 \n 을 넣는다(white-space: pre-line)
 */
const Alert = Swal.mixin({
  confirmButtonText: '확인',
  cancelButtonText: '닫기',
  confirmButtonColor: theme.colors.purpleColor,
  cancelButtonColor: theme.colors.danger,
  heightAuto: false,
  scrollbarPadding: false,
  returnFocus: false,
  customClass: { popup: 'bgm-alert' },
});

// 성공·안내가 저절로 닫히기까지. 예전 react-toastify 호출이 넘기는 autoClose 가 짧아도 MIN_MS 는 둔다.
// 실패·경고는 [확인] 을 눌러야 닫힌다(autoClose 를 넘겨도 무시)
const SUCCESS_MS = 3000;
const MIN_MS = 2500;

// 아이콘 색. bgm 로고 보라(theme.colors.purpleColor)를 바탕으로, 실패는 빨강
const ICON_COLORS: Record<SweetAlertIcon, string> = {
  success: theme.colors.purpleColor,
  error: theme.colors.danger,
  warning: '#f59e0b',
  info: '#6B4A94',
  question: '#6B4A94',
};

interface ToastOptions {
  autoClose?: number | false;
  // 예전 react-toastify 의 중복 방지 키. 창이 한 번에 하나라 쓰지 않는다
  toastId?: string;
}

// 종류별 제목. 메시지만 있으면 무슨 알림인지 한눈에 안 들어온다
const TITLES: Record<SweetAlertIcon, string> = {
  success: '완료',
  error: '확인해 주세요',
  warning: '잠깐만요',
  info: '알림',
  question: '확인',
};

const text = (message: unknown) => (message == null ? '' : String(message));

const fire = (icon: SweetAlertIcon, message: unknown, options: ToastOptions = {}) => {
  const closesItself = (icon === 'success' || icon === 'info') && options.autoClose !== false;
  const timer = closesItself
    ? Math.max(MIN_MS, typeof options.autoClose === 'number' ? options.autoClose : SUCCESS_MS)
    : undefined;
  return Alert.fire({
    icon,
    iconColor: ICON_COLORS[icon],
    title: TITLES[icon],
    text: text(message),
    timer,
  });
};

export const toast = {
  success: (message: unknown, options?: ToastOptions) => fire('success', message, options),
  error: (message: unknown, options?: ToastOptions) => fire('error', message, options),
  warning: (message: unknown, options?: ToastOptions) => fire('warning', message, options),
  info: (message: unknown, options?: ToastOptions) => fire('info', message, options),
};

export default toast;
