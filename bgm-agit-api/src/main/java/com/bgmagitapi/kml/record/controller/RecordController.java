package com.bgmagitapi.kml.record.controller;


import com.bgmagitapi.origin.apiresponse.ApiResponse;
import com.bgmagitapi.kml.record.dto.request.RecordPostRequest;
import com.bgmagitapi.kml.record.dto.request.RecordPutRequest;
import com.bgmagitapi.kml.record.dto.response.RecordGetDetailResponse;
import com.bgmagitapi.kml.record.dto.response.RecordGetResponse;
import com.bgmagitapi.kml.record.service.RecordService;
import com.bgmagitapi.kml.yakamantype.dto.response.MembersGetResponse;
import com.bgmagitapi.origin.page.PageResponse;
import com.bgmagitapi.origin.util.JwtParserUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/bgm-agit")
public class RecordController {
    
    private final RecordService recordService;
    
    @GetMapping("/record")
    public PageResponse<RecordGetResponse> getRecord(@PageableDefault(size = 10) Pageable pageable
            ,@RequestParam(name = "startDate", required = false) String startDate
            ,@RequestParam(name = "endDate" , required = false) String endDate
            ,@RequestParam(name= "nickName", required = false) String nickName
            ,@RequestParam(name= "tournamentStatus", required = false) String tournamentStatus
            ,@RequestParam(name= "bonusType", required = false) String bonusType
            ,@AuthenticationPrincipal Jwt jwt
    ) {
        Page<RecordGetResponse> records = recordService.getRecords(pageable,startDate,endDate,nickName,tournamentStatus,bonusType, JwtParserUtil.extractRoles(jwt));
        return PageResponse.from(records);
    }

    @PutMapping("/record/{id}/restore")
    public ApiResponse restoreRecord(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        return recordService.restoreRecord(id, JwtParserUtil.extractRoles(jwt));
    }

    @GetMapping("/record/recent-members")
    public List<MembersGetResponse> getRecentMembers() {
        return recordService.getRecentMembers();
    }

    @GetMapping("/record/{id}")
    public RecordGetDetailResponse getDetailRecord(@PathVariable Long id) {
        return recordService.getRecordDetail(id);
    }
    
    @PostMapping("/record")
    public ApiResponse createRecord(@Validated @RequestBody RecordPostRequest request, @AuthenticationPrincipal Jwt jwt) {
        Long memberId = JwtParserUtil.extractMemberId(jwt);
        return recordService.createRecord(request, memberId);
    }

    @PutMapping("/record")
    ApiResponse modifyRecord(@Validated @RequestBody RecordPutRequest request, @AuthenticationPrincipal Jwt jwt) {
        Long memberId = JwtParserUtil.extractMemberId(jwt);
        return recordService.updateRecord(request, memberId);
    }
    
    @DeleteMapping("/record/{id}")
    public ApiResponse deleteRecord(@PathVariable Long id,@AuthenticationPrincipal Jwt jwt) {
        Long memberId = JwtParserUtil.extractMemberId(jwt);
        return recordService.removeRecord(id,memberId);
    }
}
