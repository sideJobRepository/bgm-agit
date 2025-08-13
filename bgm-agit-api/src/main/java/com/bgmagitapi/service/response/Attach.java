package com.bgmagitapi.service.response;

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
        @JsonProperty("url_mobile")
        private String urlMobile;
        
        @JsonProperty("url_pc")
        private String urlPc;
        
        public static Button wl(String name, String url) {
            return new Button(name, "WL", url, url);
        }
    }
}
