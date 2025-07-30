package com.bgmagitapi.service.impl;

import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.config.S3FileUtils;
import com.bgmagitapi.config.UploadResult;
import com.bgmagitapi.controller.request.BgmAgitImageCreateRequest;
import com.bgmagitapi.controller.request.BgmAgitImageModifyRequest;
import com.bgmagitapi.entity.BgmAgitImage;
import com.bgmagitapi.entity.BgmAgitMainMenu;
import com.bgmagitapi.repository.BgmAgitImageRepository;
import com.bgmagitapi.repository.BgmAgitMainMenuRepository;
import com.bgmagitapi.service.BgmAgitImageService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Service
@Transactional
@RequiredArgsConstructor
public class BgmAgitImageServiceImpl implements BgmAgitImageService {

    private final BgmAgitImageRepository bgmAgitImageRepository;
    
    private final BgmAgitMainMenuRepository bgmAgitMainMenuRepository;
    
    private final S3FileUtils  s3FileUtils;
    
    @Override
    public ApiResponse createBgmAgitImage(BgmAgitImageCreateRequest request) {
        Long bgmAgitMainMenuId = request.getBgmAgitMainMenuId();
        BgmAgitMainMenu bgmAgitMainMenu = bgmAgitMainMenuRepository.findById(bgmAgitMainMenuId)
                .orElseThrow(() -> new IllegalArgumentException("존재 하지 않는 메인 메뉴 ID 입니다."));
        
        MultipartFile bgmAgitImage = request.getBgmAgitImage();
        
        UploadResult image = s3FileUtils.storeFile(bgmAgitImage, "images");
        
        BgmAgitImage agitImage = new BgmAgitImage(bgmAgitMainMenu, request, image);
        
        bgmAgitImageRepository.save(agitImage);
        
        return new ApiResponse(200,true,"저장 되었습니다.");
    }
    
    @Override
    public ApiResponse modifyBgmAgitImage(BgmAgitImageModifyRequest request) {
        BgmAgitImage imageEntity = bgmAgitImageRepository.findById(request.getBgmAgitImageId())
                .orElseThrow(() -> new EntityNotFoundException("해당 이미지가 존재하지 않습니다."));
        
        UploadResult uploadedImage = handleImageUpdate(request);
        
        imageEntity.modifyBgmAgitImage(request, uploadedImage);
        
        return new ApiResponse(200, true, "수정 되었습니다.");
    }
    
    @Override
    public ApiResponse deleteBgmAgitImage(Long imageId) {
        
        BgmAgitImage agitImage = bgmAgitImageRepository.findById(imageId)
                .orElseThrow(() -> new IllegalArgumentException("존재 하지 않는 이미지 ID 입니다."));
        
        String bgmAgitImageUrl = agitImage.getBgmAgitImageUrl();
        if (StringUtils.hasText(bgmAgitImageUrl)) {
            s3FileUtils.deleteFile(bgmAgitImageUrl);
        }
        
        bgmAgitImageRepository.delete(agitImage);
        
        return new ApiResponse(200,true,"삭제 되었습니다.");
    }
    
    private UploadResult handleImageUpdate(BgmAgitImageModifyRequest request) {
        if (StringUtils.hasText(request.getDeletedFiles())) {
            s3FileUtils.deleteFile(request.getDeletedFiles());
            return s3FileUtils.storeFile(request.getBgmAgitImage(), "images");
        }
        return null;
    }
}
