package com.bgmagitapi.origin.util;

public interface AlimtalkTemplate {
    
    String BGMAGIT_RES_ACCOUNT2 = "bgmagit-res-account2"; // 예약대기 카카오뱅크 계좌
    // 예약대기 예약금 결제안내 (결제 라이브 후 스위칭)
    // -1 버전은 예약금을 고정 문구에서 빼고 변수 #{예약금}으로 돌린 개정판.
    // 금액 정책이 바뀌어도(인원수 기준 전환 등) 카카오 재심사 없이 소스만 고치면 된다.
    String BGMAGIT_RES_PAYMENT = "bgmagit-res-payment-1";
    /**
     * 10월 전액결제·3단계 환불 전환에 맞춘 개정판.
     *
     * -1 의 고정 문구("예약금 결제", "취소는 예약일 전날까지 가능하며 …")가 새 규정과 달라져
     * 문구 자체를 바꿔야 했고, 고정 문구 변경은 카카오 재심사 대상이라 템플릿을 새로 판다.
     * 검수 통과 전에는 biztalk.reservation-payment-v2=false 로 두어 -1 이 그대로 나간다.
     */
    String BGMAGIT_RES_PAYMENT_V2 = "bgmagit-res-payment-2";
    
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
