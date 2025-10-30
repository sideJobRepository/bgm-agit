package com.bgmagitapi.service.impl;

import com.bgmagitapi.RepositoryAndServiceTestSupport;
import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.controller.request.BgmAgitCommonCommentPostRequest;
import com.bgmagitapi.controller.request.BgmAgitCommonCommentPutRequest;
import com.bgmagitapi.service.BgmAgitCommonCommentService;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import static org.assertj.core.api.Assertions.*;

class BgmAgitCommonCommentServiceImplTest extends RepositoryAndServiceTestSupport {
    
    @Autowired
    private BgmAgitCommonCommentService bgmAgitCommonCommentService;
    
    @DisplayName("댓글 작성")
    @Test
    void test1(){
        
        BgmAgitCommonCommentPostRequest commentRequest = new BgmAgitCommonCommentPostRequest(null, "테스트댓글2", 1L, 11L);
        
        ApiResponse comment = bgmAgitCommonCommentService.createComment(commentRequest);
        assertThat(comment).isNotNull();
    }
    
    @DisplayName("댓글 작성(대댓글)")
    @Test
    void test2(){
        BgmAgitCommonCommentPostRequest commentRequest = new BgmAgitCommonCommentPostRequest(1L, "테스트대댓글", 1L, 1L);
        ApiResponse comment = bgmAgitCommonCommentService.createComment(commentRequest);
        assertThat(comment).isNotNull();
    }
    
    @DisplayName("댓글 수정")
    @Test
    void test3(){
        BgmAgitCommonCommentPutRequest modifyComment = new BgmAgitCommonCommentPutRequest(7L, "수정");
        ApiResponse comment = bgmAgitCommonCommentService.modifyComment(modifyComment);
        assertThat(comment).isNotNull();
    }
    
    @DisplayName("댓글 삭제(삭제여부 Y로 바꾸기)")
    @Test
    void test(){
        ApiResponse comment = bgmAgitCommonCommentService.removeComment(7L);
        assertThat(comment).isNotNull();
    }
    
}