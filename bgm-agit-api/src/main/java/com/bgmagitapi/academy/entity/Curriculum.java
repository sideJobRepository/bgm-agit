package com.bgmagitapi.academy.entity;

import com.bgmagitapi.entity.mapperd.DateSuperClass;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;

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
    
    // 연도
    @Column(name = "YEARS")
    private Integer years;
    
    @Column(name = "CURRICULUM_TITLE")
    private String title;
}
