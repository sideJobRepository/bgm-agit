package com.bgmagitapi.academy.entity;

import com.bgmagitapi.entity.mapperd.DateSuperClass;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "CURRICULUM")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Curriculum extends DateSuperClass {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "CURRICULUM_ID")
    // 커리큘럼 ID
    private Long id;

    // 반
    @Column(name = "CLASSES")
    private String classes;

    // 진도 구분
    @Column(name = "PROGRESS_GUBUN")
    private String progressGubun;

    // 연도
    @Column(name = "YEARS")
    private LocalDate years;
}
