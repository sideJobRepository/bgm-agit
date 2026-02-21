package com.bgmagitapi.kml.reviewconment.service.impl;

import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.entity.BgmAgitCommonComment;
import com.bgmagitapi.entity.BgmAgitMember;
import com.bgmagitapi.entity.enumeration.BgmAgitCommonType;
import com.bgmagitapi.kml.reviewconment.dto.request.ReviewCommentPostRequest;
import com.bgmagitapi.kml.reviewconment.dto.request.ReviewCommentPutRequest;
import com.bgmagitapi.kml.reviewconment.service.ReviewCommentService;
import com.bgmagitapi.repository.BgmAgitCommonCommentRepository;
import com.bgmagitapi.repository.BgmAgitMemberRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@Transactional
@RequiredArgsConstructor
public class ReviewCommentServiceImpl implements ReviewCommentService {
    
    private final BgmAgitCommonCommentRepository commonCommentRepository;
    
    private final BgmAgitMemberRepository memberRepository;

    
    @Override
    public ApiResponse createComment(ReviewCommentPostRequest request) {
        Long memberId = request.getMemberId();
        BgmAgitMember bgmAgitMember = memberRepository.findById(memberId).orElseThrow(() -> new RuntimeException("존재 하지 않는 회원입니다."));
        
        BgmAgitCommonComment comment = BgmAgitCommonComment
                .builder()
                .parentId(request.getParentId())
                .member(bgmAgitMember)
                .targetId(request.getReviewerId())
                .content(request.getCont())
                .depth(request.getParentId() != null ? 1 : 0)
                .bgmAgitCommonType(BgmAgitCommonType.REVIEW)
                .delStatus("N")
                .build();
        commonCommentRepository.save(comment);
        
        return new ApiResponse(200,true,"댓글이 작성되었습니다.");
    }
    
    @Override
    public ApiResponse modifyComment(ReviewCommentPutRequest request) {
        Long commentId = request.getCommentId();
        BgmAgitCommonComment bgmAgitCommonComment = commonCommentRepository.findById(commentId).orElseThrow(() -> new RuntimeException("존재 하지 않는 댓글입니다."));
        bgmAgitCommonComment.modifyComment(request.getCont());
        return new ApiResponse(200,true,"댓글이 수정되었습니다.");
    }
    
    @Override
    public ApiResponse removeComment(Long id) {
        BgmAgitCommonComment bgmAgitCommonComment = commonCommentRepository.findById(id).orElseThrow(() -> new RuntimeException("존재 하지 않는 댓글입니다."));
        bgmAgitCommonComment.removeComment("Y");
        return new ApiResponse(200,true,"댓글이 삭제되었습니다.");
    }
}
