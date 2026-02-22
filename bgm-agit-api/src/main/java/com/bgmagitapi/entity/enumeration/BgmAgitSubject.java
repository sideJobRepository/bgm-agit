package com.bgmagitapi.entity.enumeration;

import lombok.Getter;

@Getter
public enum BgmAgitSubject {
    
    RESERVATION("룸 예약"),
    SIGN_UP("회원가입"),
    MAHJONG_RENTAL("대탁"),
    INQUIRY("1:1문의"),
    LECTURE("마작강의"),
    REVIEW("마작강의리뷰");
    
    private final String value;
    
    BgmAgitSubject(String value) {
        this.value = value;
    }
}
