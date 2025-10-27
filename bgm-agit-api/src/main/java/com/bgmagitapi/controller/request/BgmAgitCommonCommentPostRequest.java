package com.bgmagitapi.controller.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class BgmAgitCommonCommentPostRequest {

    private Long parentId; // 대댓글이면 있어있어야함
    private Long freeId;
    private String content;
}
