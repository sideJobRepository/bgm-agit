package com.bgmagitapi.entity.enumeration;

import lombok.Getter;

@Getter
public enum BgmAgitSubject {
    
    RESERVATION("룸 예약"),
    SIGN_UP("회원가입"),
    MAHJONG_RENTAL("대탁");
    
    private final String value;
    
    BgmAgitSubject(String value) {
        this.value = value;
    }
}
