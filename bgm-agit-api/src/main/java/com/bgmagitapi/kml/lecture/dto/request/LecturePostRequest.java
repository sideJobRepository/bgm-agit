package com.bgmagitapi.kml.lecture.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LecturePostRequest {
    @NotNull(message = "날짜는 필수입니다.")
    private LocalDate date;
    @NotBlank(message = "시간은 필수입니다.")
    private String time;
}
