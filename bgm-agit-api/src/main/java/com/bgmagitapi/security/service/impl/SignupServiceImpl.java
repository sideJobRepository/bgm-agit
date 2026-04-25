package com.bgmagitapi.security.service.impl;

import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.entity.BgmAgitMember;
import com.bgmagitapi.entity.BgmAgitMemberRole;
import com.bgmagitapi.entity.BgmAgitRole;
import com.bgmagitapi.entity.enumeration.BgmAgitSocialType;
import com.bgmagitapi.event.dto.MemberJoinedEvent;
import com.bgmagitapi.repository.BgmAgitMemberRepository;
import com.bgmagitapi.repository.BgmAgitMemberRoleRepository;
import com.bgmagitapi.repository.impl.BgmAgitMemberDetailRepositoryImpl;
import com.bgmagitapi.security.service.SignupService;
import com.bgmagitapi.security.service.kml.KmlUserClient;
import com.bgmagitapi.security.service.request.SignupRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class SignupServiceImpl implements SignupService {

    private final BgmAgitMemberRepository bgmAgitMemberRepository;
    private final BgmAgitMemberRoleRepository bgmAgitMemberRoleRepository;
    private final BgmAgitMemberDetailRepositoryImpl bgmAgitMemberDetailRepository;
    private final PasswordEncoder passwordEncoder;
    private final KmlUserClient kmlUserClient;
    private final ApplicationEventPublisher eventPublisher;

    @Override
    public ApiResponse signup(SignupRequest request) {
        String nickname = request.getNickname().trim();

        if (bgmAgitMemberRepository.existsByBgmAgitMemberNicknameAndSocialType(nickname, BgmAgitSocialType.MAHJONG)) {
            return new ApiResponse(409, false, "이미 사용 중인 닉네임입니다.");
        }

        String hashedPassword = passwordEncoder.encode(request.getPassword());
        Long kmlId = kmlUserClient.findSingleKmlIdByNickname(nickname).orElse(null);

        BgmAgitMember member = new BgmAgitMember(
                request.getName(),
                nickname,
                request.getPhoneNo(),
                hashedPassword,
                kmlId
        );
        BgmAgitMember saved = bgmAgitMemberRepository.save(member);

        BgmAgitRole userRole = bgmAgitMemberDetailRepository.findByBgmAgitRoleName("USER");
        bgmAgitMemberRoleRepository.save(new BgmAgitMemberRole(saved, userRole));

//        eventPublisher.publishEvent(new MemberJoinedEvent(saved.getBgmAgitMemberId()));

        return new ApiResponse(200, true, "회원가입이 완료되었습니다.");
    }
}
