package com.bgmagitapi.kml.my.service.impl;

import com.bgmagitapi.kml.lecture.repository.LectureRepository;
import com.bgmagitapi.kml.my.dto.response.MyAcademyGetResponse;
import com.bgmagitapi.kml.my.service.MyAcademyService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
@RequiredArgsConstructor
public class MyAcademyServiceImpl implements MyAcademyService {

    private final LectureRepository lectureRepository;
    
    @Override
    @Transactional(readOnly = true)
    public Page<MyAcademyGetResponse> getMyAcademy(Pageable pageable, Long memberId, String role) {
        Long filterMemberId = "ROLE_ADMIN".equals(role) ? null : memberId;
        return lectureRepository.findByMyAcademy(pageable,filterMemberId);
    }
}
