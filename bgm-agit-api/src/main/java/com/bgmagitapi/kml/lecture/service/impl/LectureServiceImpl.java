package com.bgmagitapi.kml.lecture.service.impl;

import com.bgmagitapi.advice.exception.ValidException;
import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.entity.BgmAgitMember;
import com.bgmagitapi.kml.lecture.dto.request.LecturePostRequest;
import com.bgmagitapi.kml.lecture.dto.response.LectureGetResponse;
import com.bgmagitapi.kml.lecture.entity.Lecture;
import com.bgmagitapi.kml.lecture.repository.LectureRepository;
import com.bgmagitapi.kml.lecture.service.LectureService;
import com.bgmagitapi.kml.slot.entity.LectureSlot;
import com.bgmagitapi.kml.slot.repository.LectureSlotRepository;
import com.bgmagitapi.repository.BgmAgitMemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Transactional
@RequiredArgsConstructor
@Service
public class LectureServiceImpl implements LectureService {
    
    private final BgmAgitMemberRepository memberRepository;
    private final LectureRepository lectureRepository;
    private final LectureSlotRepository  lectureSlotRepository;
    
    
    @Override
    @Transactional(readOnly = true)
    public LectureGetResponse getLectureGetResponse(int year,int month,int day,Long memberId) {
        
        List<LectureGetResponse.TimeSlotByDate> result = new ArrayList<>();
        
        LocalDate today = LocalDate.now();
        
        LocalDate start = LocalDate.of(year, month, day);
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());
        
        // 로그인 사용자만: "내 예약 살아있으면 전부 비활성" 정책용
        boolean hasMyActiveReservation = false;
        if (memberId != null) {
            hasMyActiveReservation = lectureRepository.existsMyActiveReservation(memberId, today);
        }
        
        // 예약 존재 슬롯ID (대기 포함, 취소 제외)
        Set<Long> reservedSlotIds = new HashSet<>(lectureRepository.findByReservedSlotIds(start, end));
        
        for (LocalDate date = start; !date.isAfter(end); date = date.plusDays(1)) {
            
            if (date.isBefore(today)) continue;
            
            DayOfWeek dayOfWeek = date.getDayOfWeek();
            List<String> times = new ArrayList<>();
            
            if (dayOfWeek == DayOfWeek.SATURDAY) {
                times.add("18:00~20:00");
                times.add("20:00~22:00");
            }
            
            if (dayOfWeek == DayOfWeek.SUNDAY) {
                times.add("14:00~16:00");
                times.add("16:00~18:00");
                times.add("18:00~20:00");
                times.add("20:00~22:00");
            }
            
            if (times.isEmpty()) continue;
            
            // 1) 이 날짜에서 "예약된 슬롯 인덱스" 찾기 (대기 포함)
            int reservedIdx = -1;
            
            for (int i = 0; i < times.size(); i++) {
                String time = times.get(i);
                
                String[] split = time.split("~");
                LocalTime startTime = LocalTime.parse(split[0].trim());
                LocalTime endTime = LocalTime.parse(split[1].trim());
                
                LectureSlot slot = lectureSlotRepository.findByLectureTime(date, startTime, endTime);
                
                boolean hasReservation = (slot != null) && reservedSlotIds.contains(slot.getId());
                
                if (hasReservation) {
                    reservedIdx = i;
                    break; // 첫 예약 슬롯만
                }
            }
            
            // 2) enabled 세팅
            List<LectureGetResponse.SlotItem> slotItems = new ArrayList<>();
            
            for (int i = 0; i < times.size(); i++) {
                
                boolean enabled;
                
                if (hasMyActiveReservation) {
                    // 내가 취소 안 한 미래 예약이 있으면 전부 비활성
                    enabled = false;
                } else if (reservedIdx == -1) {
                    // 예약 없음 -> 전부 가능
                    enabled = true;
                } else {
                    // 예약 있음 -> 예약된 슬롯만 가능, 나머지 전부 비활성
                    enabled = (i == reservedIdx);
                }
                
                slotItems.add(new LectureGetResponse.SlotItem(times.get(i), enabled));
            }
            
            result.add(new LectureGetResponse.TimeSlotByDate(date, slotItems));
        }
        
        return new LectureGetResponse(result);
    }
    
    @Override
    public ApiResponse createLecture(LecturePostRequest request, Long memberId) {
        
        BgmAgitMember bgmAgitMember = memberRepository.findById(memberId).orElseThrow(() -> new RuntimeException("존재 하지 않는 회원입니다."));
        LocalDate date = request.getDate();
        String time = request.getTime();
        String[] split = time.split("~");
        LocalTime startTime = LocalTime.parse(split[0]);
        LocalTime endTime   = LocalTime.parse(split[1]);
        
        LectureSlot lectureSlot = lectureSlotRepository.findByLectureTime(date, startTime, endTime);
        if (lectureSlot == null) {
            LectureSlot slot = LectureSlot.builder()
                    .startDate(date)
                    .startTime(startTime)
                    .endTime(endTime)
                    .capacity(4)
                    .approvalPeople(1)
                    .build();
            lectureSlotRepository.save(slot);
            
            Lecture lecture = Lecture
                    .builder()
                    .member(bgmAgitMember)
                    .lectureSlot(slot)
                    .lectureApprovalStatus("N")
                    .lectureCancelStatus("N")
                    .build();
            lectureRepository.save(lecture);
            return new ApiResponse(200,true,"예약이 신청되었습니다.");
        }
        
        Boolean success = lectureSlotRepository.updateLectureSlotCapacity(lectureSlot.getId());
        if(!success){
            throw new ValidException("정원이 만료 되어 예약이 불가능 합니다.");
        }
        
        Lecture lecture = Lecture
                .builder()
                .member(bgmAgitMember)
                .lectureSlot(lectureSlot)
                .lectureApprovalStatus("N")
                .lectureCancelStatus("N")
                .build();
        lectureRepository.save(lecture);
        
        return new ApiResponse(200,true,"예약이 신청되었습니다.");
    }
}
