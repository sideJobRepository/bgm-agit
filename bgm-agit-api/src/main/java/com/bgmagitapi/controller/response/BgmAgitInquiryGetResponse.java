package com.bgmagitapi.controller.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
public class BgmAgitInquiryGetResponse {
    
    private Long id;
    private Long memberId;
    private String memberName;
    private String title;
    private String answerStatus;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDateTime registDate;
}
