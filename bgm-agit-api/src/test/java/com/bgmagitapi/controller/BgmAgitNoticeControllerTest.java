package com.bgmagitapi.controller;

import com.bgmagitapi.ControllerTestSupport;
import com.bgmagitapi.service.BgmAgitNoticeService;
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

class BgmAgitNoticeControllerTest extends ControllerTestSupport {
    
    @Autowired
    private BgmAgitNoticeService noticeService;
    
    private final String token = "eyJraWQiOiJtYWNLZXkiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyIiwic29jaWFsSWQiOiI0MzY1NzI5MTA2Iiwicm9sZXMiOlsiUk9MRV9BRE1JTiJdLCJuYW1lIjoi67Cw7ISx7ZmYIiwiaWQiOjYsImV4cCI6MTc1MzUxODUxN30.IeQKMzMUhWb6Vaik44PKDeS821t_BquoVr1eRLMq0WE";
    
    @DisplayName("")
    @Test
    void test() throws Exception {
        
        mockMvc.perform(post("/bgm-agit/notice")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andDo(print());
    
    }
    
    
}