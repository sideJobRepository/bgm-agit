package com.bgmagitapi.kml.rule.entity;

import com.bgmagitapi.kml.rule.dto.request.RulePutRequest;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Table(name = "BGM_AGIT_RULE")
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Builder
public class Rule {

    // BGM 아지트 룰 ID
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "BGM_AGIT_RULE_ID")
    private Long id;

    // BGM 아지트 룰 제목
    @Column(name = "BGM_AGIT_RULE_TITLE")
    private String title;

    // BGM 아지트 대회 여부
    @Column(name = "BGM_AGIT_TOURNAMENT_STATUS")
    private Boolean tournamentStatus;
    
    public void modifyTitle(String title) {
        this.title = title;
    }
    
    public void modify(RulePutRequest request) {
        this.title = request.getTitle();
        this.tournamentStatus = request.getTournamentStatus();
    }
}
