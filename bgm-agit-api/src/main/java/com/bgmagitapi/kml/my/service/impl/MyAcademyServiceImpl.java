package com.bgmagitapi.kml.my.service.impl;

import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.entity.BgmAgitMember;
import com.bgmagitapi.entity.enumeration.BgmAgitSubject;
import com.bgmagitapi.kml.lecture.entity.Lecture;
import com.bgmagitapi.kml.lecture.repository.LectureRepository;
import com.bgmagitapi.kml.my.dto.events.MyAcademyApprovalEvent;
import com.bgmagitapi.kml.my.dto.request.MyAcademyApprovalRequest;
import com.bgmagitapi.kml.my.dto.response.MyAcademyGetResponse;
import com.bgmagitapi.kml.my.service.MyAcademyService;
import com.bgmagitapi.repository.BgmAgitMemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
@Transactional
@RequiredArgsConstructor
public class MyAcademyServiceImpl implements MyAcademyService {

    private final LectureRepository lectureRepository;
    private final BgmAgitMemberRepository memberRepository;
    private final ApplicationEventPublisher eventPublisher;
    
    @Override
    @Transactional(readOnly = true)
    public Page<MyAcademyGetResponse> getMyAcademy(Pageable pageable, Long memberId, String role) {
        
        boolean isAdmin = "ROLE_ADMIN".equals(role);
        Long filterMemberId = isAdmin ? null : memberId;
        
        Page<MyAcademyGetResponse> page = lectureRepository.findByMyAcademy(pageable, filterMemberId);
        
        LocalDateTime now = LocalDateTime.now();
        
        for (MyAcademyGetResponse dto : page.getContent()) {
            
            boolean isCanceled = "Y".equals(dto.getCancelStatus());
            
            LocalDateTime lectureStart = LocalDateTime.of(dto.getStartDate(), dto.getStartTime());
            // 취소 버튼
            
            boolean canCancel = false;
            
            if (!isCanceled && now.isBefore(lectureStart)) {
                
                if (isAdmin) {
                    // 어드민: 시작 전이면 언제든 가능
                    canCancel = true;
                    
                } else {
                    // 일반 유저: 3일 전까지
                    LocalDate deadline = dto.getStartDate().minusDays(3);
                    canCancel = !LocalDate.now().isAfter(deadline);
                }
            }
            
            dto.setCancelBtnEnabled(canCancel);
            // 승인 버튼 (어드민 전용)
            
            boolean canApprove =
                    isAdmin
                            && !isCanceled
                            && "N".equals(dto.getApprovalStatus())
                            && now.isBefore(lectureStart);
            
            dto.setApprovalBtnEnabled(canApprove);
        }
        return page;
    }
    
    @Override
    public ApiResponse approvalMyAcademy(MyAcademyApprovalRequest request) {
        Long lectureId = request.getLectureId();
        Long memberId = request.getMemberId();
        Lecture findLecture = lectureRepository.findByLectureDate(lectureId);
        BgmAgitMember bgmAgitMember = memberRepository.findById(memberId).orElseThrow(() -> new RuntimeException("존재 하지 않는 회원 입니다."));
        String time = DateTimeFormatter.ofPattern("HH:mm").format(findLecture.getLectureSlot().getStartTime())  + "~" + DateTimeFormatter.ofPattern("HH:mm").format(findLecture.getLectureSlot().getEndTime());
        findLecture.modifyApproval("Y");
        MyAcademyApprovalEvent event = MyAcademyApprovalEvent
                .builder()
                .id(findLecture.getId())
                .subject(BgmAgitSubject.LECTURE)
                .memberName(bgmAgitMember.getBgmAgitMemberName())
                .date(findLecture.getLectureSlot().getStartDate())
                .time(time)
                .phoneNo(bgmAgitMember.getBgmAgitMemberPhoneNo())
                .build();
        eventPublisher.publishEvent(event);
        return new ApiResponse(200,true,"강의 예약이 승인되었습니다.");
    }
    
    @Override
    public ApiResponse cancelMyAcademy(Long lectureId) {
        Lecture findLecture = lectureRepository.findById(lectureId).orElseThrow(() -> new RuntimeException("존재 하지 않는 강습 입니다"));
        findLecture.modifyCancel("Y");
        findLecture.modifyApproval("Y");
        //알림톡 해야함
        return new ApiResponse(200,true,"강의 예약이 취소 되었습니다.");
    }
}
