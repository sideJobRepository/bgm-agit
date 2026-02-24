package com.bgmagitapi.kml.review.dto.events;

import com.bgmagitapi.entity.enumeration.BgmAgitSubject;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class ReviewPostEvents {
    private Long id;
    private String memberName;
    private String title;
    private LocalDateTime date;
    private BgmAgitSubject subject;
}
