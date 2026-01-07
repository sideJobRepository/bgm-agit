package com.bgmagitapi.academy.entity;

import com.bgmagitapi.entity.mapperd.DateSuperClass;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "CURRICULUM_PROGRESS")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Getter
public class CurriculumProgress extends DateSuperClass {

    // 커리큘럼 진도 ID
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "CURRICULUM_PROGRESS_ID")
    private Long id;

    // 커리큘럼 ID
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CURRICULUM_ID")
    private Curriculum curriculum;

    // 커리큘럼 진도 구분
    @Column(name = "CURRICULUM_PROGRESS_GUBUN")
    private String progressGubun;
    
    public void modifyProgressGubun(String progressType) {
        this.progressGubun = progressType;
    }
}
