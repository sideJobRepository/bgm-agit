package com.bgmagitapi.kml.reviewconment.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class ReviewCommentPostRequest {
    
    private Long parentId; // 대댓글이면 있어있어야함
    
    @NotBlank(message = "댓글 내용은 필수 입니다.")
    private String cont;
    @NotNull(message = "게시판 번호는 필수입니다.")
    private Long reviewerId;
    
    private Long memberId;
}
