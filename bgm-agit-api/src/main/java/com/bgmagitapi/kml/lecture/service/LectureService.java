package com.bgmagitapi.kml.lecture.service;

import com.bgmagitapi.kml.lecture.dto.response.LectureGetResponse;

public interface LectureService {

    LectureGetResponse getLectureGetResponse(int year,int month);
}
