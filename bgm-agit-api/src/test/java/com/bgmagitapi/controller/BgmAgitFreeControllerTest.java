package com.bgmagitapi.controller;

import com.bgmagitapi.ControllerTestSupport;
import com.bgmagitapi.controller.request.BgmAgitFreePostRequest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;

import java.nio.charset.StandardCharsets;
import java.util.Collections;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.junit.jupiter.api.Assertions.*;

class BgmAgitFreeControllerTest extends ControllerTestSupport {
    
    @Autowired
    private BgmAgitFreeController bgmAgitFreeController;
    
    private final String token = "eyJraWQiOiJyc2FLZXkiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJ1c2VyIiwiZXhwaXJhdGlvblRpbWUiOjE3NjE2Mzc1MDYsInNvY2lhbElkIjoiNDM3MzE0NTc0MCIsInJvbGVzIjpbIlJPTEVfQURNSU4iXSwibmFtZSI6IuuwsOyEse2ZmCIsImlkIjoxMSwiZXhwIjoxNzYxNjQxMTA2fQ.i2-y61d6OmxIZ-oxifEzQ12P4HBz11QWdZBCQeiF_fgn4w4m58CrDsXTI8zKJpP7V7zo_QnotLhKm21EEm3aQdz_cf85tEt5lGfi0hzJalTRGXQV8oQoDC8GaKLdGf-i43SOoWL6UYFOoSXsfByp5L0C90bYMX1CSzBDsgKW8r9W3SQKfgnvr9fRzTPMYsQCCXmsSPZHv--BElguUNPJ6v8Kcap7810YndVIPeiwBLMgu4lBRxvsXOL6MDxi-5q0hFxAD5x9bT45kknAzEir88LtFx2CQE02XP86F_X7iwUu8EfiEntO7uURlt2jxAA1PQo9RxWg_3dBhttJi81VGw";
    
    @DisplayName("")
    @Test
    void test1() throws Exception {
        
          String dangerousContent = "<p>ㄹㅂㄹㅂㅈㄹ</p><script>alert('xss')</script> 제목";
      
          BgmAgitFreePostRequest req = new BgmAgitFreePostRequest(
              11L,
              "xss테스트",
              dangerousContent,
              Collections.emptyList()
          );
          mockMvc.perform(post("/bgm-agit/free")
                                .header("Authorization", "Bearer " + token)
                                 .contentType(MediaType.APPLICATION_JSON)
                                  .characterEncoding(StandardCharsets.UTF_8.name())
                         .content(objectMapper.writeValueAsString(req))
                         .accept(MediaType.APPLICATION_JSON)
                  )
                        .andDo(print());
    
    }
    
}