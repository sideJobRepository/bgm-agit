package com.bgmagitapi.origin.payment.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.concurrent.TimeUnit;
import java.util.concurrent.locks.ReentrantLock;
import java.util.function.Function;
import java.util.function.Supplier;

/**
 * 돈이 움직이는 예약 작업(결제 승인·예약 취소=환불·인원 축소=차액 환불)을 <b>한 줄로</b> 세우는 실행기.
 *
 * <p>취소 경로에는 원래 락도 멱등성도 없었다. 전액취소만 하던 시절에는 1회차 취소로 결제가
 * CANCELED 가 되어 2회차에는 대상이 없었고, 설령 동시에 들어와도 토스가 ALREADY_CANCELED_PAYMENT 로
 * 막아줬다. 부분환불이 들어오면 사정이 달라진다 — 잔액이 남아 있으면 토스는 두 번째 요청도 받아준다.
 *
 * <p><b>승인도 같은 락을 쓴다.</b> 예전에는 승인은 {@code PaymentConfirmExecutor} 의 락, 취소·인원변경은
 * 이 락이라 둘이 동시에 돌 수 있었다. 승인이 예약(미취소)·금액을 읽고 토스 응답을 기다리는 사이 취소가
 * 커밋되면, 취소 쪽은 DONE 결제가 없어 환불 0원으로 끝나고 승인 쪽은 그 뒤 결제를 DONE 으로 덮어
 * "취소됐는데 돈은 빠진" 예약이 남았다. 인원 축소도 같은 창으로 옛 인원 금액이 과금됐다.
 * 한 락으로 묶으면 승인은 취소·인원변경이 <b>커밋된 뒤의</b> 예약을 보고 시작한다.
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

    // 토스 승인 읽기 타임아웃(30초)보다 넉넉히 기다린다
    private static final long LOCK_TIMEOUT_SECONDS = 60;

    // 공정 모드: 먼저 온 요청이 먼저 처리된다(대기 손님이 굶지 않도록)
    private final ReentrantLock lock = new ReentrantLock(true);

    public <T> T execute(Supplier<T> action) {
        return execute(action,
                interrupted -> new IllegalStateException(interrupted
                        ? "취소 처리가 중단되었습니다. 잠시 후 다시 시도해 주세요."
                        : "요청이 많아 취소를 처리하지 못했습니다. 잠시 후 다시 시도해 주세요."));
    }

    /**
     * @param busyException 락을 못 잡았을 때 던질 예외. 인자는 인터럽트 여부(true)/대기 시간 초과(false)
     */
    public <T> T execute(Supplier<T> action, Function<Boolean, RuntimeException> busyException) {
        boolean acquired;
        try {
            acquired = lock.tryLock(LOCK_TIMEOUT_SECONDS, TimeUnit.SECONDS);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw busyException.apply(true);
        }
        if (!acquired) {
            log.warn("[payment] 결제·취소 직렬화 락 획득 실패");
            throw busyException.apply(false);
        }
        try {
            return action.get();
        } finally {
            lock.unlock();
        }
    }
}
