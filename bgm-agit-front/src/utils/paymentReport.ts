import api from './axiosInstance.ts';

/**
 * 결제 실패 사유를 서버에 남긴다(READY 로 남은 주문행의 실패 원인 추적용).
 *
 * 기록 실패가 사용자 화면에 보이면 안 되므로 결과를 기다리지 않고 예외도 전부 삼킨다.
 * 서버 계약: POST /bgm-agit/payments/fail { orderId, code, message } → 200, 바디 없음.
 */
export function reportPaymentFailure(
  orderId: string | null | undefined,
  code: string | null,
  message: string | null,
): void {
  if (!orderId) return;

  api.post('/bgm-agit/payments/fail', { orderId, code, message }).catch(() => {});
}
