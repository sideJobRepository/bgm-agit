package com.bgmagitapi.origin.payment.schedule;

import com.bgmagitapi.origin.payment.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * 결제 테이블 정리 배치.
 * 예약금 결제 버튼을 누를 때마다 READY 주문행이 쌓이는데, 대부분은 승인까지 가지 않는다.
 * S3 임시파일 정리와 같은 새벽 1시에 돈다(같은 시각이지만 한쪽 실패가 다른 쪽을 막지 않도록 별도 컴포넌트).
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class BgmAgitPaymentSchedule {

    // 결제 진행 중인 주문을 지우지 않도록 넉넉히 하루는 남긴다
    private static final int RETENTION_DAYS = 1;

    private final PaymentService paymentService;

    @Scheduled(cron = "0 0 1 * * *", zone = "Asia/Seoul")
    public void cleanupAbandonedOrders() {
        try {
            paymentService.removeAbandonedOrders(RETENTION_DAYS);
        } catch (Exception e) {
            log.warn("[PAYMENT-CLEANUP] 스케줄러 실행 중 오류 cause={}", e.toString());
        }
    }
}
