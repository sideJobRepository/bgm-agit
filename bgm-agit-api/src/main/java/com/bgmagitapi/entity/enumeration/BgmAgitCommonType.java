package com.bgmagitapi.entity.enumeration;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Getter
public enum BgmAgitCommonType {
     FREE("자유게시판"),
    INQUIRY("1:1문의");
    private final String fileValue;
}
