package com.bgmagitapi.entity;


import com.bgmagitapi.entity.enumeration.BgmAgitCommonType;
import com.bgmagitapi.entity.mapperd.DateSuperClass;
import jakarta.persistence.*;
import lombok.*;

@Table(name = "BGM_AGIT_COMMON_COMMENT")
@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class BgmAgitCommonComment extends DateSuperClass {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "BGM_AGIT_COMMON_COMMENT_ID")
    private Long id; // 댓글 PK

    @Column(name = "BGM_AGIT_COMMON_COMMENT_HIERARCHY_ID")
    private Long parentId; // 부모 댓글 ID (대댓글용)

    @ManyToOne(fetch = FetchType.LAZY) // 단방향 매핑
    @JoinColumn(name = "BGM_AGIT_MEMBER_ID")
    private BgmAgitMember member; // 작성자

    @Column(name = "BGM_AGIT_COMMON_COMMENT_TARGET_ID")
    private Long targetId; // 게시글 ID

    @Column(name = "BGM_AGIT_COMMON_COMMENT_TYPE")
    @Enumerated(EnumType.STRING)
    private BgmAgitCommonType bgmAgitCommonType;

    @Column(name = "BGM_AGIT_COMMON_COMMENT_CONT")
    private String content; // 댓글 내용
    
    @Column(name = "BGM_AGIT_COMMON_COMMENT_DEPTH")
    private Integer depth; // 0=댓글, 1=대댓글
}
