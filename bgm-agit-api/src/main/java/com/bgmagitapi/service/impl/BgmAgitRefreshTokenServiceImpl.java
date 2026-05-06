package com.bgmagitapi.service.impl;

import com.bgmagitapi.advice.exception.RefreshTokenExpiredException;
import com.bgmagitapi.advice.exception.RefreshTokenInvalidException;
import com.bgmagitapi.advice.exception.RefreshTokenMissingException;
import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.entity.BgmAgitMember;
import com.bgmagitapi.entity.BgmAgitRefreshToken;
import com.bgmagitapi.repository.BgmAgitRefreshTokenRepository;
import com.bgmagitapi.security.dto.BgmAgitMemberResponseDto;
import com.bgmagitapi.security.dto.TokenAndUser;
import com.bgmagitapi.security.handler.TokenPair;
import com.bgmagitapi.security.jwt.RsaSecuritySigner;
import com.bgmagitapi.service.BgmAgitMemberRoleService;
import com.bgmagitapi.service.BgmAgitRefreshTokenService;
import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.jwk.JWK;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class BgmAgitRefreshTokenServiceImpl implements BgmAgitRefreshTokenService {

    private final BgmAgitRefreshTokenRepository bgmAgitRefreshTokenRepository;
    private final BgmAgitMemberRoleService bgmAgitMemberRoleService;
    private final RsaSecuritySigner rsaSecuritySigner;
    private final JWK jwk;

    @Override
    public void refreshTokenSaveOrUpdate(BgmAgitMember member, String refreshTokenValue, LocalDateTime expiresAt, String platformId) {
        if (platformId == null || platformId.isBlank()) {
            throw new RefreshTokenInvalidException("디바이스 식별자가 없습니다.");
        }

        BgmAgitRefreshToken token = bgmAgitRefreshTokenRepository
                .findByMemberAndPlatformId(member, platformId)
                .orElse(BgmAgitRefreshToken.builder()
                        .bgmAgitMember(member)
                        .bgmAgitRefreshTokenValue(refreshTokenValue)
                        .bgmAgitRefreshExpiresDate(expiresAt)
                        .bgmAgitRefreshPlatformId(platformId)
                        .build()
                );

        // 이미 존재한다면 값만 갱신
        if (token.getBgmAgitRefreshTokenId() != null) {
            token.updateToken(refreshTokenValue, expiresAt);
        }
        bgmAgitRefreshTokenRepository.save(token);
    }


    @Override
    public TokenAndUser reissueTokenWithUser(String refreshToken, String platformId) {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new RefreshTokenMissingException("리프레시 토큰이 없습니다.");
        }
        if (platformId == null || platformId.isBlank()) {
            throw new RefreshTokenInvalidException("디바이스 식별자가 없습니다.");
        }

        BgmAgitMember member = validateRefreshToken(refreshToken, platformId);

        String roleName = bgmAgitMemberRoleService
                .getMemberRole(member.getBgmAgitMemberId())
                .getBgmAgitRole()
                .getBgmAgitRoleName();

        List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority(roleName));

        try {
            TokenPair token = rsaSecuritySigner.getToken(member, jwk, authorities);

            refreshTokenSaveOrUpdate(
                    member,
                    token.getRefreshToken(),
                    LocalDateTime.now().plusDays(1),
                    platformId
            );

            // 로그인 때와 동일하게 DTO 생성
            BgmAgitMemberResponseDto user = BgmAgitMemberResponseDto.create(member, authorities);

            return new TokenAndUser(token, user);
        } catch (JOSEException e) {
            throw new RuntimeException("JWT 생성 실패", e);
        }
    }


    @Override
    public ApiResponse deleteRefresh(String refreshToken, String platformId) {
        if (refreshToken == null || refreshToken.isBlank() || platformId == null || platformId.isBlank()) {
            return new ApiResponse(200, true, "정상 삭제");
        }
        bgmAgitRefreshTokenRepository.findByTokenValueAndPlatformId(refreshToken, platformId)
                .ifPresent(bgmAgitRefreshTokenRepository::delete);
        return new ApiResponse(200, true, "정상 삭제");
    }

    private BgmAgitMember validateRefreshToken(String refreshToken, String platformId) {
        BgmAgitRefreshToken token = bgmAgitRefreshTokenRepository
                .findByTokenValueAndPlatformId(refreshToken, platformId)
                .orElseThrow(() -> new RefreshTokenInvalidException("리프레시 토큰이 유효하지 않습니다."));

        if (token.getBgmAgitRefreshExpiresDate().isBefore(LocalDateTime.now())) {
            bgmAgitRefreshTokenRepository.delete(token);
            throw new RefreshTokenExpiredException("리프레시 토큰이 만료되었습니다.");
        }

        return token.getBgmAgitMember();
    }
}
