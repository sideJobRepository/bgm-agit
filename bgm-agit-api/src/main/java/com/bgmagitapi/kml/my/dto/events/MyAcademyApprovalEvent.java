package com.bgmagitapi.kml.my.dto.events;

import com.bgmagitapi.entity.enumeration.BgmAgitSubject;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class MyAcademyApprovalEvent {

    
    private Long id;
    private BgmAgitSubject subject;
    private String memberName;
    private LocalDate date;
    private String time;
    private String phoneNo;
}
