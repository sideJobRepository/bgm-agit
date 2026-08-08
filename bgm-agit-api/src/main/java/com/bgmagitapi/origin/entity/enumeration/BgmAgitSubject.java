package com.bgmagitapi.origin.entity.enumeration;

import lombok.Getter;

@Getter
public enum BgmAgitSubject {
    
    RESERVATION("룸 예약"),
    SIGN_UP("회원가입"),
    MAHJONG_RENTAL("대탁"),
    INQUIRY("1:1문의"),
    LECTURE("마작강의"),
    REVIEW("마작강의리뷰"),
    MATCH_RECORD("대국기록"),
    ADMIN_RESERVATION_NOTICE("관리자 당일 예약 알림");
    
    private final String value;
    
    BgmAgitSubject(String value) {
        this.value = value;
    }
}
