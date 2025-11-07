package com.bgmagitapi.controller.response;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;

public class BgmAgitInquiryGetResponse {
    
    private Long id;
    private Long memberId;
    private String memberName;
    private String title;
    private String answerStatus;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDateTime registDate;
}
