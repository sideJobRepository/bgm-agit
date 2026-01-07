package com.bgmagitapi.academy.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;


@Entity
@Table(name = "INPUTS")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Getter
public class Inputs {
    
    // 입력 ID
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "INPUTS_ID")
    private Long id;
    
    // 커리큘럼 내용 ID
    @JoinColumn(name = "CURRICULUM_PROGRESS_ID")
    @ManyToOne(fetch = FetchType.LAZY)
    private CurriculumProgress curriculumProgress;
    
    // 입력 반
    @Column(name = "INPUTS_CLASSES")
    private String classes;
    
    // 입력 선생님
    @Column(name = "INPUTS_TEACHER")
    private String teacher;
    
    // 입력 과목
    @Column(name = "INPUTS_SUBJECTS")
    private String subjects;
    
    // 입력 단원
    @Column(name = "INPUTS_UNIT")
    private String unit;
    
    // 입력 페이지
    @Column(name = "INPUTS_PAGES")
    private String pages;
    
    // 입력 진도
    @Column(name = "INPUTS_PROGRESS")
    private String progress;
    
    // 입력 테스트
    @Column(name = "INPUTS_TESTS")
    private String tests;
    
    // 입력 과제
    @Column(name = "INPUTS_HOMEWORK")
    private String homework;
    
    // 입력 일시
    @Column(name = "INPUTS_DATE")
    private LocalDate inputsDate;
    
}
