package com.bgmagitapi.kml.my.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.querydsl.core.annotations.QueryProjection;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@NoArgsConstructor
public class MyAcademyGetResponse {
    
    private Long lectureId;
    private Long memberId;
    private String memberName;
    private String approvalStatus;
    private String cancelStatus;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate startDate;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "HH:mm")
    private LocalTime startTime;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "HH:mm")
    private LocalTime endTime;
    private String phoneNo;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm")
    private LocalDateTime registDate;
    
    
    @QueryProjection
    public MyAcademyGetResponse(Long lectureId, Long memberId, String memberName, String approvalStatus, String cancelStatus, LocalDate startDate, LocalTime startTime, LocalTime endTime, String phoneNo, LocalDateTime registDate) {
        this.lectureId = lectureId;
        this.memberId = memberId;
        this.memberName = memberName;
        this.approvalStatus = approvalStatus;
        this.cancelStatus = cancelStatus;
        this.startDate = startDate;
        this.startTime = startTime;
        this.endTime = endTime;
        this.phoneNo = phoneNo;
        this.registDate = registDate;
    }
}
