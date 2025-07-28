package com.bgmagitapi.entity;

import com.bgmagitapi.entity.mapperd.DateSuperClass;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Entity
@Getter
@Table(name = "BGM_AGIT_NOTICE_FILE")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class BgmAgitNoticeFile extends DateSuperClass {
    
    
    // BGM 아지트 공지사항 파일 ID
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "BGM_AGIT_NOTICE_FILE_ID")
    private Long bgmAgitNoticeFileId;
    
    // BGM 아지트 공지사항 ID
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "BGM_AGIT_NOTICE_ID")
    private BgmAgitNotice bgmAgitNotice;
    
    // BGM 아지트 공지사항 파일 이름
    @Column(name = "BGM_AGIT_NOTICE_FILE_NAME")
    private String bgmAgitNoticeFileName;
    
    // BGM 아지트 공지사항 파일 UUID 이름
    @Column(name = "BGM_AGIT_NOTICE_FILE_UUID_NAME")
    private String bgmAgitNoticeFileUuidName;
    
    // BGM 아지트 공지사항 파일 URL
    @Column(name = "BGM_AGIT_NOTICE_FILE_URL")
    private String bgmAgitNoticeFileUrl;
    
    
    public void setNoticeInternal(BgmAgitNotice notice) {
        this.bgmAgitNotice = notice;
    }
    
    public BgmAgitNoticeFile(BgmAgitNotice notice, String fileName, String uuidName, String url) {
        this.bgmAgitNotice = notice;
        this.bgmAgitNoticeFileName = fileName;
        this.bgmAgitNoticeFileUuidName = uuidName;
        this.bgmAgitNoticeFileUrl = url;
    }
}
