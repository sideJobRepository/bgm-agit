package com.bgmagitapi.entity.enumeration;

import com.bgmagitapi.kml.record.dto.request.RecordPostRequest;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Getter
public enum BgmAgitCommonType {
    FREE("자유게시판"),
    INQUIRY("1:1문의"),
    KML_NOTICE("KML 공지사항"),
    RULE("룰"),
    YAKUMAN("역만");
    private final String fileValue;
}
