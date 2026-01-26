package com.bgmagitapi.kml.record.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum Wind {
    
    EAST("동"),
    SOUTH("남"),
    WEST("서"),
    NORTH("북");
    
    private final String value;
}
