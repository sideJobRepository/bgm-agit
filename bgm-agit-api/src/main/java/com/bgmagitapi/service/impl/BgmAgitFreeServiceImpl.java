package com.bgmagitapi.service.impl;

import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.config.S3FileUtils;
import com.bgmagitapi.config.UploadResult;
import com.bgmagitapi.controller.request.BgmAgitFreePostRequest;
import com.bgmagitapi.controller.request.BgmAgitFreePutRequest;
import com.bgmagitapi.controller.response.BgmAgitFreeGetDetailResponse;
import com.bgmagitapi.controller.response.BgmAgitFreeGetResponse;
import com.bgmagitapi.entity.BgmAgitCommonFile;
import com.bgmagitapi.entity.BgmAgitFree;
import com.bgmagitapi.entity.BgmAgitMember;
import com.bgmagitapi.entity.enumeration.BgmAgitCommonType;
import com.bgmagitapi.page.PageResponse;
import com.bgmagitapi.repository.BgmAgitCommonCommentRepository;
import com.bgmagitapi.repository.BgmAgitCommonFileRepository;
import com.bgmagitapi.repository.BgmAgitFreeRepository;
import com.bgmagitapi.repository.BgmAgitMemberRepository;
import com.bgmagitapi.service.BgmAgitFreeService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Transactional
@Service
@RequiredArgsConstructor
public class BgmAgitFreeServiceImpl implements BgmAgitFreeService {

    private final BgmAgitFreeRepository bgmAgitFreeRepository;
    
    private final BgmAgitMemberRepository bgmAgitMemberRepository;
    
    private final BgmAgitCommonFileRepository bgmAgitCommonFileRepository;
    
    private final BgmAgitCommonCommentRepository bgmAgitCommonCommentRepository;
    
    private final S3FileUtils s3FileUtils;
    
    @Override
    @Transactional(readOnly = true)
    public PageResponse<BgmAgitFreeGetResponse> getBgmAgitFree(Pageable pageable,String titleOrCont) {
        Page<BgmAgitFreeGetResponse> byAllBgmAgitFree = bgmAgitFreeRepository.findByAllBgmAgitFree(pageable,titleOrCont);
        return PageResponse.from(byAllBgmAgitFree);
    }
    
    @Override
    @Transactional(readOnly = true)
    public BgmAgitFreeGetDetailResponse getBgmAgitFreeDetail(Long id,Long memberId) {
        // 1. 기본 게시글
        BgmAgitFreeGetDetailResponse response = bgmAgitFreeRepository.findByFreeDetail(id, memberId);
        if (response == null) {
            return null;
        };
    
        // 2. 파일
        List<BgmAgitFreeGetDetailResponse.BgmAgitFreeGetDetailResponseFile> files = bgmAgitFreeRepository.findFiles(id);
        response.setFiles(files);
    
        // 3. 댓글
        List<BgmAgitFreeGetDetailResponse.BgmAgitFreeGetDetailResponseComment> comments = bgmAgitFreeRepository.findComments(id, memberId);
        
        // 4. 댓글 트리 조립
        comments.stream()
                .filter(item -> "Y".equals( item.getDelStatus()))
                .forEach(comment -> comment.setContent("삭제된 댓글입니다.")); // 삭제된 댓글이면 내용을 삭제된 댓글이라고 응답 보내주고 DB 에는 원본데이터 남겨야함
        Map<String, BgmAgitFreeGetDetailResponse.BgmAgitFreeGetDetailResponseComment> commentMap = new HashMap<>();
        for (BgmAgitFreeGetDetailResponse.BgmAgitFreeGetDetailResponseComment c : comments) {
            commentMap.put(c.getCommentId(), c);
        }
    
        List<BgmAgitFreeGetDetailResponse.BgmAgitFreeGetDetailResponseComment> rootComments = new ArrayList<>();
        for (BgmAgitFreeGetDetailResponse.BgmAgitFreeGetDetailResponseComment c : comments) {
            if (c.getParentId() == null) {
                rootComments.add(c);
            } else {
                BgmAgitFreeGetDetailResponse.BgmAgitFreeGetDetailResponseComment parent = commentMap.get(c.getParentId());
                if (parent != null) {
                    parent.getChildren().add(c);
                }
            }
        }
        
        response.setComments(rootComments);
        response.setIsAuthor(response.getMemberId().equals(memberId));
    
        return response;
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
    
    @Override
    public ApiResponse modifyBgmAgitFree(BgmAgitFreePutRequest request) {
        Long id = request.getId();
        BgmAgitMember bgmAgitMember = bgmAgitMemberRepository.findById(request.getMemberId()).orElseThrow(() -> new RuntimeException("존재 하지 않는 회원입니다."));
        
        BgmAgitFree free = bgmAgitFreeRepository.findByIdAndMemberId(id,bgmAgitMember);
        
        if (free == null) {
            throw new RuntimeException("존재 하지 않는 게시글 입니다.");
        }
        
        free.modifyFree(request);
        
        List<Long> deletedFiles = request.getDeletedFiles();
        if (!deletedFiles.isEmpty()) {
            List<BgmAgitCommonFile> byUUID = bgmAgitCommonFileRepository.findByIds(deletedFiles);
            
            for (BgmAgitCommonFile file : byUUID) {
                
                s3FileUtils.deleteFile(file.getBgmAgitCommonFileUrl());
            }
            bgmAgitCommonFileRepository.removeFiles(deletedFiles);
        }
        
        if (request.getFiles() != null && !request.getFiles().isEmpty()) {
              List<UploadResult> uploadResults = s3FileUtils.storeFiles(request.getFiles(), "free");
              
              List<BgmAgitCommonFile> commonFiles = uploadResults.stream()
                      .map(item -> {
                          return BgmAgitCommonFile
                                  .builder()
                                  .bgmAgitCommonFileTargetId(free.getBgmAgitFreeId())
                                  .bgmAgitCommonFileType(BgmAgitCommonType.FREE)
                                  .bgmAgitCommonFileUrl(item.getUrl())
                                  .bgmAgitCommonFileUuidName(item.getUuid())
                                  .bgmAgitCommonFileName(item.getOriginalFilename())
                                  .build();
                      })
                      .toList();
              bgmAgitCommonFileRepository.saveAll(commonFiles);
          }
        
        return new ApiResponse(200,true,"수정 되었습니다.");
    }
    
    @Override
    public ApiResponse romoveBgmAgitFree(Long id, Long memberId) {
        BgmAgitMember bgmAgitMember = bgmAgitMemberRepository.findById(memberId).orElseThrow(() -> new RuntimeException("존재하지 않는 회원입니다."));
        List<BgmAgitCommonFile> byDeleteFile = bgmAgitCommonFileRepository.findByDeleteFile(id,BgmAgitCommonType.FREE);
        
        for (BgmAgitCommonFile bgmAgitCommonFile : byDeleteFile) {
            s3FileUtils.deleteFile(bgmAgitCommonFile.getBgmAgitCommonFileUrl());
        }
        bgmAgitCommonFileRepository.deleteAll(byDeleteFile);
        bgmAgitCommonCommentRepository.deleteByCommonDepth(id);
        
        Long count = bgmAgitFreeRepository.deleteByIdAndMember(id, bgmAgitMember);
        if(0L >= count) {
            throw new RuntimeException("삭제는 본인만 가능합니다");
        }
        
        return new ApiResponse(200,true,"삭제 되었습니다.");
    }
}
