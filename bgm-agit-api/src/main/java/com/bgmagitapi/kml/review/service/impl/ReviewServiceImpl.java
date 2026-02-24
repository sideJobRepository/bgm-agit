package com.bgmagitapi.kml.review.service.impl;


import com.bgmagitapi.advice.exception.ValidException;
import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.config.S3FileUtils;
import com.bgmagitapi.config.UploadResult;
import com.bgmagitapi.entity.BgmAgitCommonFile;
import com.bgmagitapi.entity.BgmAgitMember;
import com.bgmagitapi.entity.enumeration.BgmAgitCommonType;
import com.bgmagitapi.entity.enumeration.BgmAgitSubject;
import com.bgmagitapi.kml.review.dto.events.ReviewPostEvents;
import com.bgmagitapi.kml.review.dto.request.ReviewPostRequest;
import com.bgmagitapi.kml.review.dto.request.ReviewPutRequest;
import com.bgmagitapi.kml.review.dto.response.ReviewGetDetailResponse;
import com.bgmagitapi.kml.review.dto.response.ReviewGetResponse;
import com.bgmagitapi.kml.review.entity.Review;
import com.bgmagitapi.kml.review.repository.ReviewRepository;
import com.bgmagitapi.kml.review.service.ReviewService;
import com.bgmagitapi.repository.BgmAgitCommonCommentRepository;
import com.bgmagitapi.repository.BgmAgitCommonFileRepository;
import com.bgmagitapi.repository.BgmAgitMemberRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


@Service
@Transactional
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {
    
    
    private final ReviewRepository reviewRepository;
    
    private final BgmAgitMemberRepository memberRepository;
    
    private final BgmAgitCommonFileRepository commonFileRepository;
    
    private final BgmAgitCommonCommentRepository commonCommentRepository;
    
    private final S3FileUtils s3FileUtils;
    
    private final ApplicationEventPublisher eventPublisher;
    
    @Override
    public Page<ReviewGetResponse> getReviews(Pageable pageable, String titleOrCont) {
        return reviewRepository.findAllByReviews(pageable,titleOrCont);
    }
    
    @Override
    public ReviewGetDetailResponse getReviewDetail(Long reviewId,Long memberId) {
        // 1. 기본 게시글
        ReviewGetDetailResponse response = reviewRepository.findByReviewDetail(reviewId);
        if (response == null) {
            return null;
        };
        
        // 2. 파일
        List<ReviewGetDetailResponse.ReviewGetDetailResponseFile> files = reviewRepository.findFiles(reviewId);
        response.setFiles(files);
        // 3. 댓글
        List<ReviewGetDetailResponse.ReviewGetDetailResponseComment> comments = reviewRepository.findComments(reviewId, memberId);
        
        // 4. 댓글 트리 조립
        comments.stream()
                .filter(item -> "Y".equals( item.getDelStatus()))
                .forEach(comment -> comment.setCont("삭제된 댓글입니다.")); // 삭제된 댓글이면 내용을 삭제된 댓글이라고 응답 보내주고 DB 에는 원본데이터 남겨야함
        Map<String, ReviewGetDetailResponse.ReviewGetDetailResponseComment> commentMap = new HashMap<>();
        for (ReviewGetDetailResponse.ReviewGetDetailResponseComment c : comments) {
            commentMap.put(c.getCommentId(), c);
        }
        
        List<ReviewGetDetailResponse.ReviewGetDetailResponseComment> rootComments = new ArrayList<>();
        for (ReviewGetDetailResponse.ReviewGetDetailResponseComment c : comments) {
            if (c.getParentId() == null) {
                rootComments.add(c);
            } else {
                ReviewGetDetailResponse.ReviewGetDetailResponseComment parent = commentMap.get(c.getParentId());
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
        
        ReviewPostEvents events = ReviewPostEvents.builder()
                .id(review.getId())
                .title(request.getTitle())
                .memberName(bgmAgitMember.getBgmAgitMemberName())
                .date(review.getRegistDate())
                .subject(BgmAgitSubject.REVIEW)
                .build();
        eventPublisher.publishEvent(events);
        
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
    public ApiResponse deleteReview(Long id,Long memberId) {
        BgmAgitMember bgmAgitMember = memberRepository.findById(memberId).orElseThrow(() -> new RuntimeException("존재하지 않는 회원입니다."));
        List<BgmAgitCommonFile> byDeleteFile = commonFileRepository.findByDeleteFile(id,BgmAgitCommonType.REVIEW);
        
        for (BgmAgitCommonFile bgmAgitCommonFile : byDeleteFile) {
            s3FileUtils.deleteFile(bgmAgitCommonFile.getBgmAgitCommonFileUrl());
        }
        commonFileRepository.deleteAll(byDeleteFile);
        commonCommentRepository.deleteByCommonDepth(id);
        
        Long count = reviewRepository.deleteByIdAndMember(id, bgmAgitMember);
        if(0L >= count) {
            throw new ValidException("삭제는 본인만 가능합니다");
        }
        
        return new ApiResponse(200,true,"삭제 되었습니다.");
    }
}
