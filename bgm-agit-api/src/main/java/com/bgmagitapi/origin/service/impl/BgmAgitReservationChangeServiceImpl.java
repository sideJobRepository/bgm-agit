package com.bgmagitapi.origin.service.impl;

import com.bgmagitapi.origin.advice.exception.ReservationConflictException;
import com.bgmagitapi.origin.apiresponse.ApiResponse;
import com.bgmagitapi.origin.controller.request.BgmAgitReservationChangeRequest;
import com.bgmagitapi.origin.controller.response.reservation.ReservationChangeOptionsResponse;
import com.bgmagitapi.origin.controller.response.reservation.ReservationChangeResponse;
import com.bgmagitapi.origin.controller.response.reservation.ReservedTimeDto;
import com.bgmagitapi.origin.controller.response.reservation.TimeRange;
import com.bgmagitapi.origin.entity.BgmAgitReservation;
import com.bgmagitapi.origin.entity.BgmAgitReservationChange;
import com.bgmagitapi.origin.entity.BgmAgitRoom;
import com.bgmagitapi.origin.entity.enumeration.ReservationChangeSettleType;
import com.bgmagitapi.origin.entity.enumeration.ReservationChangeStatus;
import com.bgmagitapi.origin.payment.controller.response.PaymentOrderResponse;
import com.bgmagitapi.origin.payment.repository.BgmAgitPaymentRepository;
import com.bgmagitapi.origin.payment.service.PaymentService;
import com.bgmagitapi.origin.payment.service.response.PaymentRefundResult;
import com.bgmagitapi.origin.repository.BgmAgitReservationChangeRepository;
import com.bgmagitapi.origin.repository.BgmAgitReservationRepository;
import com.bgmagitapi.origin.repository.BgmAgitRoomRepository;
import com.bgmagitapi.origin.service.BgmAgitReservationChangeService;
import com.bgmagitapi.origin.util.ReservationChangePolicy;
import com.bgmagitapi.origin.util.ReservationRefundPolicy;
import com.bgmagitapi.origin.util.SlotSchedule;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * 예약 룸/인원 변경(사장님 확정 2026-11-02).
 *
 * <ul>
 *   <li>증원(확정 예약, 손님): 늘어난 인원 × 원결제 단가를 추가결제. 결제 승인 순간 반영(PaymentServiceImpl) — 그 전엔 아무것도 안 바꾼다</li>
 *   <li>감소: 바로 반영 + 기존 환불 규정으로 부분환불</li>
 *   <li>룸만 이동·미결제 예약: 바로 반영(미결제는 결제할 때 새 인원으로 계산)</li>
 * </ul>
 * BgmAgitReservationServiceImpl 이 이미 커서 따로 뺐다. 결제 서비스만 의존한다(예약 서비스 의존 금지 — 순환).
 */
