package com.bgmagitapi.kml.lecture.entity;

import com.bgmagitapi.entity.BgmAgitMember;
import com.bgmagitapi.entity.mapperd.DateSuperClass;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Table(name = "BGM_AGIT_LECTURE")
@Entity
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
@Builder
public class Lecture extends DateSuperClass {
    
    
    // BGM 아지트 강의 ID
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "BGM_AGIT_LECTURE_ID")
    private Long id;
    
    // BGM 아지트 회원 ID
    @JoinColumn(name = "BGM_AGIT_MEMBER_ID")
    @ManyToOne(fetch = FetchType.LAZY)
    private BgmAgitMember member;
    
    // BGM 아지트 강의 승인 여부 'N'
    @Column(name = "BGM_AGIT_LECTURE_APPROVAL_STATUS")
    private String lectureApprovalStatus;
    
    // BGM 아지트 강의 취소 여부 'N'
    @Column(name = "BGM_AGIT_LECTURE_CANCEL_STATUS")
    private String lectureCancelStatus;
    
}
