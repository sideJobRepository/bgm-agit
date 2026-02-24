package com.bgmagitapi.kml.review.service.impl;

import com.bgmagitapi.RepositoryAndServiceTestSupport;
import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.kml.review.dto.request.ReviewPostRequest;
import com.bgmagitapi.kml.review.dto.request.ReviewPutRequest;
import com.bgmagitapi.kml.review.dto.response.ReviewGetDetailResponse;
import com.bgmagitapi.kml.review.dto.response.ReviewGetResponse;
import com.bgmagitapi.kml.review.service.ReviewService;
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

import static org.junit.jupiter.api.Assertions.*;

class ReviewServiceImplTest extends RepositoryAndServiceTestSupport {
 
    @Autowired
    private ReviewService reviewService;
    
    @DisplayName("")
    @Test
    void test1() throws IOException {
        long memberId = 1L;
        String title = "후기제목";
        String cont = "후기내용";
        
        File file1 = new File("src/test/java/com/bgmagitapi/file/사암각.png");
        FileInputStream fis1 = new FileInputStream(file1);
        
        
        File file2 = new File("src/test/java/com/bgmagitapi/file/구련보등.png");
        FileInputStream fis2 = new FileInputStream(file1);
        
        MockMultipartFile multipartFile1 = new MockMultipartFile("파일1", file1.getName(), "image/jpeg", fis1);
        MockMultipartFile multipartFile2 = new MockMultipartFile("파일1", file2.getName(), "image/jpeg", fis2);
        
        List<MultipartFile> multipartFile3 = List.of(multipartFile1, multipartFile2);
        ReviewPostRequest request = new ReviewPostRequest(
                memberId,title, cont,multipartFile3
        );
        ApiResponse review = reviewService.createReview(request);
        System.out.println(review);
    }
    
    @DisplayName("")
    @Test
    void test2() throws IOException {
        long memberId = 1L;
        String title = "후기제목3";
        String cont = "후기내용3";
        
        File file1 = new File("src/test/java/com/bgmagitapi/file/사암각.png");
        FileInputStream fis1 = new FileInputStream(file1);
        
        
        MockMultipartFile multipartFile1 = new MockMultipartFile("파일1", file1.getName(), "image/jpeg", fis1);
        
        List<MultipartFile> multipartFile3 = List.of(multipartFile1);
        List<Long> longs = List.of(159L,161L);
        ReviewPutRequest request = new ReviewPutRequest(1L,memberId,title, cont,longs,null);
        ApiResponse review = reviewService.modifyReview(request);
        System.out.println(review);
    }
    
    
    @DisplayName("")
    @Test
    void test3(){
        
        PageRequest pageRequest = PageRequest.of(0, 10);
        Page<ReviewGetResponse> reviews = reviewService.getReviews(pageRequest, null);
        System.out.println("reviews = " + reviews);
    }
    
    @DisplayName("")
    @Test
    void test4(){
        ReviewGetDetailResponse reviewDetail = reviewService.getReviewDetail(1L, 1L);
        System.out.println("reviewDetail = " + reviewDetail);
    }
    
    @DisplayName("")
    @Test
    void test5(){
        ApiResponse apiResponse = reviewService.deleteReview(2L, 1L);
        System.out.println(apiResponse);
    }
}