package com.bgmagitapi.kml.record.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum Wind {
    
    EAST("東"),
    SOUTH("南"),
    WEST("西"),
    NORTH("北");
    
    private final String value;
}
