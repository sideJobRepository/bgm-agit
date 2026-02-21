package com.bgmagitapi.kml.review.entity;

import com.bgmagitapi.entity.BgmAgitMember;
import com.bgmagitapi.entity.mapperd.DateSuperClass;
import com.bgmagitapi.kml.review.dto.request.ReviewPutRequest;
import jakarta.persistence.*;
import lombok.*;

@Table(name = "BGM_AGIT_REVIEW")
@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Getter
@Builder
public class Review extends DateSuperClass {
    
    // BGM 아지트 리뷰 ID
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "BGM_AGIT_REVIEW_ID")
    private Long id;
    
    // BGM 아지트 회원 ID
    @JoinColumn(name = "BGM_AGIT_MEMBER_ID")
    @ManyToOne(fetch = FetchType.LAZY)
    private BgmAgitMember member;
    
    // BGM 아지트 리뷰 제목
    @Column(name = "BGM_AGIT_REVIEW_TITLE")
    private String title;
    
    // BGM 아지트 리뷰 내용
    @Column(name = "BGM_AGIT_REVIEW_CONT")
    private String cont;
    
    public void modifyReview(ReviewPutRequest request) {
        this.title = request.getTitle();
        this.cont = request.getCont();
    }
}
