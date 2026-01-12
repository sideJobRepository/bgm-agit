package com.bgmagitapi.academy.entity;

import com.bgmagitapi.entity.mapperd.DateSuperClass;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;


@Entity
@Table(name = "CURRICULUM_CONT")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Getter
public class CurriculumCont extends DateSuperClass {
    
    // 커리큘럼 내용 ID
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "CURRICULUM_CONT_ID")
    private Long id;
    
    // 커리큘럼 ID
    @JoinColumn(name = "CURRICULUM_PROGRESS_ID")
    @ManyToOne(fetch = FetchType.LAZY)
    private CurriculumProgress curriculumProgress;
    
    // 시작 월
    @Column(name = "START_MONTHS")
    private Integer startMonths;

    // 종료 월
    @Column(name = "END_MONTHS")
    private Integer endMonths;
    
    // 커리큘럼 내용
    @Column(name = "CURRICULUM_CONT")
    private String cont;
    
    public void modifyCont(Integer startMonth, Integer endMonth, String content) {
        this.startMonths = startMonth;
        this.endMonths = endMonth;
        this.cont = content;
    }
}
