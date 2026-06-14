package com.bgmagitapi.kml.sanbaeman.controller;

import com.bgmagitapi.kml.sanbaeman.dto.response.SanbaemanDetailGetResponse;
import com.bgmagitapi.kml.sanbaeman.dto.response.SanbaemanPivotResponse;
import com.bgmagitapi.kml.sanbaeman.service.SanbaemanService;
import com.bgmagitapi.page.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/bgm-agit")
public class SanbaemanController {

    private final SanbaemanService sanbaemanService;

    @GetMapping("/sanbaeman-pivot")
    public PageResponse<SanbaemanPivotResponse> getPivotSanbaeman(@PageableDefault(size = 10) Pageable pageable, @RequestParam(required = false) String nickName) {
        Page<SanbaemanPivotResponse> pivotSanbaeman = sanbaemanService.getPivotSanbaeman(nickName, pageable);
        return PageResponse.from(pivotSanbaeman);
    }

    @GetMapping("/sanbaeman-detail")
    public PageResponse<SanbaemanDetailGetResponse> getSanbaemanDetail(@PageableDefault(size = 10) Pageable pageable) {
        Page<SanbaemanDetailGetResponse> detailSanbaeman = sanbaemanService.getDetailSanbaeman(pageable);
        return PageResponse.from(detailSanbaeman);
    }
}
