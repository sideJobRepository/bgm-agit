package com.bgmagitapi.origin.service;

import com.bgmagitapi.origin.apiresponse.ApiResponse;
import com.bgmagitapi.origin.controller.request.BgmAgitReservationChangeRequest;
import com.bgmagitapi.origin.controller.response.reservation.ReservationChangeOptionsResponse;
import com.bgmagitapi.origin.controller.response.reservation.ReservationChangeResponse;

import java.util.List;

/**
 * 예약 룸/인원 변경(사장님 확정 2026-11-02).
 * 감소·룸만 이동·미결제 예약은 즉시 반영, 확정 예약 증원은 추가결제 승인 때 반영(PaymentServiceImpl).
 * 변경 요청은 컨트롤러가 ReservationCancelExecutor 락으로 감싸서 부른다(환불·승인과 한 줄).
 */
public interface BgmAgitReservationChangeService {

    /** 변경 모달 옵션. people 이 null 이면 지금 인원. 소유자·관리자만 */
    ReservationChangeOptionsResponse getChangeOptions(Long userId, List<String> roles, Long reservationId, Integer people);

    /** 변경 요청 */
    ReservationChangeResponse change(Long userId, List<String> roles, BgmAgitReservationChangeRequest request);

    /**
     * 구 인원 변경 API(PUT /reservation/people) 호환 — 지금 방 그대로 인원만. 증원은 주문을 돌려줄 수 없어 거절한다.
     */
    ApiResponse changePeopleOnly(Long userId, Long reservationId, Integer people, List<String> roles);
}
