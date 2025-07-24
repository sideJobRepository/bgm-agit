package com.bgmagitapi.controller;

import com.bgmagitapi.ControllerTestSupport;
import com.bgmagitapi.service.BgmAgitMainMenuService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;

import static org.junit.jupiter.api.Assertions.*;

class BgmAgitMenuControllerTest extends ControllerTestSupport {
    
    @Autowired
    BgmAgitMainMenuService bgmAgitMainMenuService;
    
    
    @DisplayName("")
    @Test
    void test1() throws Exception {
        
        mockMvc.perform(get("/bgm-agit/main-menu"))
                .andExpect(status().isOk())
                .andDo(print());
        ;
    }
    @DisplayName("")
    @Test
    void test2() throws Exception {
        mockMvc.perform(post("/bgm-agit/kakao-login"))
                .andExpect(status().isOk())
                .andDo(print());
        ;
    
    }
    
}