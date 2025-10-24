package com.bgmagitapi.entity;

import com.bgmagitapi.entity.mapperd.DateSuperClass;
import jakarta.persistence.*;
import lombok.Getter;

@Table(name = "BGM_AGIT_FREE")
@Entity
@Getter
public class BgmAgitFree extends DateSuperClass {

    
    // BGM 아지트 자유 ID
    @Column(name = "BGM_AGIT_FREE_ID")
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long bgmAgitFreeId;

    // BGM 아지트 회원 ID
    @JoinColumn(name = "BGM_AGIT_MEMBER_ID")
    @ManyToOne(fetch = FetchType.LAZY)
    private BgmAgitMember bgmAgitMember;

    // BGM 아지트 자유 제목
    @Column(name = "BGM_AGIT_FREE_TITLE")
    private String bgmAgitFreeTitle;

    // BGM 아지트 자유 내용
    @Column(name = "BGM_AGIT_FREE_CONT")
    private String bgmAgitFreeCont;
}
