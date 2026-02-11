package com.bgmagitapi.kml.record.controller;


import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.kml.record.dto.request.RecordPostRequest;
import com.bgmagitapi.kml.record.dto.request.RecordPutRequest;
import com.bgmagitapi.kml.record.dto.response.RecordGetDetailResponse;
import com.bgmagitapi.kml.record.dto.response.RecordGetResponse;
import com.bgmagitapi.kml.record.service.RecordService;
import com.bgmagitapi.page.PageResponse;
import com.bgmagitapi.util.JwtParserUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/bgm-agit")
public class RecordController {
    
    private final RecordService recordService;
    
    @GetMapping("/record")
    public PageResponse<RecordGetResponse> getRecord(@PageableDefault(size = 10) Pageable pageable) {
        Page<RecordGetResponse> records = recordService.getRecords(pageable);
        return PageResponse.from(records);
    }
    
    @GetMapping("/record/{id}")
    public RecordGetDetailResponse getDetailRecord(@PathVariable Long id) {
        return recordService.getRecordDetail(id);
    }
    
    @PostMapping("/record")
    public ApiResponse createRecord(@Validated @ModelAttribute RecordPostRequest request, @AuthenticationPrincipal Jwt jwt) {
        Long memberId = JwtParserUtil.extractMemberId(jwt);
        return recordService.createRecord(request, memberId);
    }
    
    @PutMapping("/record")
    ApiResponse modifyRecord(@Validated @ModelAttribute RecordPutRequest request, @AuthenticationPrincipal Jwt jwt) {
        Long memberId = JwtParserUtil.extractMemberId(jwt);
        return recordService.updateRecord(request, memberId);
    }
    
    @DeleteMapping("/record")
    public ApiResponse deleteRecord(@RequestParam Long id,@AuthenticationPrincipal Jwt jwt) {
        Long memberId = JwtParserUtil.extractMemberId(jwt);
        return recordService.removeRecord(id,memberId);
    }
}
