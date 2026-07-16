package com.bgmagitapi.origin.entity;

import com.bgmagitapi.origin.entity.enumeration.BgmAgitSubject;
import com.bgmagitapi.origin.entity.mapperd.DateSuperClass;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "BGM_AGIT_BIZTALK_SEND_HISTORY")
@Getter
@NoArgsConstructor
public class BgmAgitBiztalkSendHistory extends DateSuperClass {
    
    // BGM 아지트 비즈톡 전송 이력 ID
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "BGM_AGIT_BIZTALK_SEND_HISTORY_ID")
    private Long bgmAgitBiztalkSendHistoryId;
    
    // BGM 아지트 비즈톡 이력 대상 타입
    @Column(name = "BGM_AGIT_BIZTALK_HISTORY_SUBJECT_TYPE")
    @Enumerated(EnumType.STRING)
    private BgmAgitSubject bgmAgitSubject;
    
    // BGM 아지트 비즈톡 전송 이력 대상 ID
    @Column(name = "BGM_AGIT_BIZTALK_SEND_HISTORY_SUBJECT_ID")
    private Long bgmAgitBiztalkSendHistorySubjectId;
    
    // BGM 아지트 비즈톡 전송 이력 내용
    @Column(name = "BGM_AGIT_BIZTALK_SEND_HISTORY_CONT")
    private String bgmAgitBiztalkSendHistoryCont;
    
    // BGM 아지트 비즈톡 전송 이력 UUID
    @Column(name = "BGM_AGIT_BIZTALK_SEND_HISTORY_MSG_IDX")
    private String bgmAgitBiztalkSendHistoryMsgIdx;
    
    // BGM 아지트 비즈톡 전송 이력 결과 코드
    @Column(name = "BGM_AGIT_BIZTALK_SEND_HISTORY_RESULT_CODE")
    private String bgmAgitBiztalkSendHistoryResultCode;
    
    
    public BgmAgitBiztalkSendHistory(BgmAgitSubject bgmAgitSubject, Long bgmAgitBiztalkSendHistorySubjectId, String bgmAgitBiztalkSendHistoryCont, String bgmAgitBiztalkSendHistoryMsgIdx,String bgmAgitBiztalkSendHistoryResultCode) {
        this.bgmAgitSubject = bgmAgitSubject;
        this.bgmAgitBiztalkSendHistorySubjectId = bgmAgitBiztalkSendHistorySubjectId;
        this.bgmAgitBiztalkSendHistoryCont = bgmAgitBiztalkSendHistoryCont;
        this.bgmAgitBiztalkSendHistoryMsgIdx = bgmAgitBiztalkSendHistoryMsgIdx;
        this.bgmAgitBiztalkSendHistoryResultCode = bgmAgitBiztalkSendHistoryResultCode;
    }

    // 비즈톡 결과 코드 갱신 (스케줄러가 getResultAll 결과로 PENDING -> 실제 코드 갱신)
    public void updateResultCode(String bgmAgitBiztalkSendHistoryResultCode) {
        this.bgmAgitBiztalkSendHistoryResultCode = bgmAgitBiztalkSendHistoryResultCode;
    }
}
