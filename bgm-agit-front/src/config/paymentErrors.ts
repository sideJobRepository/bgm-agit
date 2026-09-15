/**
 * 토스페이먼츠 SDK 가 requestPayment 거절 시 던지는 에러코드 → 사용자 문구.
 *
 * 예전엔 취소 코드 2개만 걸러내고 나머지를 전부 "결제 요청이 취소되었거나 실패했습니다."로
 * 뭉뚱그려서, 사용자가 바로 고칠 수 있는 사유도 안 보였다.
 * 매핑은 최소한만 둔다 — 결제수단 선택·약관은 토스 결제창이 직접 처리하므로 그쪽 거절 문구가
 * 이미 한국어로 오고, 매핑에 없는 코드는 SDK message 를 그대로 노출하는 편이 낫다.
 */

/** 사용자가 스스로 닫거나 취소한 경우. 토스트를 띄우지 않는다. */
export const SILENT_PAYMENT_ERROR_CODES = ['USER_CANCEL', 'PAY_PROCESS_CANCELED'];

const PAYMENT_ERROR_MESSAGES: Record<string, string> = {
  PAY_PROCESS_ABORTED: '결제가 중단되었습니다. 잠시 후 다시 시도해 주세요.',
  INVALID_REQUEST: '결제 요청 정보가 올바르지 않습니다. 새로고침 후 다시 시도해 주세요.',
  INVALID_API_KEY: '결제 설정 오류입니다. 관리자에게 문의해 주세요.',
  NOT_FOUND_PAYMENT_SESSION:
    '결제 시간이 만료되었거나 결제창이 종료되었습니다. 예약내역에서 다시 결제해 주세요.',
};

const FALLBACK_MESSAGE = '결제 요청이 취소되었거나 실패했습니다.';

function asRecord(error: unknown): Record<string, unknown> | null {
  if (typeof error !== 'object' || error === null) return null;
  return error as Record<string, unknown>;
}

/** 에러 객체에서 토스 에러코드를 뽑는다(리포트·분기용). 없으면 null. */
export function getPaymentErrorCode(error: unknown): string | null {
  const record = asRecord(error);
  const code = record?.code;
  return typeof code === 'string' && code ? code : null;
}

/** 에러 객체에서 SDK 가 준 메시지를 뽑는다. 없으면 null. */
export function getPaymentErrorRawMessage(error: unknown): string | null {
  const record = asRecord(error);
  const message = record?.message;
  return typeof message === 'string' && message ? message : null;
}

/**
 * 사용자에게 보여줄 문구. null 이면 조용히 무시해야 하는(사용자 취소) 상황이다.
 */
export function toPaymentErrorMessage(error: unknown): string | null {
  const code = getPaymentErrorCode(error);

  if (code && SILENT_PAYMENT_ERROR_CODES.includes(code)) {
    return null;
  }

  if (code && PAYMENT_ERROR_MESSAGES[code]) {
    return PAYMENT_ERROR_MESSAGES[code];
  }

  return getPaymentErrorRawMessage(error) ?? FALLBACK_MESSAGE;
}

/**
 * 토스가 failUrl 에 붙여주는 code/message 쿼리용. 에러 객체가 아니라 문자열을 받는다.
 * code 매핑이 있으면 그걸, 없으면 토스가 준 message, 둘 다 없으면 기본 문구.
 */
export function toPaymentFailMessage(
  code: string | null,
  message: string | null,
): string {
  if (code && PAYMENT_ERROR_MESSAGES[code]) {
    return PAYMENT_ERROR_MESSAGES[code];
  }
  return message ?? '결제가 완료되지 않았습니다.';
}
