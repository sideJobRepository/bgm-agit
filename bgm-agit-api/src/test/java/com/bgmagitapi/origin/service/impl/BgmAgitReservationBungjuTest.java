package com.bgmagitapi.origin.service.impl;

import com.bgmagitapi.origin.advice.exception.ReservationConflictException;
import com.bgmagitapi.origin.controller.request.BgmAgitReservationCreateRequest;
import com.bgmagitapi.origin.entity.BgmAgitBungjuSetting;
import com.bgmagitapi.origin.entity.BgmAgitMember;
import com.bgmagitapi.origin.entity.BgmAgitMemberRole;
import com.bgmagitapi.origin.entity.BgmAgitReservation;
import com.bgmagitapi.origin.entity.BgmAgitRole;
import com.bgmagitapi.origin.entity.BgmAgitRoom;
import com.bgmagitapi.origin.entity.enumeration.Reservation;
import com.bgmagitapi.origin.payment.controller.response.PaymentOrderResponse;
import com.bgmagitapi.origin.payment.repository.BgmAgitPaymentRepository;
import com.bgmagitapi.origin.payment.service.PaymentService;
import com.bgmagitapi.origin.repository.BgmAgitBungjuSettingRepository;
import com.bgmagitapi.origin.repository.BgmAgitMemberRepository;
import com.bgmagitapi.origin.repository.BgmAgitMemberRoleRepository;
import com.bgmagitapi.origin.repository.BgmAgitMonthlyPassRepository;
import com.bgmagitapi.origin.repository.BgmAgitReservationRepository;
import com.bgmagitapi.origin.repository.BgmAgitRoomRepository;
import com.bgmagitapi.origin.service.BgmAgitHolidayService;
import com.bgmagitapi.origin.util.SlotSchedule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.beans.BeanUtils;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * 벙주 혜택가(설정 기간 안의 평일 룸) + 회원 1명당 하루 1룸 — 예약 등록·결제 주문.
 * 벙주 판정은 실제 BgmAgitBungjuServiceImpl 을 쓰고 저장소만 목으로 둔다. DB 를 쓰지 않는다.
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class BgmAgitReservationBungjuTest {

    private static final Long USER_ID = 100L;
    private static final LocalDate NOV_1 = LocalDate.of(2026, 11, 1);   // 일요일(혜택 기간 전)
    private static final LocalDate NOV_2 = LocalDate.of(2026, 11, 2);   // 월요일
    private static final LocalDate NOV_7 = LocalDate.of(2026, 11, 7);   // 토요일
    private static final LocalDate DEC_7 = LocalDate.of(2026, 12, 7);   // 월요일(기간 밖)

    @Mock BgmAgitRoomRepository bgmAgitRoomRepository;
    @Mock BgmAgitMemberRepository bgmAgitMemberRepository;
    @Mock BgmAgitReservationRepository bgmAgitReservationRepository;
    @Mock ApplicationEventPublisher eventPublisher;
    @Mock PaymentService paymentService;
    @Mock BgmAgitPaymentRepository bgmAgitPaymentRepository;
    @Mock BgmAgitHolidayService bgmAgitHolidayService;
    @Mock BgmAgitMonthlyPassRepository bgmAgitMonthlyPassRepository;
    @Mock BgmAgitMemberRoleRepository bgmAgitMemberRoleRepository;
    @Mock BgmAgitBungjuSettingRepository bgmAgitBungjuSettingRepository;

    @InjectMocks BgmAgitReservationServiceImpl service;

    private BgmAgitRoom bRoom;
    private BgmAgitRoom table;
    private BgmAgitMember member;
    private BgmAgitBungjuSetting setting;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(service, "bgmAgitBungjuService", new BgmAgitBungjuServiceImpl(
                bgmAgitBungjuSettingRepository, bgmAgitMemberRoleRepository,
                bgmAgitReservationRepository, bgmAgitPaymentRepository));

        setting = BeanUtils.instantiateClass(BgmAgitBungjuSetting.class);
        ReflectionTestUtils.setField(setting, "bgmAgitBungjuSettingId", BgmAgitBungjuSetting.SINGLE_ID);
        setting.modify(NOV_2, LocalDate.of(2026, 11, 30), 5000, true);
        when(bgmAgitBungjuSettingRepository.findById(BgmAgitBungjuSetting.SINGLE_ID)).thenReturn(Optional.of(setting));

        bRoom = room(1L, "B Room", BgmAgitRoom.LINK_ROOM, 4, 6);
        table = room(5L, "대탁 1", BgmAgitRoom.LINK_MAHJONG, 4, 4);
        when(bgmAgitRoomRepository.findById(1L)).thenReturn(Optional.of(bRoom));
        when(bgmAgitRoomRepository.findById(5L)).thenReturn(Optional.of(table));

        member = mock(BgmAgitMember.class);
        when(member.getBgmAgitMemberId()).thenReturn(USER_ID);
        when(bgmAgitMemberRepository.findById(USER_ID)).thenReturn(Optional.of(member));
        when(bgmAgitReservationRepository.findReservedTimesByRoomIdsAndDate(anyList(), any())).thenReturn(Map.of());
        when(bgmAgitReservationRepository.existsActiveRoomReservation(anyLong(), any())).thenReturn(false);
        when(bgmAgitHolidayService.isWeekendRate(NOV_7)).thenReturn(true);
    }

    private static BgmAgitRoom room(long id, String name, String link, int min, int max) {
        BgmAgitRoom room = new BgmAgitRoom(name, link, min, max, null, null, "Y");
        ReflectionTestUtils.setField(room, "bgmAgitRoomId", id);
        return room;
    }

    private void givenRole(String roleName) {
        BgmAgitRole role = mock(BgmAgitRole.class);
        when(role.getBgmAgitRoleName()).thenReturn(roleName);
        BgmAgitMemberRole memberRole = mock(BgmAgitMemberRole.class);
        when(memberRole.getBgmAgitRole()).thenReturn(role);
        when(bgmAgitMemberRoleRepository.findByBgmAgitMemberId(USER_ID)).thenReturn(Optional.of(memberRole));
    }

    private BgmAgitReservation create(long roomId, LocalDate date, List<String> times) {
        BgmAgitReservationCreateRequest request = new BgmAgitReservationCreateRequest();
        request.setRoomId(roomId);
        request.setBgmAgitReservationType("ROOM");
        request.setBgmAgitReservationStartDate(date + "T00:00:00+09:00");
        request.setBgmAgitReservationPeople(4);
        request.setStartTimeEndTime(times);
        service.createReservation(request, USER_ID);

        ArgumentCaptor<BgmAgitReservation> captor = ArgumentCaptor.forClass(BgmAgitReservation.class);
        verify(bgmAgitReservationRepository).save(captor.capture());
        return captor.getValue();
    }

    @Test
    @DisplayName("벙주가 혜택 기간 평일 룸을 예약하면 혜택 단가가 박힌다")
    void bungjuWeekday() {
        givenRole("BUNGJU");
        assertThat(create(1L, NOV_2, List.of("13:00", "14:00")).getBgmAgitReservationBungjuPrice()).isEqualTo(5000);
    }

    @Test
    @DisplayName("벙주라도 주말은 정가")
    void bungjuWeekend() {
        givenRole("BUNGJU");
        assertThat(create(1L, NOV_7, List.of("13:00")).isBungjuRate()).isFalse();
    }

    @Test
    @DisplayName("벙주라도 기간 밖(11/1, 12월)은 정가")
    void outOfPeriod() {
        givenRole("BUNGJU");
        assertThat(create(1L, DEC_7, List.of("13:00")).isBungjuRate()).isFalse();
    }

    @Test
    @DisplayName("설정을 끄면 벙주라도 정가")
    void settingOff() {
        givenRole("BUNGJU");
        setting.modify(NOV_2, LocalDate.of(2026, 11, 30), 5000, false);
        assertThat(create(1L, NOV_2, List.of("13:00")).isBungjuRate()).isFalse();
    }

    @Test
    @DisplayName("관리자가 바꾼 요금이 그대로 박힌다")
    void settingPrice() {
        givenRole("BUNGJU");
        setting.modify(NOV_2, LocalDate.of(2026, 11, 30), 6000, true);
        assertThat(create(1L, NOV_2, List.of("13:00")).getBgmAgitReservationBungjuPrice()).isEqualTo(6000);
    }

    @Test
    @DisplayName("월간패스 벙주 2명은 패스가 싸서(18,000-9,000 < 10,000) 혜택을 박지 않는다")
    void monthlyPassCheaper() {
        givenRole("BUNGJU");
        when(bgmAgitMonthlyPassRepository.coversMonth(anyLong(), any())).thenReturn(true);
        BgmAgitRoom cRoom = room(2L, "C Room", BgmAgitRoom.LINK_ROOM, 2, 6);
        when(bgmAgitRoomRepository.findById(2L)).thenReturn(Optional.of(cRoom));
        BgmAgitReservationCreateRequest request = new BgmAgitReservationCreateRequest();
        request.setRoomId(2L);
        request.setBgmAgitReservationType("ROOM");
        request.setBgmAgitReservationStartDate(NOV_2 + "T00:00:00+09:00");
        request.setBgmAgitReservationPeople(2);
        request.setStartTimeEndTime(List.of("13:00"));
        service.createReservation(request, USER_ID);
        ArgumentCaptor<BgmAgitReservation> captor = ArgumentCaptor.forClass(BgmAgitReservation.class);
        verify(bgmAgitReservationRepository).save(captor.capture());
        assertThat(captor.getValue().isBungjuRate()).isFalse();
    }

    @Test
    @DisplayName("월간패스 벙주 4명은 혜택이 싸서(20,000 < 27,000) 혜택을 박는다")
    void monthlyPassBungjuCheaper() {
        givenRole("BUNGJU");
        when(bgmAgitMonthlyPassRepository.coversMonth(anyLong(), any())).thenReturn(true);
        assertThat(create(1L, NOV_2, List.of("13:00")).getBgmAgitReservationBungjuPrice()).isEqualTo(5000);
    }

    @Test
    @DisplayName("일반 회원은 혜택이 아니다")
    void plainUser() {
        givenRole("USER");
        assertThat(create(1L, NOV_2, List.of("13:00")).isBungjuRate()).isFalse();
    }

    @Test
    @DisplayName("마작 대탁은 벙주여도 혜택이 아니다")
    void mahjongTable() {
        givenRole("BUNGJU");
        assertThat(create(5L, NOV_2, List.of("14:00")).isBungjuRate()).isFalse();
    }

    @Test
    @DisplayName("11/2부터 회원 누구나 같은 날 두 번째 룸 예약은 막힌다")
    void oneRoomPerDay() {
        givenRole("USER");
        when(bgmAgitReservationRepository.existsActiveRoomReservation(USER_ID, NOV_2)).thenReturn(true);
        assertThatThrownBy(() -> create(1L, NOV_2, List.of("13:00")))
                .isInstanceOf(ReservationConflictException.class)
                .hasMessage(SlotSchedule.ONE_ROOM_PER_DAY_MESSAGE);
        verify(bgmAgitReservationRepository, never()).save(any());
    }

    @Test
    @DisplayName("11/1 이용분은 하루 1룸 제한이 없다")
    void beforeOneRoomPerDay() {
        givenRole("USER");
        when(bgmAgitReservationRepository.existsActiveRoomReservation(USER_ID, NOV_1)).thenReturn(true);
        assertThat(create(1L, NOV_1, List.of("13:00"))).isNotNull();
    }

    @Test
    @DisplayName("마작 대탁은 하루 1룸 제한에 걸리지 않는다")
    void mahjongNotLimited() {
        givenRole("USER");
        when(bgmAgitReservationRepository.existsActiveRoomReservation(USER_ID, NOV_2)).thenReturn(true);
        assertThat(create(5L, NOV_2, List.of("14:00"))).isNotNull();
    }

    @Test
    @DisplayName("관리자는 하루 1룸 제한에서 빠진다(전화·현장 예약 대행)")
    void adminNotLimited() {
        givenRole("ADMIN");
        when(bgmAgitReservationRepository.existsActiveRoomReservation(USER_ID, NOV_2)).thenReturn(true);
        assertThat(create(1L, NOV_2, List.of("13:00"))).isNotNull();
    }

    private void reservation(LocalDate date, Integer bungjuPrice) {
        BgmAgitReservation reservation = new BgmAgitReservation(
                member, Reservation.ROOM, date, LocalTime.of(13, 0), LocalTime.of(15, 0), 4, "없음");
        reservation.addRoom(bRoom);
        ReflectionTestUtils.setField(reservation, "bgmAgitReservationId", 7L);
        if (bungjuPrice != null) {
            reservation.applyBungjuPrice(bungjuPrice);
        }
        when(bgmAgitReservationRepository.findReservationWithRooms(7L)).thenReturn(Optional.of(reservation));
    }

    @Test
    @DisplayName("혜택 예약 결제는 4명 × 5,000원, 단가 스냅샷 5,000원, 월간패스 할인 없음, 정가 36,000원 표시")
    void paymentOrderBungju() {
        reservation(NOV_2, 5000);
        when(bgmAgitMonthlyPassRepository.coversMonth(anyLong(), any())).thenReturn(true);
        PaymentOrderResponse order = new PaymentOrderResponse("o", 20000, "n", "ck", 0, "FULL");
        when(paymentService.createOrder(anyLong(), anyLong(), anyInt(), anyString(), anyInt(), any(), anyInt(), anyString()))
                .thenReturn(order);

        PaymentOrderResponse result = service.createPaymentOrder(7L, USER_ID);

        verify(paymentService).createOrder(eq(USER_ID), eq(7L), eq(20000), anyString(),
                eq(4), eq(5000), eq(0), eq("FULL"));
        verify(bgmAgitMonthlyPassRepository, never()).coversMonth(anyLong(), any());
        assertThat(result.isBungjuApplied()).isTrue();
        assertThat(result.getRegularAmount()).isEqualTo(36000);
    }

    @Test
    @DisplayName("정가 예약 결제는 평일 4명 × 9,000원")
    void paymentOrderNormal() {
        reservation(NOV_2, null);
        when(paymentService.createOrder(anyLong(), anyLong(), anyInt(), anyString(), anyInt(), any(), anyInt(), anyString()))
                .thenReturn(new PaymentOrderResponse("o", 36000, "n", "ck", 0, "FULL"));

        PaymentOrderResponse result = service.createPaymentOrder(7L, USER_ID);

        verify(paymentService).createOrder(eq(USER_ID), eq(7L), eq(36000), anyString(),
                eq(4), eq(9000), anyInt(), eq("FULL"));
        assertThat(result.isBungjuApplied()).isFalse();
    }
}
