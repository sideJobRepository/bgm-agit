package com.bgmagitapi.academy.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "CURRICULUM_TEXTBOOK")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class CurriculumTextbook {

    // 진도 교재 ID
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "CURRICULUM_TEXTBOOK")
     private Long id;
 
     // 커리큘럼 ID
     @JoinColumn(name = "CURRICULUM_ID")
     @ManyToOne(fetch = FetchType.LAZY)
     private Curriculum curriculum;
 
     // 월
     @Column(name = "MONTHS")
     private LocalDate months;
 
     // 진도 교재 이름
     @Column(name = "PROGRESS_TEXTBOOK_NAME")
     private String bookName;
 
}
