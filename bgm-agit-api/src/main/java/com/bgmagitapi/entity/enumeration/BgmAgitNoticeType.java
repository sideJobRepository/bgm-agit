package com.bgmagitapi.entity.enumeration;

public enum BgmAgitNoticeType {
    EVENT("이벤트"),
    NOTICE("공지");
    
    private final String label;
    
    BgmAgitNoticeType(String label) {
        this.label = label;
    }
    
    public String getLabel() {
        return label;
    }
}
