package com.bgmagitapi.service.impl;

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
    public void refreshTokenSaveOrUpdate(BgmAgitMember member, String refreshTokenValue, LocalDateTime expiresAt) {
        BgmAgitRefreshToken token = bgmAgitRefreshTokenRepository
                .findByBgmAgitMember(member)
                .orElse(BgmAgitRefreshToken.builder()
                        .bgmAgitMember(member)
                        .bgmAgitRefreshTokenValue(refreshTokenValue)
                        .bgmAgitRefreshExpiresDate(expiresAt)
                        .build()
                );
        
        // 이미 존재한다면 값만 갱신
        if (token.getBgmAgitRefreshTokenId() != null) {
            token.updateToken(refreshTokenValue, expiresAt);
        }
        bgmAgitRefreshTokenRepository.save(token);
    }
    
    
    public BgmAgitMember validateRefreshToken(String refreshToken) {
        BgmAgitRefreshToken token = bgmAgitRefreshTokenRepository
                .findByBgmAgitRefreshTokenValue(refreshToken)
                .orElseThrow(() -> new RuntimeException("유효하지 않은 리프레시 토큰입니다."));
        
        if (token.getBgmAgitRefreshExpiresDate().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("리프레시 토큰이 만료되었습니다.");
        }
        
        return token.getBgmAgitMember(); // fetch join 필요시 수정
    }
    
    public TokenAndUser reissueTokenWithUser(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            return null; // 또는 throw new ResponseStatusException(HttpStatus.UNAUTHORIZED)
        }
        
        BgmAgitMember member = validateRefreshToken(refreshToken);
        
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
                    LocalDateTime.now().plusDays(1)
            );
            
            // 로그인 때와 동일하게 DTO 생성
            BgmAgitMemberResponseDto user = BgmAgitMemberResponseDto.create(member, authorities);
            
            return new TokenAndUser(token, user);
        } catch (JOSEException e) {
            throw new RuntimeException("JWT 생성 실패", e);
        }
    }
    
    
    @Override
    public ApiResponse deleteRefesh(String request) {
        BgmAgitRefreshToken bgmAgitRefreshToken = bgmAgitRefreshTokenRepository.findByBgmAgitRefreshTokenValue(request).orElseThrow(() -> new RuntimeException("존재하지않는 리프레쉬 토큰입니다."));
        bgmAgitRefreshTokenRepository.delete(bgmAgitRefreshToken);
        return new ApiResponse(200,true,"정상 삭제");
    }
}
