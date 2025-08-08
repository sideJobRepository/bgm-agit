package com.bgmagitapi.entity;

import com.bgmagitapi.entity.mapperd.DateSuperClass;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Table(name = "BGM_AGIT_REFRESH_TOKEN")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class BgmAgitRefreshToken extends DateSuperClass {
    
    // BGM 아지트 리프레쉬 토큰 ID
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "BGM_AGIT_REFRESH_TOKEN_ID")
    private Long bgmAgitRefreshTokenId;
    
    // BGM 아지트 회원 ID
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "BGM_AGIT_MEMBER_ID")
    private BgmAgitMember bgmAgitMember;
    
    // BGM 아지트 리프레쉬 토큰 값
    @Column(name = "BGM_AGIT_REFRESH_TOKEN_VALUE")
    private String bgmAgitRefreshTokenValue;
    
    // BGM 아지트 리프레쉬 만료 일시
    @Column(name = "BGM_AGIT_REFRESH_EXPIRES_DATE")
    private LocalDateTime bgmAgitRefreshExpiresDate;
    
    // BGM 아지트 리프레쉬 플랫폼 ID
    @Column(name = "BGM_AGIT_REFRESH_PLATFORM_ID")
    private String bgmAgitRefreshPlatformId;
    
    public void updateToken(String refreshTokenValue, LocalDateTime expiresAt) {
        this.bgmAgitRefreshTokenValue = refreshTokenValue;
        this.bgmAgitRefreshExpiresDate = expiresAt;
    }
}
