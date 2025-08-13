package com.bgmagitapi.controller;


import com.bgmagitapi.service.BgmAgitBizTalkService;
import com.bgmagitapi.service.response.BizTalkTokenResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/bgm-agit")
public class BgmAgitBiztalkController {

        private final BgmAgitBizTalkService bgmAgitBiztalkService;
    
        @PostMapping("/biztalkToken")
        public Map<String,String> getBiztalkToken(){
                BizTalkTokenResponse bizTalkToken = bgmAgitBiztalkService.getBizTalkToken();
                Map<String,String> map = new HashMap<>();
                map.put("biztalkToken", bizTalkToken.getToken());
                return map;
        }
}
