package com.bgmagitapi.academy.entity;

import com.bgmagitapi.entity.mapperd.DateSuperClass;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "PROGRESS_INPUTS")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Getter
public class ProgressInputs extends DateSuperClass {
    
    // 진도 입력 ID
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "PROGRESS_INPUTS_ID")
    private Long id;
    
    // 입력 ID
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "INPUTS_ID")
    private Inputs inputs;
    
    // 커리큘럼 진도 ID
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CURRICULUM_PROGRESS_ID")
    private CurriculumProgress curriculumProgress;
    
    // 입력 교재
    @Column(name = "INPUTS_TEXTBOOK")
    private String textBook;
    
    // 입력 단원
    @Column(name = "INPUTS_UNIT")
    private String unit;
    
    // 입력 페이지
    @Column(name = "INPUTS_PAGES")
    private String pages;
    
    public void modifyCurriculumProgress() {
        this.curriculumProgress = null;
    }
}
