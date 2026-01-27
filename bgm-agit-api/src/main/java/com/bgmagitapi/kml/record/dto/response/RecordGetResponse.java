package com.bgmagitapi.kml.record.dto.response;

import com.bgmagitapi.kml.record.enums.Wind;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecordGetResponse {
    
    private Long matchsId;
    private String wind;
    private String first;
    private String second;
    private String third;
    private String fourth;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime registDate;
}
