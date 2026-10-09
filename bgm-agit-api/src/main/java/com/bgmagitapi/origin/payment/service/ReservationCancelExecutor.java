package com.bgmagitapi.origin.payment.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.concurrent.TimeUnit;
import java.util.concurrent.locks.ReentrantLock;
import java.util.function.Supplier;

/**
 * 예약 취소(=환불)를 한 줄로 세우는 실행기. {@code PaymentConfirmExecutor} 와 같은 구조다.
 *
 * <p>취소 경로에는 원래 락도 멱등성도 없었다. 전액취소만 하던 시절에는 1회차 취소로 결제가
 * CANCELED 가 되어 2회차에는 대상이 없었고, 설령 동시에 들어와도 토스가 ALREADY_CANCELED_PAYMENT 로
 * 막아줬다. 부분환불이 들어오면 사정이 달라진다 — 잔액이 남아 있으면 토스는 두 번째 요청도 받아준다.
 *
 * <p>결제행 비관적 락만으로는 부족하다. 락은 트랜잭션이 끝나야 풀리는데, 커밋은 프록시가
 * 메서드 반환 <b>뒤에</b> 하므로 트랜잭션 메서드 안에서 잠그면 뒤 스레드가 미커밋 상태를 본다.
 * 그래서 트랜잭션 <b>바깥</b>에서 감싼다.
 *
 * <p><b>서버 인스턴스 1대 전제.</b> 다중화하면 DB 락이나 분산 락이 필요하다.
 */
@Slf4j
@Component
public class ReservationCancelExecutor {

    private static final long LOCK_TIMEOUT_SECONDS = 60;

    // 공정 모드: 먼저 온 요청이 먼저 처리된다(대기 손님이 굶지 않도록)
    private final ReentrantLock lock = new ReentrantLock(true);

    public <T> T execute(Supplier<T> action) {
        boolean acquired = false;
        try {
            acquired = lock.tryLock(LOCK_TIMEOUT_SECONDS, TimeUnit.SECONDS);
            if (!acquired) {
                log.warn("[payment] 취소 직렬화 락 획득 실패");
                throw new IllegalStateException("요청이 많아 취소를 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.");
            }
            return action.get();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("취소 처리가 중단되었습니다. 잠시 후 다시 시도해 주세요.");
        } finally {
            if (acquired) {
                lock.unlock();
            }
        }
    }
}
