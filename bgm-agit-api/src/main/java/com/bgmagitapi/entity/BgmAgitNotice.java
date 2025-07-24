package com.bgmagitapi.entity;


import com.bgmagitapi.entity.enumeration.BgmAgitNoticeType;
import com.bgmagitapi.entity.mapperd.DateSuperClass;
import jakarta.persistence.*;
import lombok.Getter;

@Entity
@Getter
@Table(name = "BGM_AGIT_NOTICE")
public class BgmAgitNotice extends DateSuperClass {
    
    
    // BGM 아지트 공지사항 ID
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "BGM_AGIT_NOTICE_ID")
    private Long bgmAgitNoticeId;
    
    // BGM 아지트 공지사항 제목
    @Column(name = "BGM_AGIT_NOTICE_TITLE")
    private String bgmAgitNoticeTitle;
    
    // BGM 아지트 공지사항 내용
    @Column(name = "BGM_AGIT_NOTICE_CONT")
    private String bgmAgitNoticeCont;
    
    // BGM 아지트 공지사항 타입
    
    @Column(name = "BGM_AGIT_NOTICE_TYPE")
    @Enumerated(EnumType.STRING)
    private BgmAgitNoticeType bgmAgitNoticeType;
}
