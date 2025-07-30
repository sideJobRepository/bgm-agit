package com.bgmagitapi.service.impl;

import com.bgmagitapi.RepositoryAndServiceTestSupport;
import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.config.UploadResult;
import com.bgmagitapi.controller.request.BgmAgitImageCreateRequest;
import com.bgmagitapi.controller.request.BgmAgitImageModifyRequest;
import com.bgmagitapi.entity.BgmAgitImage;
import com.bgmagitapi.entity.enumeration.BgmAgitImageCategory;
import com.bgmagitapi.service.BgmAgitImageService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mock.web.MockMultipartFile;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.Optional;

class BgmAgitImageServiceImplTest extends RepositoryAndServiceTestSupport {
    
    
    @Autowired
    private BgmAgitImageService bgmAgitImageService;
    
    @DisplayName("")
    @Test
    void test() throws IOException {
        // given
        Long mainMenuId = 2L;
        BgmAgitImageCategory category = BgmAgitImageCategory.MURDER; // 예시 enum 값
        String label = "게임9";
        String groups = null;
        String menuLink = "/detail/game";
        
        // 파일 읽기 (test resource 내 파일)
        File file = new File("src/test/java/com/bgmagitapi/image/복합기.jpg");
        FileInputStream fis = new FileInputStream(file);
        MockMultipartFile multipartFile = new MockMultipartFile(
                "bgmAgitImage", file.getName(), "image/jpeg", fis
        );
        
        BgmAgitImageCreateRequest request = new BgmAgitImageCreateRequest();
        request.setBgmAgitMainMenuId(mainMenuId);
        request.setBgmAgitImageCategory(category);
        request.setBgmAgitImageLabel(label);
        request.setBgmAgitImageGroups(groups);
        request.setBgmAgitMenuLink(menuLink);
        request.setBgmAgitImage(multipartFile);
        
        // when
        ApiResponse response = bgmAgitImageService.createBgmAgitImage(request);
    
    }
    
    @DisplayName("")
    @Test
    void test2() throws IOException {
        Long imageId = 31L;
        Long mainMenuId = 2L;
        
        BgmAgitImageModifyRequest request = new BgmAgitImageModifyRequest();
        request.setBgmAgitImageId(imageId);
        request.setBgmAgitMainMenuId(mainMenuId);
        request.setBgmAgitImageLabel("수정된 asdasdsdsdsdsd");
        request.setBgmAgitImageCategory(BgmAgitImageCategory.MURDER); // 예시 enum
        
        // 삭제할 파일 URL 세팅
        request.setDeletedFiles("https://bgm-agit-files.s3.ap-northeast-2.amazonaws.com/images/d98dc7ea-3779-45dd-9553-8fdb699cacfa.jpg");
        
        // 대체할 이미지 파일 (테스트 리소스 폴더에 있는 파일 사용)
        File file = new File("src/test/java/com/bgmagitapi/image/nginx 설정.png");
        FileInputStream inputStream = new FileInputStream(file);

        MockMultipartFile multipartFile = new MockMultipartFile(
                "bgmAgitImage",
                file.getName(),
                "image/png",
                inputStream
        );
        
//        File file = new File("src/test/java/com/bgmagitapi/image/복합기.jpg");
//        FileInputStream fis = new FileInputStream(file);
//        MockMultipartFile multipartFile = new MockMultipartFile(
//                "bgmAgitImage", file.getName(), "image/jpeg", fis
//        );
//
       request.setBgmAgitImage(multipartFile);
        
        // when
        ApiResponse response = bgmAgitImageService.modifyBgmAgitImage(request);
    }
    
    @DisplayName("")
    @Test
    void test3(){
        Long imageId = 31L;;
        bgmAgitImageService.deleteBgmAgitImage(imageId);
    }
}