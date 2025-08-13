package com.bgmagitapi.service.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BizTalkResponse {
    private String responseCode;
    private List<Item> response;   // 응답 배열
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Item {
        private String uid;
        private String msgIdx;
        private String resultCode;
        private String receivedAt;
        private String requestAt;
        private String bsid;
        private String sendType;
    }
}
