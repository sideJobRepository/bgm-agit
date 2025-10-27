package com.bgmagitapi.controller.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BgmAgitFreeGetDetailResponse {

    private Long id;
    private Long memberId;
    private String title;
    private String content;
    private Boolean isAuthor;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDateTime registDate;
    private List<BgmAgitFreeGetDetailResponseFile> files;
    private List<BgmAgitFreeGetDetailResponseComment> comments;
    
    public BgmAgitFreeGetDetailResponse(Long id, Long memberId, String title, String content,  LocalDateTime registDate) {
        this.id = id;
        this.memberId = memberId;
        this.title = title;
        this.content = content;
        this.registDate = registDate;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BgmAgitFreeGetDetailResponseFile{
        private Long id;
        private String fileName;
        private String uuidName;
        private String fileUrl;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BgmAgitFreeGetDetailResponseComment{
        private String commentId;
        private String memberName;
        private String content;
        private Integer depth;
        private Boolean isAuthor;
        private String parentId; //부모 댓글 ID
        private List<BgmAgitFreeGetDetailResponseComment> children;
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
        private LocalDateTime registDate;
        
        public List<BgmAgitFreeGetDetailResponseComment> getChildren() {
            if(this.children == null) {
                this.children = new ArrayList<>();
            }
            return children;
        }
        
        public BgmAgitFreeGetDetailResponseComment(String commentId, String memberName, String content, Integer depth, Boolean isAuthor, String parentId,LocalDateTime registDate) {
            this.commentId = commentId;
            this.memberName = memberName;
            this.content = content;
            this.depth = depth;
            this.isAuthor = isAuthor;
            this.parentId = parentId;
            this.registDate = registDate;
        }
    }
}
