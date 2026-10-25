package com.bgmagitapi.origin.clocktower.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class ClockTowerRoleResponse {

    private Long id;
    private String roleKey;
    private String name;
    private String nameEn;
    private String team;       // TOWNSFOLK ~ LORIC, 밤 특수 단계는 null
    private String teamName;
    private String edition;
    private String ability;
    private Integer firstNightOrder;
    private Integer otherNightOrder;
    private String firstNightText;
    private String otherNightText;
    private List<String> reminders;
    private List<String> remindersGlobal;
    private boolean setup;
    private boolean customEdited;
}
