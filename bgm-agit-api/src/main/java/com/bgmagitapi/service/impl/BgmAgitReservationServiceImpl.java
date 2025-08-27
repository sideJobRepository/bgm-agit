package com.bgmagitapi.service.impl;

import com.bgmagitapi.advice.exception.ReservationConflictException;
import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.controller.request.BgmAgitReservationCreateRequest;
import com.bgmagitapi.controller.request.BgmAgitReservationModifyRequest;
import com.bgmagitapi.controller.response.BgmAgitReservationResponse;
import com.bgmagitapi.controller.response.reservation.GroupedReservationResponse;
import com.bgmagitapi.controller.response.reservation.ReservedTimeDto;
import com.bgmagitapi.controller.response.reservation.TimeRange;
import com.bgmagitapi.entity.BgmAgitImage;
import com.bgmagitapi.entity.BgmAgitMember;
import com.bgmagitapi.entity.BgmAgitReservation;
import com.bgmagitapi.repository.BgmAgitImageRepository;
import com.bgmagitapi.repository.BgmAgitMemberRepository;
import com.bgmagitapi.repository.BgmAgitReservationRepository;
import com.bgmagitapi.service.BgmAgitBizTalkSandService;
import com.bgmagitapi.service.BgmAgitReservationService;
import com.bgmagitapi.service.response.BizTalkCancel;
import com.bgmagitapi.service.response.ReservationTalkContext;
import com.bgmagitapi.util.LunarCalendar;
import com.querydsl.jpa.impl.JPAQuery;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.support.PageableExecutionUtils;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Transactional
@Service
@RequiredArgsConstructor
public class BgmAgitReservationServiceImpl implements BgmAgitReservationService {
    
    private final BgmAgitImageRepository bgmAgitImageRepository;
    
    private final BgmAgitMemberRepository bgmAgitMemberRepository;
    
    private final BgmAgitReservationRepository bgmAgitReservationRepository;
    
    private final BgmAgitBizTalkSandService bgmAgitBizTalkSandService;
    
    @Override
    @Transactional(readOnly = true)
    public BgmAgitReservationResponse getReservation(Long labelGb, String link, Long id, LocalDate date) {
        Authentication authentication = SecurityContextHolder.getContextHolderStrategy().getContext().getAuthentication();
        final Long userId = (authentication instanceof JwtAuthenticationToken bearerAuth)
                ? ((Jwt) bearerAuth.getPrincipal()).getClaim("id")
                : null;
        LocalDate today = date;
        LocalDate endOfYear = LocalDate.of(today.getYear(), 12, 31);
        String label = "", group = "";
        // 1. 예약 정보 조회
        // 1. 예약 정보 조회 (Y: 확정 / N: 대기)
        List<ReservedTimeDto> reservations = bgmAgitReservationRepository.findReservations(labelGb, link, id, today, endOfYear);

        // 2. 예약 시간 Map<날짜, List<TimeRange>> 으로 변환
        Map<LocalDate, List<TimeRange>> reservedMap = reservations.stream()
                .map(res -> {
                    LocalDateTime start = LocalDateTime.of(res.getDate(), res.getStartTime());
                    LocalDateTime end = res.getEndTime().isBefore(res.getStartTime())
                            ? LocalDateTime.of(res.getDate().plusDays(1), res.getEndTime())
                            : LocalDateTime.of(res.getDate(), res.getEndTime());
                    return new TimeRange(start, end, res.getApprovalStatus(), res.getMemberId() , res.getCancelStatus());
                })
                .collect(Collectors.groupingBy(r -> r.getStart().toLocalDate()));
        
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm");

        // 3. 날짜별 시간 슬롯 생성
        List<BgmAgitReservationResponse.TimeSlotByDate> timeSlots = new ArrayList<>();
        
        for (LocalDate d = today; !d.isAfter(endOfYear); d = d.plusDays(1)) {
            LocalDateTime open =  isGroomAndMahjongRental(id) ? LocalDateTime.of(d, LocalTime.of(14, 0)) : LocalDateTime.of(d, LocalTime.of(13, 0));
            LocalDateTime close = LocalDateTime.of(d.plusDays(1), LocalTime.of(2, 0));
            LocalDateTime cursor = open;
            
            List<String> availableSlots = new ArrayList<>();
            List<TimeRange> reserved = reservedMap.getOrDefault(d, Collections.emptyList())
                    .stream().sorted(Comparator.comparing(TimeRange::getStart)).toList();
            
            int slotIntervalHours = (isGroomAndMahjongRental(id)) ? 3 : 1;
            
            while (cursor.isBefore(close)) {
                LocalDateTime slotStart = cursor;
                LocalDateTime slotEnd = cursor.plusHours(slotIntervalHours);
                
                if (d.isEqual(today) && slotEnd.isBefore(LocalDateTime.now())) {
                    cursor = cursor.plusHours(slotIntervalHours);
                    continue;
                }
                
                boolean overlapped = reserved.stream()
                        .anyMatch(r -> r.isOverlapping(slotStart, slotEnd, userId));
                
                
                if (!overlapped) {
                    availableSlots.add(slotStart.format(formatter));
                }
                
                if (isGroomAndMahjongRental(id) && slotStart.format(formatter).equals("01:00")) {
                    availableSlots.remove(slotStart.format(formatter));
                }
                
                cursor = cursor.plusHours(slotIntervalHours);
            }
            
            if (!availableSlots.isEmpty()) {
                if (!reservations.isEmpty()) {
                    ReservedTimeDto dto = reservations.get(0);
                    label = dto.getLabel();
                    group = dto.getGroup();
                } else {
                    BgmAgitImage image = bgmAgitImageRepository.findById(id).orElse(null);
                    if (image != null) {
                        label = image.getBgmAgitImageLabel();
                        group = image.getBgmAgitImageGroups();
                    }
                }
            }
            
            timeSlots.add(new BgmAgitReservationResponse.TimeSlotByDate(d, availableSlots));
        }

        // 4. 공휴일/주말 가격 계산
        Set<String> holidaySet = new LunarCalendar().getHolidaySet(String.valueOf(today.getYear()));
        DateTimeFormatter formatterYY = DateTimeFormatter.ofPattern("yyyyMMdd");
        
        List<BgmAgitReservationResponse.PriceByDate> prices = new ArrayList<>();
        
        for (LocalDate d = today; !d.isAfter(endOfYear); d = d.plusDays(1)) {
            String dateStr = d.format(formatterYY);
            boolean isWeekend = d.getDayOfWeek() == DayOfWeek.SATURDAY || d.getDayOfWeek() == DayOfWeek.SUNDAY;
            boolean isHoliday = holidaySet.contains(dateStr);
            int price = (isWeekend || isHoliday) ? 4000 : 3000;
            if (mahjongRental(id)) {
                price = 40000;
            }
            prices.add(new BgmAgitReservationResponse.PriceByDate(d, price, isWeekend || isHoliday));
        }
        
        return new BgmAgitReservationResponse(timeSlots, prices, label, group);
        
    }
    
