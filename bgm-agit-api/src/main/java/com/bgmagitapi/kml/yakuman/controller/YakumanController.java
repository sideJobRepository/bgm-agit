package com.bgmagitapi.kml.yakuman.controller;

import com.bgmagitapi.kml.yakuman.dto.response.YakumanDetailGetResponse;
import com.bgmagitapi.kml.yakuman.dto.response.YakumanGetResponse;
import com.bgmagitapi.kml.yakuman.service.YakumanService;
import com.bgmagitapi.page.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/bgm-agit")
public class YakumanController {

    private final YakumanService yakumanService;
    
    @GetMapping("/yakuman-pivot")
    public List<YakumanGetResponse> getPivotYakuman() {
        return yakumanService.getPivotYakuman();
    }
    
    @GetMapping("/yakuman-detail")
    public PageResponse<YakumanDetailGetResponse> getYakumanDetail(@PageableDefault(size = 10) Pageable pageable) {
        Page<YakumanDetailGetResponse> detailYakuman = yakumanService.getDetailYakuman(pageable);
        return PageResponse.from(detailYakuman);
    }
}
