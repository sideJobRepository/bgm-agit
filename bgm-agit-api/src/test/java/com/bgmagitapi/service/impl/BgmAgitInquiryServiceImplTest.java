package com.bgmagitapi.service.impl;

import com.bgmagitapi.RepositoryAndServiceTestSupport;
import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.controller.request.BgmAgitInquiryPostRequest;
import com.bgmagitapi.controller.request.BgmAgitInquiryPutRequest;
import com.bgmagitapi.controller.response.BgmAgitInquiryGetDetailResponse;
import com.bgmagitapi.controller.response.BgmAgitInquiryGetResponse;
import com.bgmagitapi.service.BgmAgitInquiryService;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.List;

class BgmAgitInquiryServiceImplTest extends RepositoryAndServiceTestSupport {
    
    
    @Autowired
    private BgmAgitInquiryService bgmAgitInquiryService;
    
    @DisplayName("1:1문의 저장 테스트")
    @Test
    void test() throws IOException {
        File file = new File("src/test/java/com/bgmagitapi/file/이건 모자가 아니잖아.jpg");
             FileInputStream fis = new FileInputStream(file);
             MockMultipartFile multipartFile = new MockMultipartFile(
                     "bgmAgitImage", file.getName(), "image/jpeg", fis
             );
        List<MultipartFile> multipartFile1 = List.of(multipartFile);
        BgmAgitInquiryPostRequest request = new BgmAgitInquiryPostRequest(null, 11L, "1:1문의 제목 테스트", "1:1문의 테스트",multipartFile1);
        ApiResponse inquiry = bgmAgitInquiryService.createInquiry(request);
        Assertions.assertThat(inquiry).isNotNull();
    }
    @DisplayName("1:1문의 답글 테스트")
    @Test
    void test2() throws IOException{
        File file = new File("src/test/java/com/bgmagitapi/file/참새작.png");
                   FileInputStream fis = new FileInputStream(file);
                   MockMultipartFile multipartFile = new MockMultipartFile(
                           "bgmAgitImage", file.getName(), "image/jpeg", fis
                   );
        List<MultipartFile> multipartFile1 = List.of(multipartFile);
        BgmAgitInquiryPostRequest request = new BgmAgitInquiryPostRequest(3L, 11L, "1:1문의 답글 테스트", "1:1문의 답글 테스트",multipartFile1);
        ApiResponse inquiry = bgmAgitInquiryService.createInquiry(request);
        Assertions.assertThat(inquiry).isNotNull();
    }
    
    @DisplayName("1:1문의 조회")
    @Test
    void test3(){
        PageRequest pageRequest = PageRequest.of(0, 10);
        Page<BgmAgitInquiryGetResponse> result = bgmAgitInquiryService.getInquiry(11L, "ROLE_ADMIN", pageRequest);
        System.out.println("result = " + result);
    }
    
      @DisplayName("1:1상세 조회")
      @Test
      void test4(){
        BgmAgitInquiryGetDetailResponse detailInquiry = bgmAgitInquiryService.getDetailInquiry(3L);
        System.out.println("detailInquiry = " + detailInquiry);
      }
      
      @DisplayName("1:1 문의 수정")
      @Test
      void test5() throws IOException{
          List<Long> longs = List.of(32L);
          File file = new File("src/test/java/com/bgmagitapi/file/복합기.jpg");
                       FileInputStream fis = new FileInputStream(file);
                       MockMultipartFile multipartFile = new MockMultipartFile(
                               "bgmAgitImage", file.getName(), "image/jpeg", fis
                       );
          List<MultipartFile> multipartFile1 = List.of(multipartFile);
          BgmAgitInquiryPutRequest bgmAgitFreePutRequest = new BgmAgitInquiryPutRequest(
                  3L,
                  "수정테스트",
                  "수정내용",
                  longs,
                  multipartFile1
          );
          
          ApiResponse apiResponse = bgmAgitInquiryService.modifyInquiry(bgmAgitFreePutRequest);
          System.out.println("apiResponse = " + apiResponse);
      }
      
      @DisplayName("1:1문의 삭제")
      @Test
      void tes6(){
          
          ApiResponse apiResponse = bgmAgitInquiryService.deleteInquiry(3L);
          System.out.println("apiResponse = " + apiResponse);
      }
}