    private boolean isGroomAndMahjongRental(Long id) {
        return id != null && (id == 18 || id == 32 || id == 33 || id == 34 || id == 35);
    }
    private boolean mahjongRental(Long id) {
        return id != null && ( id == 32 || id == 33 || id == 34 || id == 35);
    }
    
    @Override
    public ApiResponse createReservation(BgmAgitReservationCreateRequest request, Long userId) {
        List<String> timeList = request.getReservationExpandedTimeSlots();

        // 날짜 보정
        String dateStr = request.getBgmAgitReservationStartDate(); // "2025-07-27T15:00:00.000Z"
        Instant instant = Instant.parse(dateStr);
        LocalDate kstDate = instant.atZone(ZoneId.of("Asia/Seoul")).toLocalDate();
        
        // 예약 기본 정보 조회
        BgmAgitMember member = bgmAgitMemberRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User Not Found"));
        BgmAgitImage image = bgmAgitImageRepository.findById(request.getBgmAgitImageId())
                .orElseThrow(() -> new RuntimeException("Not Found Image Id"));
        String reservationType = request.getBgmAgitReservationType();
        
        // 기존 예약 조회
        List<BgmAgitReservation> existingReservations = bgmAgitReservationRepository.findExistingReservations(image, kstDate, "N");
        
        // 중복된 시간대 구성 (Set으로 빠르게 비교)
        Set<String> existingTimeSlots = existingReservations.stream()
                .filter(r ->
                        "Y".equals(r.getBgmAgitReservationApprovalStatus()) ||
                                (
                                        "N".equals(r.getBgmAgitReservationApprovalStatus()) &&
                                                Objects.equals(r.getBgmAgitMember().getBgmAgitMemberId(), userId)
                                )
                )
                .map(r -> r.getBgmAgitReservationStartTime() + "-" + r.getBgmAgitReservationEndTime())
                .collect(Collectors.toSet());
        Long maxReservationNo = bgmAgitReservationRepository.findMaxReservationNo();
        maxReservationNo = (maxReservationNo == null) ? 1L : maxReservationNo + 1L;
        // 신규 예약 생성
        List<BgmAgitReservation> list = new ArrayList<>();
        for (String timeSlot : timeList) {
            // "14:00 ~ 15:00" → ["14:00", "15:00"]
            String[] times = timeSlot.split(" ~ ");
            if (times.length != 2) {
                throw new IllegalArgumentException("잘못된 시간 슬롯 형식입니다: " + timeSlot);
            }
            LocalTime startTime = LocalTime.parse(times[0]);
            LocalTime endTime = LocalTime.parse(times[1]);
            
            String slotKey = startTime + "-" + endTime;
            if (existingTimeSlots.contains(slotKey)) {
                throw new ReservationConflictException("이미 예약된 시간대입니다: " + slotKey);
            }
            
            BgmAgitReservation reservation = new BgmAgitReservation(
                    member, image, reservationType, startTime, endTime, kstDate,maxReservationNo
            );
            bgmAgitReservationRepository.save(reservation);
            list.add(reservation);
        }
        
        bgmAgitBizTalkSandService.sandBizTalk(member,image,list);
        return new ApiResponse(200, true, "예약이 완료되었습니다.");
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<GroupedReservationResponse> getReservationDetail(Long memberId, String role, String startDate, String endDate, Pageable pageable) {
        BgmAgitMember bgmAgitMember = bgmAgitMemberRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("Member Not Found"));
        
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        LocalDate start = StringUtils.hasText(startDate) ? LocalDate.parse(startDate, fmt) : null;
        LocalDate end   = StringUtils.hasText(endDate)   ? LocalDate.parse(endDate, fmt)   : null;
        boolean isUser = "ROLE_USER".equals(role);
        
        // 1) 페이지 키 조회 (예약번호)
        List<Long> pageNos = bgmAgitReservationRepository
                .findReservationNosPageForDetail(memberId, isUser, start, end, pageable);
        
        if (pageNos.isEmpty()) {
            return new PageImpl<>(List.of(), pageable, 0);
        }

        // 2) 상세 로딩
        List<BgmAgitReservation> rows = bgmAgitReservationRepository
                .findReservationsByNosForDetail(pageNos, memberId, isUser, start, end);

        // 3) 그룹핑 (키 순서 유지)
        Map<Long, List<BgmAgitReservation>> bucket = rows.stream()
                .collect(Collectors.groupingBy(BgmAgitReservation::getBgmAgitReservationNo));

        // pageNos 순서대로 DTO 만들기 → 정렬 비용/불안정 제거
        List<GroupedReservationResponse> content = new ArrayList<>(pageNos.size());
        for (Long no : pageNos) {
            List<BgmAgitReservation> list = bucket.get(no);
            if (list == null) continue;
            
            GroupedReservationResponse dto = new GroupedReservationResponse();
            dto.setReservationNo(no);
            dto.setTimeSlots(list.stream()
                    .map(r -> new GroupedReservationResponse.TimeSlot(
                            r.getBgmAgitReservationStartTime().toString(),
                            r.getBgmAgitReservationEndTime().toString()))
                    .toList());
            dto.setReservationDate(list.get(0).getBgmAgitReservationStartDate());
            dto.setApprovalStatus(list.get(0).getBgmAgitReservationApprovalStatus());
            dto.setCancelStatus(list.get(0).getBgmAgitReservationCancelStatus());
            dto.setReservationMemberName(list.get(0).getBgmAgitMember().getBgmAgitMemberName());
            dto.setReservationAddr(list.get(0).getBgmAgitImage().getBgmAgitImageLabel());
            
            content.add(dto);
        }

        // 4) total count
        
        JPAQuery<Long> countQuery = bgmAgitReservationRepository
                .countReservationsDistinctForDetail(memberId, isUser, start, end);
        
        
        return  PageableExecutionUtils.getPage(content, pageable,countQuery::fetchOne);
    }
    
