package com.bgmagitapi.origin.entity.enumeration;

public enum HolidayType {
    // 계산으로는 안 잡히는 날을 공휴일로 추가 (선거일·임시공휴일 등)
    ADD,
    // 계산상 공휴일이지만 정상 영업해서 평일 요금을 받는 날
    EXCLUDE
}
