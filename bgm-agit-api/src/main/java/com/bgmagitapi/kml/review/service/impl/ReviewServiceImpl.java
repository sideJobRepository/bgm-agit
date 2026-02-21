package com.bgmagitapi.kml.review.service.impl;


import com.bgmagitapi.advice.exception.ValidException;
import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.config.S3FileUtils;
import com.bgmagitapi.config.UploadResult;
import com.bgmagitapi.controller.response.BgmAgitFreeGetResponse;
import com.bgmagitapi.entity.BgmAgitCommonFile;
import com.bgmagitapi.entity.BgmAgitFree;
import com.bgmagitapi.entity.BgmAgitMember;
import com.bgmagitapi.entity.enumeration.BgmAgitCommonType;
import com.bgmagitapi.kml.review.dto.request.ReviewPostRequest;
import com.bgmagitapi.kml.review.dto.request.ReviewPutRequest;
import com.bgmagitapi.kml.review.dto.response.ReviewGetDetailResponse;
import com.bgmagitapi.kml.review.dto.response.ReviewGetResponse;
import com.bgmagitapi.kml.review.entity.Review;
import com.bgmagitapi.kml.review.repository.ReviewRepository;
import com.bgmagitapi.kml.review.service.ReviewService;
import com.bgmagitapi.page.PageResponse;
import com.bgmagitapi.repository.BgmAgitCommonCommentRepository;
import com.bgmagitapi.repository.BgmAgitCommonFileRepository;
import com.bgmagitapi.repository.BgmAgitMemberRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;


@Service
@Transactional
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {
    
    
    private final ReviewRepository reviewRepository;
    
    private final BgmAgitMemberRepository memberRepository;
    
    private final BgmAgitCommonFileRepository commonFileRepository;
    
    private final BgmAgitCommonCommentRepository commonCommentRepository;
    
    private final S3FileUtils s3FileUtils;
    
    @Override
    public Page<ReviewGetResponse> getReviews(Pageable pageable, String titleOrCont) {
        return reviewRepository.findAllByReviews(pageable,titleOrCont);
    }
    
    @Override
    public ReviewGetDetailResponse getReviewDetail(Long reviewId) {
        return null;
    }
    
    @Override
    public ApiResponse createReview(ReviewPostRequest request) {
        BgmAgitMember bgmAgitMember = memberRepository.findById(request.getMemberId()).orElseThrow(() -> new RuntimeException("존재 하지 않는 회원 입니다."));
        
        List<MultipartFile> files = request.getFiles();
        
        List<UploadResult> freeFile = s3FileUtils.storeFiles(files, "review");
        
        Review review = Review.builder()
                .member(bgmAgitMember)
                .cont(request.getCont())
                .title(request.getTitle())
                .build();
        Review saveReview = reviewRepository.save(review);
        
        for (UploadResult uploadResult : freeFile) {
            BgmAgitCommonFile commonFile = BgmAgitCommonFile.builder()
                    .bgmAgitCommonFileTargetId(saveReview.getId())
                    .bgmAgitCommonFileType(BgmAgitCommonType.REVIEW)
                    .bgmAgitCommonFileName(uploadResult.getOriginalFilename())
                    .bgmAgitCommonFileUuidName(uploadResult.getUuid())
                    .bgmAgitCommonFileUrl(uploadResult.getUrl())
                    .build();
            commonFileRepository.save(commonFile);
        }
        
        return new ApiResponse(200,true,"리뷰가 작성되었습니다.");
    }
    
    @Override
    public ApiResponse modifyReview(ReviewPutRequest request) {
        Long id = request.getId();
        BgmAgitMember bgmAgitMember = memberRepository.findById(request.getMemberId()).orElseThrow(() -> new RuntimeException("존재 하지 않는 회원입니다."));
        
        Review review = reviewRepository.findByIdAndMemberId(id, bgmAgitMember);
        
        if (review == null) {
            throw new ValidException("작성자만 수정할수 있습니다.");
        }
        
        review.modifyReview(request);
        
        List<Long> deletedFiles = request.getDeletedFiles();
        if (!deletedFiles.isEmpty()) {
            List<BgmAgitCommonFile> byUUID = commonFileRepository.findByIds(deletedFiles);
            
            for (BgmAgitCommonFile file : byUUID) {
                
                s3FileUtils.deleteFile(file.getBgmAgitCommonFileUrl());
            }
            commonFileRepository.removeFiles(deletedFiles);
        }
        
        if (request.getFiles() != null && !request.getFiles().isEmpty()) {
            List<UploadResult> uploadResults = s3FileUtils.storeFiles(request.getFiles(), "review");
            
            List<BgmAgitCommonFile> commonFiles = uploadResults.stream()
                    .map(item -> {
                        return BgmAgitCommonFile
                                .builder()
                                .bgmAgitCommonFileTargetId(review.getId())
                                .bgmAgitCommonFileType(BgmAgitCommonType.REVIEW)
                                .bgmAgitCommonFileUrl(item.getUrl())
                                .bgmAgitCommonFileUuidName(item.getUuid())
                                .bgmAgitCommonFileName(item.getOriginalFilename())
                                .build();
                    })
                    .toList();
            commonFileRepository.saveAll(commonFiles);
        }
        
        return new ApiResponse(200,true,"수정 되었습니다.");
    }
    
    @Override
    public ApiResponse deleteReview(Long id) {
        return null;
    }
    
    
    
}
