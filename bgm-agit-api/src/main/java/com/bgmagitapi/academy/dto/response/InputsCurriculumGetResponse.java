package com.bgmagitapi.academy.dto.response;

import com.querydsl.core.annotations.QueryProjection;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@Data
@Builder
public class InputsCurriculumGetResponse {
    private Long id;
    private Integer year;
    private String classesName;
    private String progressType;
    
    @QueryProjection
    public InputsCurriculumGetResponse(Long id,Integer year, String classesName, String progressType) {
        this.id = id;
        this.year = year;
        this.classesName = classesName;
        this.progressType = progressType;
    }
}
