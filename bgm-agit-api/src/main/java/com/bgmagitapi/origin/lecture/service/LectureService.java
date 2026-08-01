package com.bgmagitapi.origin.lecture.service;

import com.bgmagitapi.origin.apiresponse.ApiResponse;
import com.bgmagitapi.origin.lecture.dto.request.LecturePostRequest;
import com.bgmagitapi.origin.lecture.dto.response.LectureGetResponse;

public interface LectureService {

    LectureGetResponse getLectureGetResponse(Long memberId);
    ApiResponse createLecture(LecturePostRequest lecturePostRequest,Long memberId);
    
}
