package com.bgmagitapi.origin.controller.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.querydsl.core.annotations.QueryProjection;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;


@NoArgsConstructor
@Getter
public class BgmAgitMyPageGetResponse {
    
    private Long id;
    private String mail;
    private String name;
    private String nickName;
    private String phoneNo;
    private String nickNameUseStatus;
    private String alimtalkStatus;
    private String mahjongUseStatus;
    // 'Y' = 이번 달이 월간패스 기간 안. 서비스가 BGM_AGIT_MONTHLY_PASS 로 채운다
    @Setter
    private String monthlyPassStatus;
    // 아직 쓸 수 있는 패스 기간 안내 (예: "2026-11 ~ 2027-10"). 없으면 null
    @Setter
    private String monthlyPassPeriods;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDateTime registDate;

    @QueryProjection
    public BgmAgitMyPageGetResponse(Long id, String mail, String name, String nickName, String phoneNo, String nickNameUseStatus, String alimtalkStatus, String mahjongUseStatus, LocalDateTime registDate) {
        this.id = id;
        this.mail = mail;
        this.name = name;
        this.nickName = nickName;
        this.phoneNo = phoneNo;
        this.nickNameUseStatus = nickNameUseStatus;
        this.alimtalkStatus = alimtalkStatus;
        this.mahjongUseStatus = mahjongUseStatus;
        this.registDate = registDate;
    }
}
