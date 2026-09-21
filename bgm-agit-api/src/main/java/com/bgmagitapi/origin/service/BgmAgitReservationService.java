package com.bgmagitapi.origin.service;

import com.bgmagitapi.origin.apiresponse.ApiResponse;
import com.bgmagitapi.origin.controller.request.BgmAgitReservationCreateRequest;
import com.bgmagitapi.origin.controller.request.BgmAgitReservationModifyRequest;
import com.bgmagitapi.origin.controller.request.BgmAgitReservationPeopleRequest;
import com.bgmagitapi.origin.controller.response.BgmAgitReservationResponse;
import com.bgmagitapi.origin.controller.response.reservation.AdminReservationBoardResponse;
import com.bgmagitapi.origin.controller.response.reservation.AvailableRoomsResponse;
import com.bgmagitapi.origin.controller.response.reservation.GroupedReservationResponse;
import com.bgmagitapi.origin.payment.controller.response.PaymentOrderResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;

public interface BgmAgitReservationService {

    BgmAgitReservationResponse getReservation(Long labelGb, String link, Long id,LocalDate date);

    /**
     * 항목 여러 개를 합쳐 예약할 때(예: M-1 + M-2) 쓰는 조회.
     * 가능 시간대는 선택 항목 전체의 교집합, 최대인원은 합산으로 내려준다.
     */
    BgmAgitReservationResponse getReservation(Long labelGb, String link, Long id, List<Long> extraIds, LocalDate date);

    /**
     * 특정 날짜에 항목별로 몇 개 시간대가 남았는지. 방을 고르기 전 단계에서 쓴다.
     * 선택 가능한 실제 시간대는 getReservation 이 유일한 출처이며 여기서는 개수만 내려준다.
     */
    AvailableRoomsResponse getAvailableRooms(Long labelGb, String link, LocalDate date);

    ApiResponse createReservation(BgmAgitReservationCreateRequest request, Long jwt);

    Page<GroupedReservationResponse> getReservationDetail(Long memberId, List<String> roles, String startDate, String endDate, Pageable pageable);

    /**
     * 관리자 예약 현황판. 하루치 예약을 예약장소 × 시간축으로 묶어서 반환한다.
     * 회원 연락처가 그대로 나가므로 관리자 외에는 차단한다.
     */
    AdminReservationBoardResponse getReservationBoard(LocalDate date, List<String> roles);

    ApiResponse modifyReservation(Long id, BgmAgitReservationModifyRequest request, List<String> roles);

    /**
     * 예약 인원 축소. 확정건이면 줄어든 인원만큼의 차액을 환불 규정 비율대로 돌려준다.
     * 증원은 받지 않는다(현장 워크인 결제).
     */
    ApiResponse modifyReservationPeople(Long userId, BgmAgitReservationPeopleRequest request, List<String> roles);

    // 예약 결제 주문 생성: 예약 검증·금액계산 후 공통 PaymentService.createOrder 호출
    PaymentOrderResponse createPaymentOrder(Long reservationNo, Long userId);
}
