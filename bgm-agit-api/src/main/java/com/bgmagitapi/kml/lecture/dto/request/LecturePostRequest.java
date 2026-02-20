package com.bgmagitapi.kml.lecture.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LecturePostRequest {
    private LocalDate date;
    private String time;
}
