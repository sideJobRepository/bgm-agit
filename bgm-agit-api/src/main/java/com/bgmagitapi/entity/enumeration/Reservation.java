package com.bgmagitapi.entity.enumeration;

public enum Reservation {
    
    ROOM("룸"),
    DELEGATE_PLAY("대탁"),
    LECTURE("마작 강의 예약");
    
    private final String label;
    
    Reservation(String label) {
        this.label = label;
    }
    
    public String getLabel() {
        return label;
    }
}
