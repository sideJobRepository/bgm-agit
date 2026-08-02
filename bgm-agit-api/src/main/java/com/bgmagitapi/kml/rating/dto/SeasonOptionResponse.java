package com.bgmagitapi.kml.rating.dto;

import com.bgmagitapi.kml.rating.entity.Season;
import com.bgmagitapi.kml.rating.enums.SeasonProgressStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SeasonOptionResponse {

    private Long id;                             // 시즌 ID
    private String name;                         // 시즌 이름
    private SeasonProgressStatus progressStatus; // 진행 상태 코드 (로직용, 예: "ONGOING")
    private String progressStatusLabel;          // 진행 상태 표시 텍스트 (예: "진행중")

    public static SeasonOptionResponse fromDomain(Season season) {
        return SeasonOptionResponse.builder()
                .id(season.getId())
                .name(season.getName())
                .progressStatus(season.getProgressStatus())
                .progressStatusLabel(season.getProgressStatus() != null
                        ? season.getProgressStatus().getDescription()
                        : null)
                .build();
    }
}
