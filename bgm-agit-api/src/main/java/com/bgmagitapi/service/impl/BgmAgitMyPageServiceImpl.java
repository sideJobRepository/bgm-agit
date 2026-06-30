package com.bgmagitapi.service.impl;

import com.bgmagitapi.advice.exception.ValidException;
import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.controller.request.BgmAgitMyPasswordChangeRequest;
import com.bgmagitapi.controller.response.BgmAgitMyPageGetResponse;
import com.bgmagitapi.controller.response.notice.BgmAgitMyPagePutRequest;
import com.bgmagitapi.entity.BgmAgitMember;
import com.bgmagitapi.entity.enumeration.BgmAgitSocialType;
import com.bgmagitapi.repository.BgmAgitMemberRepository;
import com.bgmagitapi.security.service.kml.KmlUserClient;
import com.bgmagitapi.service.BgmAgitMyPageService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Transactional
@Service
@RequiredArgsConstructor
public class BgmAgitMyPageServiceImpl implements BgmAgitMyPageService {

    private final BgmAgitMemberRepository  bgmAgitMemberRepository;
    private final PasswordEncoder passwordEncoder;
    private final KmlUserClient kmlUserClient;

    @Override
    public BgmAgitMyPageGetResponse getMyPage(Long id) {
        return bgmAgitMemberRepository.findByMyPage(id);
    }

    @Override
    public ApiResponse modifyMyPage(BgmAgitMyPagePutRequest request) {
        BgmAgitMember bgmAgitMember = bgmAgitMemberRepository.findById(request.getId()).orElseThrow(() -> new RuntimeException("존재 하지 않는 회원입니다."));
        bgmAgitMember.modifyMyPage(request);
        return new ApiResponse(200,true,"내정보 가 수정되었습니다.");
    }

    @Override
    public ApiResponse changeMyPassword(Long memberId, BgmAgitMyPasswordChangeRequest request) {
        BgmAgitMember member = bgmAgitMemberRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("존재 하지 않는 회원입니다."));

        if (member.getSocialType() != BgmAgitSocialType.MAHJONG) {
            throw new ValidException("마작 회원만 비밀번호를 변경할 수 있습니다.");
        }

        if (!passwordEncoder.matches(request.getCurrentPassword(), member.getBgmAgitMemberPassword())) {
            throw new ValidException("현재 비밀번호가 일치하지 않습니다.");
        }

        member.changePassword(passwordEncoder.encode(request.getNewPassword()));
        return new ApiResponse(200, true, "비밀번호가 변경되었습니다.");
    }

    @Override
    public ApiResponse applyMahjongUse(Long memberId) {
        BgmAgitMember member = bgmAgitMemberRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("존재 하지 않는 회원입니다."));

        if (member.getSocialType() != BgmAgitSocialType.MAHJONG) {
            throw new ValidException("자체로그인 회원만 마작 기록 이용을 신청할 수 있습니다.");
        }
        if ("Y".equals(member.getBgmAgitMemberMahjongUseStatus())) {
            return new ApiResponse(200, true, "이미 마작 기록 이용 회원입니다.");
        }

        // 신청 시점에 KML 조회·자동등록. 실패해도 enableMahjongUse가 synk='N'으로 두어 스케줄러가 매시 재시도.
        Long kmlId = kmlUserClient.findOrRegisterKmlIdByNickname(member.getBgmAgitMemberNickname()).orElse(null);
        member.enableMahjongUse(kmlId);
        return new ApiResponse(200, true, "마작 기록 이용 신청이 완료되었습니다.");
    }

    @Override
    public ApiResponse cancelMahjongUse(Long memberId) {
        BgmAgitMember member = bgmAgitMemberRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("존재 하지 않는 회원입니다."));

        if (!"Y".equals(member.getBgmAgitMemberMahjongUseStatus())) {
            return new ApiResponse(200, true, "이미 마작 기록 미이용 상태입니다.");
        }
        member.disableMahjongUse();
        return new ApiResponse(200, true, "마작 기록 이용이 해지되었습니다.");
    }
}
