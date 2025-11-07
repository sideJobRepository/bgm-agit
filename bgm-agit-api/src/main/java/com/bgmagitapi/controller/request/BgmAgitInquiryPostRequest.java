package com.bgmagitapi.controller.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BgmAgitInquiryPostRequest {
    
    private Long parentId; // 관리자가 답변할경우 그 1:1문의 ID값 사용자가 글쓸떄는 없음
    private Long memberId; // Jwt 에서 꺼낼거임
    @NotBlank(message = "제목은 필수입니다.")
    private String title;
    @NotBlank(message = "내용은 필수입니다.")
    private String cont;
}