    @Override
    public ApiResponse modifyReservation(Long id, BgmAgitReservationModifyRequest request, String role) {
        
        
        Long reservationNo = request.getReservationNo();
        String cancelStatus = request.getCancelStatus();
        String approvalStatus = request.getApprovalStatus();
        
        List<BgmAgitReservation> reservations = bgmAgitReservationRepository.findReservationList(reservationNo);
        
        List<Long> idList = reservations.stream()
                .map(BgmAgitReservation::getBgmAgitReservationId)
                .toList();
        
        BizTalkCancel bizTalkCancel = bgmAgitReservationRepository.findBizTalkCancel(reservationNo);
        
        if (!idList.isEmpty()) {
            bgmAgitReservationRepository.updateCancelAndApprovalStatus(
                    cancelStatus, approvalStatus, idList
            );
        }

        if (bizTalkCancel == null) {
            return new ApiResponse(404, false, "전송 대상이 없습니다.");
        }

        ReservationTalkContext ctx = ReservationTalkContext.of(role, reservations, bizTalkCancel);

        // 명확한 조건 변수로 가독성 ↑ (대/소문자 및 null 안전)
        boolean approvedNow = "Y".equalsIgnoreCase(approvalStatus);
        boolean wasApproved = "Y".equalsIgnoreCase(bizTalkCancel.getApprovalStatus());
        boolean canceledNow = "Y".equalsIgnoreCase(cancelStatus);
        // (필요하면 과거 cancelStatus 비교도 추가 가능)

        if (approvedNow && !wasApproved) {
            // 승인으로 '변경' 되었을 때만 완료 알림톡
            return bgmAgitBizTalkSandService.sendCompleteBizTalk(ctx);
        }

        if (canceledNow) {
            // 취소 상태로 요청되었을 때만 취소 알림톡
            return bgmAgitBizTalkSandService.sendCancelBizTalk(ctx);
        }

        // 전송 조건이 아닌 경우
        return new ApiResponse(200, true, "수정 되었습니다. (알림톡 전송 조건 불충족)");
    }
}
