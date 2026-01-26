package com.bgmagitapi.kml.matchs.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Getter
public enum MatchsWind {
    
    EAST("동"),
    SOUTH("남"),
    WEST("서"),
    NORTH("북");
    
    private final String value;
    
}
