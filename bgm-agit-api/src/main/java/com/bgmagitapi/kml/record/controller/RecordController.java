package com.bgmagitapi.kml.record.controller;


import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.kml.record.dto.request.RecordPostRequest;
import com.bgmagitapi.kml.record.dto.response.RecordGetDetailResponse;
import com.bgmagitapi.kml.record.dto.response.RecordGetResponse;
import com.bgmagitapi.kml.record.service.RecordService;
import com.bgmagitapi.page.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
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
    public RecordGetDetailResponse getDetailRecord(@PathVariable Long id){
        return recordService.getRecordDetail(id);
    }
    
    @PostMapping("/record")
    public ApiResponse createRecord(@Validated @ModelAttribute RecordPostRequest request) {
        return recordService.createRecord(request);
    }
}
