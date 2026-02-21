package com.bgmagitapi.kml.reviewconment.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class ReviewCommentPutRequest {
    
    @NotNull(message = "댓글 ID는 필수입니다.")
    private Long commentId;
    @NotBlank(message = "댓글 내용은 필수입니다.")
    private String cont;
}
