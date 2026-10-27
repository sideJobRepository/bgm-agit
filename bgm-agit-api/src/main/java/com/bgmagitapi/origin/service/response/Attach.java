package com.bgmagitapi.origin.service.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Attach {
    private List<Button> button;
   
    
    
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class Button {
        private String name;
        private String type;
        private String url_mobile;
        // 버튼은 카카오에 등록한 템플릿과 글자 단위로 같아야 한다(다르면 결과코드 3027).
        // PC 링크를 등록한 템플릿에만 넣고, 안 한 템플릿에 보내도 3027 이라 null 이면 아예 빼고 보낸다
        @JsonInclude(JsonInclude.Include.NON_NULL)
        private String url_pc;
        
        
        public static Button wl(String name, String url) {
            return new Button(name, "WL", url, null);
        }
        
        /** 모바일·PC 링크를 둘 다 등록한 템플릿용 */
        public static Button wl(String name, String mobileUrl, String pcUrl) {
            return new Button(name, "WL", mobileUrl, pcUrl);
        }
    }
}
