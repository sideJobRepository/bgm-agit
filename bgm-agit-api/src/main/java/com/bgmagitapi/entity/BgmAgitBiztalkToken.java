package com.bgmagitapi.entity;


import com.bgmagitapi.entity.mapperd.DateSuperClass;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "BGM_AGIT_BIZTALK_TOKEN")
@Getter
@NoArgsConstructor
public class BgmAgitBiztalkToken extends DateSuperClass {
    
    // BGM 아지트 비즈톡 토큰 ID
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "BGM_AGIT_BIZTALK_TOKEN_ID")
    private Long bgmAgitBiztalkTokenId;
    
    // BGM 아지트 비즈톡 토큰 값
    @Column(name = "BGM_AGIT_BIZTALK_TOKEN_VALUE")
    private String bgmAgitBiztalkTokenValue;
    
    // BGM 아지트 비즈톡 토큰 만료 일시
    @Column(name = "BGM_AGIT_BIZTALK_TOKEN_EXPIRES_DATE")
    private LocalDateTime bgmAgitBiztalkTokenExpiresDate;
    
    @Column(name = "BGM_AGIT_BIZTALK_IP")
    private String bgmAgitBiztalkIp;
    
    public BgmAgitBiztalkToken(String bgmAgitBiztalkTokenValue, LocalDateTime bgmAgitBiztalkTokenExpiresDate, String bgmAgitBiztalkIp) {
        this.bgmAgitBiztalkTokenValue = bgmAgitBiztalkTokenValue;
        this.bgmAgitBiztalkTokenExpiresDate = bgmAgitBiztalkTokenExpiresDate;
        this.bgmAgitBiztalkIp = bgmAgitBiztalkIp;
    }
}
