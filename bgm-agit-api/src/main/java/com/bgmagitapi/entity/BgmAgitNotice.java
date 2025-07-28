package com.bgmagitapi.entity;


import com.bgmagitapi.controller.request.BgmAgitNoticeModifyRequest;
import com.bgmagitapi.entity.enumeration.BgmAgitNoticeType;
import com.bgmagitapi.entity.mapperd.DateSuperClass;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Table(name = "BGM_AGIT_NOTICE")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
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
    
    
    @OneToMany(mappedBy = "bgmAgitNotice", cascade = CascadeType.ALL, orphanRemoval = true,fetch = FetchType.LAZY)
    private List<BgmAgitNoticeFile> bgmAgitNoticeFiles = new ArrayList<>();
    
    
    public BgmAgitNotice(String bgmAgitNoticeTitle, String bgmAgitNoticeCont, BgmAgitNoticeType bgmAgitNoticeType) {
        this.bgmAgitNoticeTitle = bgmAgitNoticeTitle;
        this.bgmAgitNoticeCont = bgmAgitNoticeCont;
        this.bgmAgitNoticeType = bgmAgitNoticeType;
    }
    
    public void modifyNotice(BgmAgitNoticeModifyRequest request) {
        this.bgmAgitNoticeTitle = request.getBgmAgitNoticeTitle();
        this.bgmAgitNoticeCont = request.getBgmAgitNoticeCont();
        this.bgmAgitNoticeType = request.getBgmAgitNoticeType();
    }
    
    public void addFile(BgmAgitNoticeFile file) {
        bgmAgitNoticeFiles.add(file);
        file.setNoticeInternal(this);
    }
}
