package com.bgmagitapi.origin.payment.schedule;

import com.bgmagitapi.origin.payment.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * 결제 테이블 정리 배치.
 * 예약금 결제 버튼을 누를 때마다 READY 주문행이 쌓이는데, 대부분은 승인까지 가지 않는다.
 * 실패 이력(ABORTED)도 같이 정리하되 진단용이라 보존기간을 길게 둔다(DONE/CANCELED 는 절대 삭제하지 않음).
 * S3 임시파일 정리와 같은 새벽 1시에 돈다(같은 시각이지만 한쪽 실패가 다른 쪽을 막지 않도록 별도 컴포넌트).
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class BgmAgitPaymentSchedule {

    // 결제 진행 중인 주문을 지우지 않도록 넉넉히 남긴다.
    // 3일인 이유: 카드사 앱에서 브라우저로 복귀하지 못해 승인 요청 자체가 안 온 케이스는
    // 이 READY 행이 유일한 흔적이다(리다이렉트가 없어 실패 리포트도 안 들어온다).
    // 손님 문의를 받고 확인할 시간이 필요해 하루로는 짧다.
    private static final int RETENTION_DAYS = 3;

    // 실패 이력(ABORTED)은 "왜 결제가 안 됐나"를 되짚는 진단 자료라 한 달은 남긴다
    private static final int ABORTED_RETENTION_DAYS = 30;

    private final PaymentService paymentService;

    @Scheduled(cron = "0 0 1 * * *", zone = "Asia/Seoul")
    public void cleanupAbandonedOrders() {
        // READY 정리와 ABORTED 정리는 각각 try/catch. 한쪽이 실패해도 다른 쪽은 돌아야 한다
        try {
            paymentService.removeAbandonedOrders(RETENTION_DAYS);
        } catch (Exception e) {
            log.warn("[PAYMENT-CLEANUP] 스케줄러 실행 중 오류 cause={}", e.toString());
        }

        try {
            paymentService.removeOldAbortedOrders(ABORTED_RETENTION_DAYS);
        } catch (Exception e) {
            log.warn("[PAYMENT-CLEANUP] 실패 이력 정리 중 오류 cause={}", e.toString());
        }
    }
}
