package com.bgmagitapi.origin.payment.service.response;

import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.Comparator;
import java.util.List;

@Getter
@NoArgsConstructor
public class TossPaymentResponse {
    private String paymentKey;
    private String method;
    // 토스 결제 상태. 승인 API가 200을 줘도 가상계좌는 WAITING_FOR_DEPOSIT 로 온다(입금 전).
    // 부분취소 후에는 PARTIAL_CANCELED, 전액취소 후에는 CANCELED 가 온다.
    private String status;
    private String approvedAt;
    // 최초 결제 금액
    private Integer totalAmount;
    // 남은 금액(=취소 가능 잔액). 부분취소를 하면 줄어든다.
    private Integer balanceAmount;
    private Receipt receipt;
    private List<Cancel> cancels;

    public String getReceiptUrl() {
        return receipt == null ? null : receipt.getUrl();
    }

    /**
     * 누적 취소 금액. cancels 배열을 더하거나 최근 1건을 보는 대신 토스 원장의 차액을 쓴다.
     *
     * cancels 의 canceledAt 은 문자열 비교라 같은 초에 두 건이면 순서가 보장되지 않고,
     * "최근 1건"은 애초에 누적합이 아니다. 로컬에서 더하면 토스 원장과 갈릴 수 있다.
     */
    public Integer getCanceledAmount() {
        if (totalAmount == null || balanceAmount == null) {
            return null;
        }
        return totalAmount - balanceAmount;
    }

    public Cancel getLatestCancel() {
        if (cancels == null || cancels.isEmpty()) {
            return null;
        }
        return cancels.stream()
                .max(Comparator.comparing(Cancel::getCanceledAt, Comparator.nullsLast(String::compareTo)))
                .orElse(null);
    }

    @Getter
    @NoArgsConstructor
    public static class Receipt {
        private String url;
    }

    @Getter
    @NoArgsConstructor
    public static class Cancel {
        private Integer cancelAmount;
        private String cancelReason;
        private String canceledAt;
        private String transactionKey;
    }
}
