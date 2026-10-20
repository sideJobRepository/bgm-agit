package com.bgmagitapi.origin.controller.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.querydsl.core.annotations.QueryProjection;
import lombok.Getter;
import lombok.NoArgsConstructor;

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
    // 'Y' = 이번 달 월간패스 회원(매월 1일 초기화)
    private String monthlyPassStatus;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDateTime registDate;

    @QueryProjection
    public BgmAgitMyPageGetResponse(Long id, String mail, String name, String nickName, String phoneNo, String nickNameUseStatus, String alimtalkStatus, String mahjongUseStatus, String monthlyPassStatus, LocalDateTime registDate) {
        this.id = id;
        this.mail = mail;
        this.name = name;
        this.nickName = nickName;
        this.phoneNo = phoneNo;
        this.nickNameUseStatus = nickNameUseStatus;
        this.alimtalkStatus = alimtalkStatus;
        this.mahjongUseStatus = mahjongUseStatus;
        this.monthlyPassStatus = monthlyPassStatus;
        this.registDate = registDate;
    }
}
