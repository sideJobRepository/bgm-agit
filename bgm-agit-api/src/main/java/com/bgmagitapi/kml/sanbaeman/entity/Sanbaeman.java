package com.bgmagitapi.kml.sanbaeman.entity;

import com.bgmagitapi.origin.entity.BgmAgitMember;
import com.bgmagitapi.origin.entity.mapperd.DateSuperClass;
import com.bgmagitapi.kml.matchs.entity.Matchs;
import com.bgmagitapi.kml.record.dto.request.RecordPutRequest;
import jakarta.persistence.*;
import lombok.*;

@Table(name = "BGM_AGIT_SANBAEMAN")
@Entity
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
@Builder
public class Sanbaeman extends DateSuperClass {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "BGM_AGIT_SANBAEMAN_ID")
    private Long id;

    @JoinColumn(name = "BGM_AGIT_MEMBER_ID")
    @ManyToOne(fetch = FetchType.LAZY)
    private BgmAgitMember member;

    @JoinColumn(name = "BGM_AGIT_MATCHS_ID")
    @ManyToOne(fetch = FetchType.LAZY)
    private Matchs matchs;

    @Column(name = "BGM_AGIT_SANBAEMAN_NAME")
    private String sanbaemanName;

    @Column(name = "BGM_AGIT_SANBAEMAN_CONT")
    private String sanbaemanCont;

    public void modify(RecordPutRequest.Sanbaemans dto, BgmAgitMember bgmAgitMember) {
        this.sanbaemanName = dto.getSanbaemanName();
        this.sanbaemanCont = dto.getSanbaemanCont();
        this.member = bgmAgitMember;
    }
}
