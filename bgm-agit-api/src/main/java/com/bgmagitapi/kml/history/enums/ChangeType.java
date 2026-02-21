package com.bgmagitapi.kml.history.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Getter
public enum ChangeType {
    CREATE("최초등록"),
    MODIFY("수정");
    
    private final String value;
}
