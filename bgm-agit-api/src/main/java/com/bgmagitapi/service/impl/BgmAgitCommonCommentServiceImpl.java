package com.bgmagitapi.service.impl;

import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.controller.request.BgmAgitCommonCommentPostRequest;
import com.bgmagitapi.controller.request.BgmAgitCommonCommentPutRequest;
import com.bgmagitapi.entity.BgmAgitCommonComment;
import com.bgmagitapi.entity.BgmAgitMember;
import com.bgmagitapi.entity.enumeration.BgmAgitCommonType;
import com.bgmagitapi.repository.BgmAgitCommonCommentRepository;
import com.bgmagitapi.repository.BgmAgitMemberRepository;
import com.bgmagitapi.service.BgmAgitCommonCommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Transactional
@RequiredArgsConstructor
@Service
public class BgmAgitCommonCommentServiceImpl implements BgmAgitCommonCommentService {
    
    private final BgmAgitCommonCommentRepository bgmAgitCommonCommentRepository;
    
    private final BgmAgitMemberRepository bgmAgitMemberRepository;
    
    
    @Override
    public ApiResponse createComment(BgmAgitCommonCommentPostRequest request) {
        Long memberId = request.getMemberId();
        BgmAgitMember bgmAgitMember = bgmAgitMemberRepository.findById(memberId).orElseThrow(() -> new RuntimeException("존재 하지 않는 회원입니다."));
        
        BgmAgitCommonComment comment = BgmAgitCommonComment
                .builder()
                .parentId(request.getParentId())
                .member(bgmAgitMember)
                .targetId(request.getFreeId())
                .content(request.getContent())
                .depth(request.getParentId() != null ? 1 : 0)
                .bgmAgitCommonType(BgmAgitCommonType.FREE)
                .delStatus("N")
                .build();
        bgmAgitCommonCommentRepository.save(comment);
        
        return new ApiResponse(200,true,"댓글이 작성되었습니다.");
    }
    
    @Override
    public ApiResponse modifyComment(BgmAgitCommonCommentPutRequest request) {
        Long commentId = request.getCommentId();
        BgmAgitCommonComment bgmAgitCommonComment = bgmAgitCommonCommentRepository.findById(commentId).orElseThrow(() -> new RuntimeException("존재 하지 않는 댓글입니다."));
        bgmAgitCommonComment.modifyComment(request.getContent());
        return new ApiResponse(200,true,"댓글이 수정되었습니다.");
    }
    
    @Override
    public ApiResponse removeComment(Long commentId) {
        
        BgmAgitCommonComment bgmAgitCommonComment = bgmAgitCommonCommentRepository.findById(commentId).orElseThrow(() -> new RuntimeException("존재 하지 않는 댓글입니다."));
        bgmAgitCommonComment.removeComment("Y");
        return new ApiResponse(200,true,"댓글이 삭제되었습니다.");
    }
}
