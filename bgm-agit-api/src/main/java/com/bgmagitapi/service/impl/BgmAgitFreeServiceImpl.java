package com.bgmagitapi.service.impl;

import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.config.S3FileUtils;
import com.bgmagitapi.config.UploadResult;
import com.bgmagitapi.controller.request.BgmAgitFreePostRequest;
import com.bgmagitapi.controller.response.BgmAgitFreeGetResponse;
import com.bgmagitapi.entity.BgmAgitCommonFile;
import com.bgmagitapi.entity.BgmAgitFree;
import com.bgmagitapi.entity.BgmAgitMember;
import com.bgmagitapi.entity.enumeration.BgmAgitCommonType;
import com.bgmagitapi.repository.BgmAgitCommonFileRepository;
import com.bgmagitapi.repository.BgmAgitFreeRepository;
import com.bgmagitapi.repository.BgmAgitMemberRepository;
import com.bgmagitapi.service.BgmAgitFreeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

@Transactional
@Service
@RequiredArgsConstructor
public class BgmAgitFreeServiceImpl implements BgmAgitFreeService {

    private final BgmAgitFreeRepository bgmAgitFreeRepository;
    
    private final BgmAgitMemberRepository bgmAgitMemberRepository;
    
    private final BgmAgitCommonFileRepository bgmAgitCommonFileRepository;
    
    private final S3FileUtils s3FileUtils;
    
    @Override
    public List<BgmAgitFreeGetResponse> getBgmAgitFree() {
        return List.of();
    }
    
    @Override
    public ApiResponse createBgmAgitFree(BgmAgitFreePostRequest request) {
        
        BgmAgitMember bgmAgitMember = bgmAgitMemberRepository.findById(request.getMemberId()).orElseThrow(() -> new RuntimeException("존재 하지 않는 회원 입니다."));
        
        
        List<MultipartFile> files = request.getFiles();
        
        List<UploadResult> freeFile = s3FileUtils.storeFiles(files, "free");
        
        BgmAgitFree bgmAgitFree = BgmAgitFree.builder()
                .bgmAgitMember(bgmAgitMember)
                .bgmAgitFreeCont(request.getCont())
                .bgmAgitFreeTitle(request.getTitle())
                .build();
        
        BgmAgitFree saveFree = bgmAgitFreeRepository.save(bgmAgitFree);
        
        for (UploadResult uploadResult : freeFile) {
            BgmAgitCommonFile commonFile = BgmAgitCommonFile.builder()
                    .bgmAgitCommonFileTargetId(saveFree.getBgmAgitFreeId())
                    .bgmAgitCommonFileType(BgmAgitCommonType.FREE)
                    .bgmAgitCommonFileName(uploadResult.getOriginalFilename())
                    .bgmAgitCommonFileUuidName(uploadResult.getUuid())
                    .bgmAgitCommonFileUrl(uploadResult.getUrl())
                    .build();
            bgmAgitCommonFileRepository.save(commonFile);
        }
        
        return new ApiResponse(200,true,"게시글이 작성되었습니다.");
    }
}
