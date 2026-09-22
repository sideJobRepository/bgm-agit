package com.bgmagitapi.origin.payment.util;

import java.util.Map;

/**
 * 토스 에러 코드 → 손님이 읽을 한국어 안내 문구.
 * 매핑에 없는 코드는 토스가 준 message 를 그대로 쓴다(사유를 잃지 않도록).
 */
public final class TossErrorMessages {

    private static final String DEFAULT_MESSAGE = "결제 처리 중 오류가 발생했습니다.";

    private static final Map<String, String> MESSAGES = Map.ofEntries(
            // 인앱브라우저에서 카드앱에 다녀온 뒤 돌아왔을 때 나는 대표 코드(결제창 세션이 끊김)
            Map.entry("NOT_FOUND_PAYMENT_SESSION", "결제 시간이 만료되었거나 결제창이 종료되었습니다. 예약내역에서 다시 결제해 주세요."),
            Map.entry("ALREADY_PROCESSED_PAYMENT", "이미 처리된 결제입니다. 예약내역에서 확정 여부를 확인해 주세요."),
            Map.entry("REJECT_CARD_COMPANY", "카드사에서 결제를 거절했습니다. 다른 카드로 시도해 주세요."),
            Map.entry("INVALID_REJECT_CARD", "카드 사용이 거절되었습니다. 한도·잔액을 확인해 주세요."),
            Map.entry("INVALID_STOPPED_CARD", "정지된 카드입니다. 다른 카드로 시도해 주세요."),
            Map.entry("INVALID_CARD_EXPIRATION", "카드 유효기간 정보가 올바르지 않습니다."),
            Map.entry("EXCEED_MAX_DAILY_PAYMENT_COUNT", "일일 결제 한도를 초과했습니다. 내일 다시 시도하거나 다른 카드를 사용해 주세요."),
            Map.entry("EXCEED_MAX_AMOUNT", "결제 한도를 초과했습니다."),
            Map.entry("CARD_PROCESSING_ERROR", "카드사 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요."),
            Map.entry("PROVIDER_ERROR", "결제 대행사에서 오류가 발생했습니다. 잠시 후 다시 시도해 주세요."),
            // 키 설정 사고는 손님이 할 수 있는 게 없다. 문의로 유도
            Map.entry("UNAUTHORIZED_KEY", "결제 설정 오류입니다. 관리자에게 문의해 주세요."),
            Map.entry("FORBIDDEN_REQUEST", "결제 설정 오류입니다. 관리자에게 문의해 주세요.")
    );

    private TossErrorMessages() {
    }

    /** 코드에 매핑된 안내 문구. 없으면 fallback(토스 message), 그것도 없으면 기본 문구 */
    public static String toUserMessage(String code, String fallback) {
        String mapped = code == null ? null : MESSAGES.get(code);
        if (mapped != null) {
            return mapped;
        }
        return fallback == null || fallback.isBlank() ? DEFAULT_MESSAGE : fallback;
    }
}
