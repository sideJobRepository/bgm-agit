package com.bgmagitapi.entity.enumeration;

import lombok.Getter;

@Getter
public enum BgmAgitSubject {
    
    RESERVATION("예약"),
    SIGN_UP("회원가입");
    
    private final String value;
    
    BgmAgitSubject(String value) {
        this.value = value;
    }
}