@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class BgmAgitReservationChangeServiceImpl implements BgmAgitReservationChangeService {

    private static final ZoneId KST = ZoneId.of("Asia/Seoul");
    private static final DateTimeFormatter HH_MM = DateTimeFormatter.ofPattern("HH:mm");

    private final BgmAgitReservationRepository bgmAgitReservationRepository;
    private final BgmAgitRoomRepository bgmAgitRoomRepository;
    private final BgmAgitReservationChangeRepository bgmAgitReservationChangeRepository;
    private final BgmAgitPaymentRepository bgmAgitPaymentRepository;
    private final PaymentService paymentService;

    // ===== 옵션 조회 =====

    @Override
    @Transactional(readOnly = true)
    public ReservationChangeOptionsResponse getChangeOptions(Long userId, List<String> roles, Long reservationId, Integer people) {
        BgmAgitReservation reservation = loadReservation(reservationId);
        boolean admin = isAdmin(roles);
        if (!admin && !Objects.equals(reservation.getMemberId(), userId)) {
            throw new ReservationConflictException("본인의 예약만 변경할 수 있습니다.");
        }

        LocalDateTime now = LocalDateTime.now(KST);
        LocalDateTime useStartAt = reservation.getUseStartAt();
        boolean flat = isFlat(reservation);
        String block = ReservationChangePolicy.blockReason(reservation.isCanceled(), flat, admin, useStartAt, now);

        int currentPeople = reservation.getBgmAgitReservationPeople() == null ? 0 : reservation.getBgmAgitReservationPeople();
        int target = people == null ? currentPeople : people;

        List<BgmAgitRoom> currentRooms = sortedRooms(reservation.getRoomList());
        List<Long> currentIds = idsOf(currentRooms);
        List<List<BgmAgitRoom>> sets = candidateSets(currentRooms, flat);

        // 스테퍼 범위는 빈 방 여부와 무관하게 모든 후보 집합의 최소 min ~ 최대 max.
        // 빈 방까지 반영하면 "이 인원이면 G Room 이 비었는지"를 손님이 볼 기회가 없어진다
        int peopleMin = sets.stream().mapToInt(this::floorOf).min().orElse(1);
        int peopleMax = sets.stream()
                .map(SlotSchedule::effectiveMaxPeople)
                .filter(Objects::nonNull)
                .mapToInt(Integer::intValue)
                .max()
                // 방에 최대 인원이 하나도 없으면(이상 데이터) 지금 인원을 상한으로 둔다
                .orElse(Math.max(currentPeople, target));
        peopleMax = Math.max(peopleMax, peopleMin);

        boolean approved = reservation.isApproved();
        Integer unitPrice = approved && !flat ? originalUnitPrice(reservationId) : null;
        int paidRemaining = approved
                ? bgmAgitPaymentRepository.findPaidAmountsByReservationIds(List.of(reservationId)).getOrDefault(reservationId, 0)
                : 0;
        int rate = ReservationRefundPolicy.refundRate(useStartAt, now);

        Set<Long> busy = busyRoomIds(reservation, sets.stream().flatMap(List::stream)
                .map(BgmAgitRoom::getBgmAgitRoomId).distinct().toList());
        List<ReservationChangeOptionsResponse.RoomOption> rooms = sets.stream()
                .filter(set -> fits(set, target))
                .filter(set -> set.stream().noneMatch(room -> busy.contains(room.getBgmAgitRoomId())))
                .map(set -> new ReservationChangeOptionsResponse.RoomOption(
                        idsOf(set),
                        labelOf(set),
                        SlotSchedule.effectiveMinPeople(set),
                        SlotSchedule.effectiveMaxPeople(set),
                        idsOf(set).equals(currentIds)))
                .sorted(Comparator.comparing((ReservationChangeOptionsResponse.RoomOption o) -> !o.isCurrent())
                        .thenComparing(ReservationChangeOptionsResponse.RoomOption::getLabel))
                .toList();

        int addPeople = Math.max(target - currentPeople, 0);
        int addAmount = approved && unitPrice != null ? addPeople * unitPrice : 0;
        int reducePeople = Math.max(currentPeople - target, 0);
        int refundAmount = approved && unitPrice != null
                ? Math.min(ReservationRefundPolicy.refundAmount(reducePeople * unitPrice, rate), paidRemaining)
                : 0;

        return ReservationChangeOptionsResponse.builder()
                .reservationId(reservationId)
                .reservationDate(reservation.getBgmAgitReservationStartDate() == null
                        ? null : reservation.getBgmAgitReservationStartDate().toString())
                .startTime(formatTime(reservation.getBgmAgitReservationStartTime()))
                .endTime(formatTime(reservation.getBgmAgitReservationEndTime()))
                .currentPeople(currentPeople)
                .currentRoomIds(currentIds)
                .currentRoomNames(reservation.getRoomNames())
                .people(target)
                .peopleMin(peopleMin)
                .peopleMax(peopleMax)
                .unitPrice(unitPrice)
                .approved(approved)
                .flat(flat)
                .refundRate(rate)
                .deadline(ReservationChangePolicy.formatDeadline(useStartAt))
                .changeable(block == null)
                .message(block)
                .rooms(rooms)
                .addPeople(addPeople)
                .addAmount(addAmount)
                .reducePeople(reducePeople)
                .refundPeople(approved ? reducePeople : 0)
                .refundAmount(Math.max(refundAmount, 0))
                .build();
    }

    // ===== 변경 요청 =====

    @Override
    public ReservationChangeResponse change(Long userId, List<String> roles, BgmAgitReservationChangeRequest request) {
        BgmAgitReservation reservation = loadReservation(request.getReservationId());
        Long reservationId = reservation.getBgmAgitReservationId();
        boolean admin = isAdmin(roles);
        boolean owner = Objects.equals(reservation.getMemberId(), userId);
        if (!admin && !owner) {
            throw new ReservationConflictException("본인의 예약만 변경할 수 있습니다.");
        }

        LocalDateTime now = LocalDateTime.now(KST);
        LocalDateTime useStartAt = reservation.getUseStartAt();
        boolean flat = isFlat(reservation);
        String block = ReservationChangePolicy.blockReason(reservation.isCanceled(), flat, admin, useStartAt, now);
        if (block != null) {
            throw new ReservationConflictException(block);
        }

        Integer currentPeople = reservation.getBgmAgitReservationPeople();
        if (currentPeople == null) {
            throw new ReservationConflictException("예약 인원 정보가 없어 변경할 수 없습니다. 매장으로 문의해 주세요.");
        }
        Integer newPeople = request.getPeople();
        if (newPeople == null || newPeople < 1) {
            throw new ReservationConflictException("예약 인원을 입력해 주세요.");
        }

        List<BgmAgitRoom> currentRooms = sortedRooms(reservation.getRoomList());
        List<Long> currentIds = idsOf(currentRooms);
        List<Long> requestedIds = normalizeIds(request.getRoomIds(), currentIds);
        boolean roomChanged = !requestedIds.equals(currentIds);

        if (flat && roomChanged) {
            throw new ReservationConflictException("마작 대탁은 룸을 변경할 수 없습니다. 인원만 정정할 수 있습니다.");
        }
        if (!roomChanged && newPeople.equals(currentPeople)) {
            // 증원 결제창을 띄웠다가 원래대로 되돌린 경우다. 옛 추가결제 주문이 다른 탭·카드앱에 남아 있다가
            // 뒤늦게 승인되면 손님은 취소했다고 생각한 변경이 과금과 함께 반영되므로 여기서도 끊는다.
            // 미결제 예약의 READY 주문은 원결제(인원 그대로라 유효)라 확정 예약일 때만 끊는다
            if (reservation.isApproved()
                    && bgmAgitReservationChangeRepository.abortPendingChanges(reservationId) > 0) {
                paymentService.abortReadyOrders(reservationId, "예약 변경 철회");
                return new ReservationChangeResponse(false, "결제 대기 중이던 예약 변경을 취소했습니다.", null);
            }
            return new ReservationChangeResponse(false, "변경할 내용이 없습니다.", null);
        }

        List<BgmAgitRoom> newRooms = roomChanged ? loadTargetRooms(requestedIds, currentRooms) : currentRooms;
        validatePeople(newRooms, newPeople);
        if (roomChanged) {
            ensureRoomsFree(reservation, requestedIds);
        }

        int delta = newPeople - currentPeople;
        boolean approved = reservation.isApproved();
        String beforeNames = reservation.getRoomNames();

        // 확정 예약 증원 → 추가결제. 결제 승인 순간 반영하므로 여기서는 예약을 건드리지 않는다
        // 현장 결제 처리는 두지 않는다(사장님 결정) — 늘어난 인원은 언제나 온라인 추가결제로 받는다
        if (!flat && approved && delta > 0) {
            if (!owner) {
                // 추가결제 주문은 결제할 사람(예약자) 명의로만 만든다
                throw new ReservationConflictException("인원 추가는 예약자가 예약내역에서 직접 추가결제해야 합니다.");
            }
            Integer unitPrice = originalUnitPrice(reservationId);
            if (unitPrice == null) {
                throw new ReservationConflictException("결제 단가 정보가 없어 인원을 늘릴 수 없습니다. 매장으로 문의해 주세요.");
            }
            int amount = delta * unitPrice;

            // 이전 결제 대기 변경과 그 주문은 무효. 옛 요청이 뒤늦게 승인되면 다른 내용으로 바뀐다
            bgmAgitReservationChangeRepository.abortPendingChanges(reservationId);
            paymentService.abortReadyOrders(reservationId, "새 예약 변경 요청");

            BgmAgitReservationChange change = bgmAgitReservationChangeRepository.save(new BgmAgitReservationChange(
                    reservationId, userId, currentPeople, newPeople, currentIds, requestedIds,
                    amount, ReservationChangeStatus.PENDING, ReservationChangeSettleType.TOSS));

            String orderName = "BGM아지트 예약 변경 - " + reservation.getBgmAgitReservationStartDate() + " (+" + delta + "명)";
            PaymentOrderResponse order = paymentService.createChangeOrder(
                    userId, reservationId, change.getBgmAgitReservationChangeId(), amount, delta, unitPrice, orderName);

            String message = "추가 인원 " + delta + "명 " + String.format("%,d", amount) + "원을 결제하면 변경이 완료됩니다.";
            return new ReservationChangeResponse(false, message, order);
        }

        // ===== 즉시 반영 =====
        // DB 변경을 전부 먼저 하고 flush 한 뒤 토스 환불을 <b>마지막</b>에 부른다.
        // 환불을 먼저 하면 뒤의 쓰기(방 교체·이력 INSERT)가 실패할 때 돈은 나갔는데 예약·결제행은 롤백되고,
        // 같은 요청을 다시 보내면 롤백돼 부푼 로컬 잔액 기준으로 또 환불된다.
        int refundPeople = delta < 0 && !flat && approved ? -delta : 0;

        if (roomChanged) {
            reservation.replaceRooms(newRooms);
        }
        reservation.changePeople(newPeople);

        // 예약 내용이 바뀌었으니 결제 대기 중인 변경·주문은 옛 기준이다. 미결제 예약의 원결제 주문도 옛 인원 금액이라 끊는다
        bgmAgitReservationChangeRepository.abortPendingChanges(reservationId);
        paymentService.abortReadyOrders(reservationId, "예약 변경");

        // saveAndFlush 로 방 교체(orphan DELETE/INSERT)·인원·이력까지 여기서 내보내 제약조건 오류를 돈이 움직이기 전에 드러낸다
        BgmAgitReservationChange history = bgmAgitReservationChangeRepository.saveAndFlush(new BgmAgitReservationChange(
                reservationId, userId, currentPeople, newPeople, currentIds, requestedIds,
                0, ReservationChangeStatus.APPLIED, ReservationChangeSettleType.NONE));

        PaymentRefundResult refund = null;
        if (refundPeople > 0) {
            int rate = ReservationRefundPolicy.refundRate(useStartAt, now);
            refund = paymentService.refundPeopleReduction(reservationId, refundPeople, rate, "예약 변경(인원 감소)");
            // 토스가 거절했고 한 푼도 안 나갔으면 변경도 되돌린다(예외 → 롤백). 인원만 줄고 환불이 없으면
            // 그 차액이 영영 돌아가지 않는다. 타임아웃처럼 처리 여부를 모르는 실패는 되돌리지 않는다(이중 환불 방지)
            if (refund.failed() && refund.rejected() && refund.refundedAmount() == 0) {
                throw new ReservationConflictException(
                        "환불이 처리되지 않아 예약을 변경하지 않았습니다. 매장으로 문의해 주세요. (" + refund.failMessage() + ")");
            }
            history.recordRefund(refund.refundedAmount());
        }

        String afterNames = labelOf(newRooms);
        StringBuilder message = new StringBuilder("예약이 변경되었습니다. (")
                .append(roomChanged ? beforeNames + " → " + afterNames : afterNames)
                .append(", ").append(newPeople).append("명)");
        if (refund != null) {
            if (refund.failed()) {
                message.append(" 환불 처리 중 문제가 있어 확인 후 안내드리겠습니다. (").append(refund.failMessage()).append(")");
            } else if (refund.refundedAmount() > 0) {
                message.append(" ").append(String.format("%,d", refund.refundedAmount())).append("원이 환불됩니다.");
            } else {
                message.append(" 환불 규정에 따라 환불 금액은 없습니다.");
            }
        }
        if (!approved && !flat && delta != 0) {
            message.append(" 결제 시 변경된 인원으로 금액이 계산됩니다.");
        }
        return new ReservationChangeResponse(true, message.toString(), null);
    }

    @Override
    public ApiResponse changePeopleOnly(Long userId, Long reservationId, Integer people, List<String> roles) {
        BgmAgitReservation reservation = loadReservation(reservationId);
        Integer currentPeople = reservation.getBgmAgitReservationPeople();
        if (people != null && currentPeople != null && people > currentPeople) {
            throw new ReservationConflictException(
                    "예약 인원은 줄일 수만 있습니다. 인원을 늘리려면 예약내역의 [예약 변경]을 이용해 주세요.");
        }
        BgmAgitReservationChangeRequest request = new BgmAgitReservationChangeRequest(
                reservationId, people, reservation.getRoomIds());
        ReservationChangeResponse response = change(userId, roles, request);
        return new ApiResponse(200, true, response.getMessage());
    }

    // ===== 내부 =====

    private BgmAgitReservation loadReservation(Long reservationId) {
        return bgmAgitReservationRepository.findReservationWithRooms(reservationId)
                .orElseThrow(() -> new ReservationConflictException("존재하지 않는 예약입니다."));
    }

    private boolean isFlat(BgmAgitReservation reservation) {
        return reservation.isMahjong()
                || SlotSchedule.isFlatPricing(reservation.getRoomList(), reservation.getBgmAgitReservationStartDate());
    }

    /**
     * 후보 방 집합 — 지금 방 집합(숨김이어도 포함) + 같은 메뉴 링크의 숨김 아닌 방 단독·허용 조합.
     * 마작 대탁은 룸 변경이 없어 지금 집합만. 링크가 같아야 룸↔마작 이동이 안 생긴다.
     */
    private List<List<BgmAgitRoom>> candidateSets(List<BgmAgitRoom> currentRooms, boolean flat) {
        List<List<BgmAgitRoom>> sets = new ArrayList<>();
        if (!currentRooms.isEmpty()) {
            sets.add(currentRooms);
        }
        if (flat || currentRooms.isEmpty()) {
            return sets;
        }
        List<Long> currentIds = idsOf(currentRooms);
        String link = currentRooms.get(0).getBgmAgitRoomLink();
        for (List<BgmAgitRoom> set : SlotSchedule.combinableSets(
                bgmAgitRoomRepository.findReservableRooms(link), BgmAgitRoom::getBgmAgitRoomName)) {
            List<BgmAgitRoom> sorted = sortedRooms(set);
            if (!idsOf(sorted).equals(currentIds)) {
                sets.add(sorted);
            }
        }
        return sets;
    }

    /** 다른 방으로 옮길 때의 대상 방 검증. 숨김·다른 메뉴·허용되지 않은 조합은 거절 */
    private List<BgmAgitRoom> loadTargetRooms(List<Long> roomIds, List<BgmAgitRoom> currentRooms) {
        List<BgmAgitRoom> rooms = sortedRooms(bgmAgitRoomRepository.findAllById(roomIds));
        if (rooms.size() != roomIds.size()) {
            throw new ReservationConflictException("존재하지 않는 룸입니다.");
        }
        if (rooms.stream().anyMatch(BgmAgitRoom::isHidden)) {
            throw new ReservationConflictException("예약이 종료된 룸으로는 변경할 수 없습니다.");
        }
        String link = currentRooms.isEmpty() ? null : currentRooms.get(0).getBgmAgitRoomLink();
        if (link == null || rooms.stream().anyMatch(room -> !Objects.equals(room.getBgmAgitRoomLink(), link))) {
            throw new ReservationConflictException("같은 종류의 룸으로만 변경할 수 있습니다.");
        }
        List<String> names = rooms.stream().map(BgmAgitRoom::getBgmAgitRoomName).toList();
        if (!SlotSchedule.isCombinable(names)) {
            throw new ReservationConflictException("함께 예약할 수 없는 룸 조합입니다.");
        }
        return rooms;
    }

    /** 결제 승인 재검증과 같은 기준 — 이 예약의 이용 구간과 겹치는 다른 확정 예약이 없어야 한다 */
    private void ensureRoomsFree(BgmAgitReservation reservation, List<Long> roomIds) {
        if (!busyRoomIds(reservation, roomIds).isEmpty()) {
            throw new ReservationConflictException("선택한 룸은 그 시간대에 이미 다른 예약이 있습니다.");
        }
    }

    /** 이 예약의 이용 구간과 겹치는 확정 예약(자기 제외)이 있는 방 id */
    private Set<Long> busyRoomIds(BgmAgitReservation reservation, List<Long> roomIds) {
        SlotSchedule.Slot mine = reservation.getUseRange();
        if (mine == null || roomIds.isEmpty()) {
            return Set.of();
        }
        Set<Long> busy = new HashSet<>();
        for (ReservedTimeDto dto : bgmAgitReservationRepository.findConfirmedReservations(
                roomIds, reservation.getBgmAgitReservationStartDate(), reservation.getBgmAgitReservationId())) {
            if (dto.getDate() == null || dto.getStartTime() == null || dto.getEndTime() == null) {
                continue;
            }
            TimeRange other = dto.toTimeRange();
            if (SlotSchedule.isOverlapping(mine.start(), mine.end(), other.getStart(), other.getEnd())) {
                busy.add(dto.getRoomId());
            }
        }
        return busy;
    }

    /** 원결제 1인 단가 스냅샷(벙주가면 벙주 단가). 추가결제·환불 예상액이 이 값을 쓴다 */
    private Integer originalUnitPrice(Long reservationId) {
        return bgmAgitPaymentRepository.findUnitPricesByReservationIds(List.of(reservationId)).get(reservationId);
    }

    private void validatePeople(List<BgmAgitRoom> rooms, Integer people) {
        Integer min = SlotSchedule.effectiveMinPeople(rooms);
        Integer max = SlotSchedule.effectiveMaxPeople(rooms);
        if (min != null && people < min) {
            throw new ReservationConflictException("최소 " + min + "명부터 예약할 수 있습니다.");
        }
        if (max != null && people > max) {
            throw new ReservationConflictException("최대 " + max + "명까지 예약할 수 있습니다.");
        }
    }

    private boolean fits(List<BgmAgitRoom> rooms, int people) {
        Integer min = SlotSchedule.effectiveMinPeople(rooms);
        Integer max = SlotSchedule.effectiveMaxPeople(rooms);
        return people >= 1 && (min == null || people >= min) && (max == null || people <= max);
    }

    /** 방 집합의 인원 하한(값이 없으면 1) */
    private int floorOf(List<BgmAgitRoom> rooms) {
        Integer min = SlotSchedule.effectiveMinPeople(rooms);
        return min == null ? 1 : Math.max(min, 1);
    }

    /** 요청 방 id 정리(중복·null 제거, 오름차순). 비면 지금 방 그대로 */
    private List<Long> normalizeIds(List<Long> roomIds, List<Long> currentIds) {
        if (roomIds == null) {
            return currentIds;
        }
        List<Long> ids = roomIds.stream().filter(Objects::nonNull).distinct().sorted().toList();
        return ids.isEmpty() ? currentIds : ids;
    }

    private static List<BgmAgitRoom> sortedRooms(List<BgmAgitRoom> rooms) {
        return rooms.stream()
                .filter(Objects::nonNull)
                .sorted(Comparator.comparing(BgmAgitRoom::getBgmAgitRoomId))
                .toList();
    }

    private static List<Long> idsOf(List<BgmAgitRoom> rooms) {
        return rooms.stream().map(BgmAgitRoom::getBgmAgitRoomId).distinct().sorted().toList();
    }

    private static String labelOf(List<BgmAgitRoom> rooms) {
        return rooms.stream()
                .map(BgmAgitRoom::getBgmAgitRoomName)
                .filter(Objects::nonNull)
                .distinct()
                .collect(Collectors.joining(", "));
    }

    private static String formatTime(LocalTime time) {
        return time == null ? null : time.format(HH_MM);
    }

    private boolean isAdmin(List<String> roles) {
        if (roles == null) {
            return false;
        }
        return roles.contains("ROLE_ADMIN") || roles.contains("ADMIN");
    }
}
