package com.bgmagitapi.origin.util;

public interface AlimtalkTemplate {
    
    String BGMAGIT_RES_ACCOUNT2 = "bgmagit-res-account2"; // 예약대기 카카오뱅크 계좌
    String BGMAGIT_RES_PAYMENT = "bgmagit-res-payment"; // 예약대기 예약금 결제안내 (결제 라이브 후 스위칭)
    
    //kml 용
    
    String BGMAGIT_REVIEW = "bgmagit-review-2"; // 리뷰 등록되었을떄
    
    String BGMAGIT_RES_LECTURE =  "bgmagit-res-lecture-2"; // 사용자가 마작강의 신청했을때
    
    String BGMAGIT_RES_LECTURE_COMPLETE = "bgmagit-res-lecture-complete-2";
    
    String 	BGMAGIT_RES_LECTURE_CANCEL1 = "bgmagit-res-lecture-cancel1-2"; // 사용자가 마작강의 취소했을때
    
    String 	BGMAGIT_RES_LECTURE_CANCEL2 = "bgmagit-res-lecture-cancel2-2"; // 관리자가 마작강의 취소했을때

    String BGMAGIT_BML_MATCH = "bgmagit-bml-match"; // 대국 기록 등록 시 대국자에게 발송

    // 매일 09:00(KST) 관리자에게 당일 예약 현황 발송. 하이픈 2개는 카카오에 등록된 코드 그대로임(오타 아님)
    String BGMAGIT_ADMIN_RESERVATION_REMIND = "bgmagit-admin--reservation-rem";

}
