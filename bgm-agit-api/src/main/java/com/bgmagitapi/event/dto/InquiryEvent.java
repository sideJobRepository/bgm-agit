package com.bgmagitapi.event.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class InquiryEvent {
    private Long id;
    private String memberName;
    private String title;
    private LocalDateTime registDate;
    private String memberPhoneNo;
    private TalkAction talkAction;
}
