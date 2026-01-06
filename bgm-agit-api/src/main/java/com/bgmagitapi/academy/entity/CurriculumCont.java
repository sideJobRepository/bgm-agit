package com.bgmagitapi.academy.entity;

import com.bgmagitapi.entity.mapperd.DateSuperClass;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;

import java.time.LocalDate;


@Entity
@Table(name = "CURRICULUM_CONT")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class CurriculumCont extends DateSuperClass {
    
    // 커리큘럼 내용 ID
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "CURRICULUM_CONT_ID")
    private Long id;
    
    // 커리큘럼 ID
    @JoinColumn(name = "CURRICULUM_ID")
    @ManyToOne(fetch = FetchType.LAZY)
    private Curriculum curriculum;
    
    // 월
    @Column(name = "MONTHS")
    private LocalDate months;
    
    // 커리큘럼 내용
    @Column(name = "CURRICULUM_CONT")
    private String cont;
}
