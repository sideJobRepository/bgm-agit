package com.bgmagitapi.kml.slot.entity;


import com.bgmagitapi.entity.mapperd.DateSuperClass;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Table(name = "BGM_AGIT_LECTURE_SLOT")
@Entity
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
@Builder
public class LectureSlot extends DateSuperClass {
    
    // BGM 아지트 강의 슬롯 ID
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "BGM_AGIT_LECTURE_SLOT_ID")
    private Long id;
    
    // BGM 아지트 강의 슬롯 시작 일시
    @Column(name = "BGM_AGIT_LECTURE_SLOT_START_DATE")
    private LocalDate startDate;
    
    // BGM 아지트 강의 슬롯 시작 시간
    @Column(name = "BGM_AGIT_LECTURE_SLOT_START_TIME")
    private LocalTime startTime;
    
    // BGM 아지트 강의 슬롯 종료 시간
    @Column(name = "BGM_AGIT_LECTURE_SLOT_END_TIME")
    private LocalTime endTime;
    
    // BGM 아지트 강의 슬롯 정원
    @Column(name = "BGM_AGIT_LECTURE_SLOT_CAPACITY")
    private Integer capacity;
    
    // BGM 아지트 강의 슬롯 승인 인원
    @Column(name = "BGM_AGIT_LECTURE_SLOT_APPROVAL_PEOPLE")
    private Integer approvalPeople;

}
