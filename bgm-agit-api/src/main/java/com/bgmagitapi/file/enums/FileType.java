package com.bgmagitapi.file.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Getter
public enum FileType {

    YAKUMAN("역만 증빙"),
    MAHJONG_NOTICE("마작 공지"),
    MAHJONG_NOTICE_INLINE("마작 공지 본문 인라인 이미지");

    private final String value;
}
