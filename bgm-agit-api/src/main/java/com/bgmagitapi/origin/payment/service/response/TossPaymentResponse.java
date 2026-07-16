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
    private String approvedAt;
    private Receipt receipt;
    private List<Cancel> cancels;

    public String getReceiptUrl() {
        return receipt == null ? null : receipt.getUrl();
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
    }
}
