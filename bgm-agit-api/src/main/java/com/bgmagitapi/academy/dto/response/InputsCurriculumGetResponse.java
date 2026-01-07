package com.bgmagitapi.academy.dto.response;

import com.querydsl.core.annotations.QueryProjection;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@Data
@Builder
public class InputsCurriculumGetResponse {
    private Integer year;
    private String classesName;
    private String progressType;
    
    @QueryProjection
    public InputsCurriculumGetResponse(Integer year, String classesName, String progressType) {
        this.year = year;
        this.classesName = classesName;
        this.progressType = progressType;
    }
}
