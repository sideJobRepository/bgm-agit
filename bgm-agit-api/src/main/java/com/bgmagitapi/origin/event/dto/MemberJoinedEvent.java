package com.bgmagitapi.origin.event.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@AllArgsConstructor
@Data
public class MemberJoinedEvent {
    
    private final Long memberId;
}
