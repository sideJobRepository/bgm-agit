package com.bgmagitapi.service;

import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.controller.request.BgmAgitMemberNicknameChangeRequest;
import com.bgmagitapi.controller.request.BgmAgitMemberPasswordChangeRequest;
import com.bgmagitapi.controller.request.BgmAgitRoleModifyRequest;
import com.bgmagitapi.controller.response.BgmAgitRoleResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface BgmAgitRoleService {

    Page<BgmAgitRoleResponse> getRoles(Pageable pageable, String request);

    Page<BgmAgitRoleResponse> getMahjongRoles(Pageable pageable, String request);

    ApiResponse modifyRole(List<BgmAgitRoleModifyRequest> request, List<String> actorRoles);

    ApiResponse changePassword(BgmAgitMemberPasswordChangeRequest request, List<String> actorRoles);

    ApiResponse changeNickname(BgmAgitMemberNicknameChangeRequest request, List<String> actorRoles);

    // 소셜 회원 하드 삭제 (관리자 전용, 자식 데이터 없을 때만)
    ApiResponse deleteSocialMember(Long memberId, List<String> actorRoles);

    // 관리자가 자체로그인 회원의 마작(BML) 연동을 켜고 끔 (use=true면 KML 등록까지)
    ApiResponse setMahjongUse(Long memberId, boolean use, List<String> actorRoles);
}
