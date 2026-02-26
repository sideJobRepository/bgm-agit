package com.bgmagitapi.kml.lecture.service;

import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.kml.lecture.dto.request.LecturePostRequest;
import com.bgmagitapi.kml.lecture.dto.response.LectureGetResponse;

public interface LectureService {

    LectureGetResponse getLectureGetResponse(Long memberId);
    ApiResponse createLecture(LecturePostRequest lecturePostRequest,Long memberId);
    
}
