package com.bgmagitapi.origin.entity;

import com.bgmagitapi.origin.controller.request.BgmAgitServiceRequestPutRequest;
import com.bgmagitapi.origin.entity.mapperd.DateSuperClass;
import jakarta.persistence.*;
import lombok.*;

/**
 * 서비스 요청(유지보수 요청) 게시판 — 관리자 전용.
 * 1:1 문의와 같은 구조로, 답변은 같은 테이블에 HIERARCHY_ID 로 원글을 가리키는 행이다.
 */
@Entity
@Table(name = "BGM_AGIT_SERVICE_REQUEST")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class BgmAgitServiceRequest extends DateSuperClass {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "BGM_AGIT_SERVICE_REQUEST_ID")
    private Long bgmAgitServiceRequestId;

    /** 답변일 경우 원글 ID */
    @Column(name = "BGM_AGIT_SERVICE_REQUEST_HIERARCHY_ID")
    private Long bgmAgitServiceRequestHierarchyId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "BGM_AGIT_MEMBER_ID")
    private BgmAgitMember bgmAgitMember;

    @Column(name = "BGM_AGIT_SERVICE_REQUEST_TITLE")
    private String bgmAgitServiceRequestTitle;

    @Column(name = "BGM_AGIT_SERVICE_REQUEST_CONT")
    private String bgmAgitServiceRequestCont;

    /** 처리 여부 (Y/N) */
    @Column(name = "BGM_AGIT_SERVICE_REQUEST_ANSWER_STATUS")
    private String bgmAgitServiceRequestAnswerStatus;

    public void modify(BgmAgitServiceRequestPutRequest request) {
        this.bgmAgitServiceRequestTitle = request.getTitle();
        this.bgmAgitServiceRequestCont = request.getCont();
    }

    public void modifyAnswerStatus(String value) {
        this.bgmAgitServiceRequestAnswerStatus = value;
    }
}
