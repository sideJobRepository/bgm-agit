package com.bgmagitapi.controller.response;

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
    private String mahjongUseStatus;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDateTime registDate;
    
    @QueryProjection
    public BgmAgitMyPageGetResponse(Long id, String mail, String name, String nickName, String phoneNo, String nickNameUseStatus, String mahjongUseStatus, LocalDateTime registDate) {
        this.id = id;
        this.mail = mail;
        this.name = name;
        this.nickName = nickName;
        this.phoneNo = phoneNo;
        this.nickNameUseStatus = nickNameUseStatus;
        this.mahjongUseStatus = mahjongUseStatus;
        this.registDate = registDate;
    }
}
