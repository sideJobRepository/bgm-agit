package com.bgmagitapi.entity.enumeration;

import lombok.Getter;

@Getter
public enum BgmAgitSubject {
    
    RESERVATION("예약");
    
    private final String value;
    
    BgmAgitSubject(String value) {
        this.value = value;
    }
}
