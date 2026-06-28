package com.bgmagitapi.util;

public interface AlimtalkTemplate {
    
    String BGMAGIT_RES_ACCOUNT2 = "bgmagit-res-account2"; // 예약대기 카카오뱅크 계좌
    
    //kml 용
    
    String BGMAGIT_REVIEW = "bgmagit-review-2"; // 리뷰 등록되었을떄
    
    String BGMAGIT_RES_LECTURE =  "bgmagit-res-lecture-2"; // 사용자가 마작강의 신청했을때
    
    String BGMAGIT_RES_LECTURE_COMPLETE = "bgmagit-res-lecture-complete-2";
    
    String 	BGMAGIT_RES_LECTURE_CANCEL1 = "bgmagit-res-lecture-cancel1-2"; // 사용자가 마작강의 취소했을때
    
    String 	BGMAGIT_RES_LECTURE_CANCEL2 = "bgmagit-res-lecture-cancel2-2"; // 관리자가 마작강의 취소했을때

    String BGMAGIT_BML_MATCH = "bgmagit-bml-match"; // 대국 기록 등록 시 대국자에게 발송

    // 모임 (머더미스터리/시계탑) — 성사 / 취소 2종, 카카오 검수 후 사용
    String BGMAGIT_GATHERING_CONFIRMED = "bgmagit-gathering-confirmed";  // 모임 성사
    String BGMAGIT_GATHERING_CANCELLED = "bgmagit-gathering-cancelled";  // 모임 취소(무산)

}
