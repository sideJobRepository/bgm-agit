package com.bgmagitapi.kml.my.service.impl;

import com.bgmagitapi.kml.lecture.repository.LectureRepository;
import com.bgmagitapi.kml.my.dto.response.MyAcademyGetResponse;
import com.bgmagitapi.kml.my.service.MyAcademyService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
@Transactional
@RequiredArgsConstructor
public class MyAcademyServiceImpl implements MyAcademyService {

    private final LectureRepository lectureRepository;
    
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
}
