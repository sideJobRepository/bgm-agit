package com.bgmagitapi.kml.my.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class MyAcademyCancelRequest {

    private Long lectureId;
    private Long memberId;
}
