package com.bgmagitapi.origin.service.impl;

import com.bgmagitapi.origin.advice.exception.ValidException;
import com.bgmagitapi.origin.apiresponse.ApiResponse;
import com.bgmagitapi.origin.controller.request.BgmAgitBungjuSettingRequest;
import com.bgmagitapi.origin.controller.response.BgmAgitBungjuBenefitResponse;
import com.bgmagitapi.origin.controller.response.BgmAgitBungjuSettingResponse;
import com.bgmagitapi.origin.entity.BgmAgitBungjuSetting;
import com.bgmagitapi.origin.entity.BgmAgitReservation;
import com.bgmagitapi.origin.entity.BgmAgitRoom;
import com.bgmagitapi.origin.payment.repository.BgmAgitPaymentRepository;
import com.bgmagitapi.origin.repository.BgmAgitBungjuSettingRepository;
import com.bgmagitapi.origin.repository.BgmAgitMemberRoleRepository;
import com.bgmagitapi.origin.repository.BgmAgitReservationRepository;
import com.bgmagitapi.origin.service.BgmAgitBungjuService;
import com.bgmagitapi.origin.util.SlotSchedule;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Collection;
import java.util.List;
import java.util.Map;

@Service
@Transactional
@RequiredArgsConstructor
public class BgmAgitBungjuServiceImpl implements BgmAgitBungjuService {

    /** 벙주 권한 이름(BGM_AGIT_ROLE). 계층은 관리자 > 멘토 > 벙주 > 유저 */
    private static final String ROLE_NAME_BUNGJU = "BUNGJU";

    private static final DateTimeFormatter HH_MM = DateTimeFormatter.ofPattern("HH:mm");

    private final BgmAgitBungjuSettingRepository bgmAgitBungjuSettingRepository;

    private final BgmAgitMemberRoleRepository bgmAgitMemberRoleRepository;

    private final BgmAgitReservationRepository bgmAgitReservationRepository;

    private final BgmAgitPaymentRepository bgmAgitPaymentRepository;

    /**
     * 토큰이 아니라 DB 의 지금 권한을 본다 — 관리자가 벙주를 주거나 뺀 뒤
     * 손님이 다시 로그인하지 않아도 바로 반영돼야 한다.
     */
    @Override
    @Transactional(readOnly = true)
    public boolean isBungju(Long memberId) {
        if (memberId == null) {
            return false;
        }
        return bgmAgitMemberRoleRepository.findByBgmAgitMemberId(memberId)
                .map(memberRole -> ROLE_NAME_BUNGJU.equals(memberRole.getBgmAgitRole().getBgmAgitRoleName()))
                .orElse(false);
    }

    @Override
    @Transactional(readOnly = true)
    public BgmAgitBungjuSetting currentSetting() {
        return bgmAgitBungjuSettingRepository.findById(BgmAgitBungjuSetting.SINGLE_ID).orElse(null);
    }

    @Override
    public Integer bungjuPriceFor(BgmAgitBungjuSetting setting, boolean bungju, Collection<BgmAgitRoom> rooms,
                                  LocalDate useDate, boolean weekendRate) {
        if (!bungju || setting == null) {
            return null;
        }
        return SlotSchedule.isBungjuRateDate(setting.covers(useDate), weekendRate, rooms, useDate)
                ? setting.getUnitPrice()
                : null;
    }

    @Override
    @Transactional(readOnly = true)
    public BgmAgitBungjuSettingResponse getSetting(List<String> roles) {
        requireAdmin(roles);
        BgmAgitBungjuSetting setting = currentSetting();
        if (setting == null) {
            return new BgmAgitBungjuSettingResponse(null, null, null, false);
        }
        return new BgmAgitBungjuSettingResponse(
                setting.getStartDate(), setting.getEndDate(), setting.getUnitPrice(), setting.isUse());
    }

    @Override
    public ApiResponse updateSetting(BgmAgitBungjuSettingRequest request, List<String> roles) {
        requireAdmin(roles);
        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new ValidException("종료일은 시작일보다 빠를 수 없습니다.");
        }
        BgmAgitBungjuSetting setting = bgmAgitBungjuSettingRepository.findById(BgmAgitBungjuSetting.SINGLE_ID)
                .orElseThrow(() -> new ValidException("벙주 혜택 설정이 없습니다. 관리자에게 문의해 주세요."));
        setting.modify(request.getStartDate(), request.getEndDate(), request.getUnitPrice(), request.isUse());
        return new ApiResponse(200, true, "벙주 혜택 설정이 저장되었습니다.");
    }

    @Override
    @Transactional(readOnly = true)
    public List<BgmAgitBungjuBenefitResponse> getBenefitReservations(LocalDate from, LocalDate to, List<String> roles) {
        requireAdmin(roles);
        if (to.isBefore(from)) {
            throw new ValidException("종료일은 시작일보다 빠를 수 없습니다.");
        }
        List<BgmAgitReservation> reservations = bgmAgitReservationRepository.findBungjuReservations(from, to);
        Map<Long, Integer> paidAmounts = bgmAgitPaymentRepository.findPaidAmountsByReservationIds(
                reservations.stream().map(BgmAgitReservation::getBgmAgitReservationId).toList());
        return reservations.stream()
                .map(r -> new BgmAgitBungjuBenefitResponse(
                        r.getBgmAgitReservationId(),
                        r.getBgmAgitReservationStartDate(),
                        r.getBgmAgitReservationStartTime().format(HH_MM) + " ~ " + r.getBgmAgitReservationEndTime().format(HH_MM),
                        r.getRoomNames(),
                        r.getBgmAgitMember().getBgmAgitMemberName(),
                        r.getBgmAgitMember().getBgmAgitMemberNickname(),
                        r.getBgmAgitMember().getBgmAgitMemberPhoneNo(),
                        r.getBgmAgitReservationPeople(),
                        r.getBgmAgitReservationBungjuPrice(),
                        paidAmounts.get(r.getBgmAgitReservationId()),
                        r.isCanceled() ? "취소" : r.isApproved() ? "확정" : "대기"))
                .toList();
    }

    private void requireAdmin(List<String> roles) {
        boolean admin = roles != null && (roles.contains("ROLE_ADMIN") || roles.contains("ADMIN"));
        if (!admin) {
            throw new ValidException("관리자만 사용할 수 있습니다.");
        }
    }
}
