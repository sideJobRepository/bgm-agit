package com.bgmagitapi.kml.review.dto.response;

import com.bgmagitapi.controller.response.BgmAgitFreeGetDetailResponse;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.querydsl.core.annotations.QueryProjection;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
public class ReviewGetDetailResponse {
    
    
    private Long id;
    private Long memberId;
    private String title;
    private String cont;
    private Boolean isAuthor;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDateTime registDate;
    private String memberName;
    private String nickName;
    private List<ReviewGetDetailResponse.ReviewGetDetailResponseFile> files;
    private List<ReviewGetDetailResponse.ReviewGetDetailResponseComment> comments;
    
    @QueryProjection
    public ReviewGetDetailResponse(Long id, Long memberId, String title, String cont, LocalDateTime registDate, String memberName, String nickName) {
        this.id = id;
        this.memberId = memberId;
        this.title = title;
        this.cont = cont;
        this.registDate = registDate;
        this.memberName = memberName;
        this.nickName = nickName;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReviewGetDetailResponseFile{
        private Long id;
        private String fileName;
        private String uuidName;
        private String fileUrl;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReviewGetDetailResponseComment{
        private String commentId;
        private String memberName;
        private String nickname;
        private String cont;
        private Integer depth;
        private Boolean isAuthor;
        private String parentId; //부모 댓글 ID
        private List<ReviewGetDetailResponse.ReviewGetDetailResponseComment> children;
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
        private LocalDateTime registDate;
        private String delStatus;
        
        public List<ReviewGetDetailResponse.ReviewGetDetailResponseComment> getChildren() {
            if(this.children == null) {
                this.children = new ArrayList<>();
            }
            return children;
        }
        
    }
}
