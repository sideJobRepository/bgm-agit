package com.bgmagitapi.kml.notice.entity;


import com.bgmagitapi.entity.mapperd.DateSuperClass;
import com.bgmagitapi.kml.notice.dto.request.KmlNoticePutRequest;
import jakarta.persistence.*;
import lombok.*;

@Table(name = "BGM_AGIT_KML_NOTICE")
@Entity
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
@Builder
public class KmlNotice extends DateSuperClass {
   
    
    // BGM 아지트 KML 공지사항 ID
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "BGM_AGIT_KML_NOTICE_ID")
    private Long id;

    // BGM 아지트 KML 공지사항 제목
    @Column(name = "BGM_AGIT_KML_NOTICE_TITLE")
    private String noticeTitle;

    // BGM 아지트 KML 공지사항 내용
    @Column(name = "BGM_AGIT_KML_NOTICE_CONT")
    private String noticeCont;
    
    public void modify(KmlNoticePutRequest request) {
        this.noticeTitle = request.getTitle();
        this.noticeCont = request.getCont();
    }
}
