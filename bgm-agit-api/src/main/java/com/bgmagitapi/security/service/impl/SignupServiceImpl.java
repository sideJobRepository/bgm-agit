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
import org.springframework.transaction.support.TransactionTemplate;

import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class SignupServiceImpl implements SignupService {

    private static final ConcurrentHashMap<String, Object> NICKNAME_LOCKS = new ConcurrentHashMap<>();

    private final BgmAgitMemberRepository bgmAgitMemberRepository;
    private final BgmAgitMemberRoleRepository bgmAgitMemberRoleRepository;
    private final BgmAgitMemberDetailRepositoryImpl bgmAgitMemberDetailRepository;
    private final PasswordEncoder passwordEncoder;
    private final KmlUserClient kmlUserClient;
    private final ApplicationEventPublisher eventPublisher;
    private final TransactionTemplate transactionTemplate;

    @Override
    public ApiResponse signup(SignupRequest request) {
        String nickname = request.getNickname().trim();
        Object lock = NICKNAME_LOCKS.computeIfAbsent(nickname, k -> new Object());
        synchronized (lock) {
            try {
                return transactionTemplate.execute(status -> doSignup(request, nickname));
            } finally {
                NICKNAME_LOCKS.remove(nickname, lock);
            }
        }
    }

    private ApiResponse doSignup(SignupRequest request, String nickname) {
        if (bgmAgitMemberRepository.existsByBgmAgitMemberNicknameAndSocialType(nickname, BgmAgitSocialType.MAHJONG)) {
            return new ApiResponse(409, false, "이미 사용 중인 닉네임입니다.");
        }

        String hashedPassword = passwordEncoder.encode(request.getPassword());
        Long kmlId = kmlUserClient.findOrRegisterKmlIdByNickname(nickname).orElse(null);

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
