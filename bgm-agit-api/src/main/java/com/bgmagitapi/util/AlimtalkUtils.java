package com.bgmagitapi.util;

import com.bgmagitapi.entity.BgmAgitReservation;
import com.bgmagitapi.service.response.Attach;
import jakarta.servlet.http.HttpServletRequest;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

public class AlimtalkUtils {
    private AlimtalkUtils() {}
    
    // 재사용 포맷터
    public static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("HH:mm");
    public static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final LocalTime BOUNDARY = LocalTime.of(13, 0); // 영업 시작(정렬 기준)
    /** 한국 전화번호 포맷 (+82 → 0, 하이픈 삽입) */
    public static String formatRecipientKr(String raw) {
        if (raw == null || raw.isBlank()) return "";
        String n = raw.replaceFirst("^\\+82\\s*", "0").replaceAll("\\D", "");
        if (n.startsWith("02"))  return n.replaceFirst("^(02)(\\d{3,4})(\\d{4})$", "$1-$2-$3");
        return n.replaceFirst("^(0\\d{2})(\\d{3,4})(\\d{4})$", "$1-$2-$3");
    }
    
    /** 예약 시간들을 "HH:mm, HH:mm, ..."로 정렬·중복제거하여 조합 */
    public static String formatTimes(List<BgmAgitReservation> list) {
        if (list == null || list.isEmpty()) return "";
        
        return list.stream()
                .filter(r -> r.getBgmAgitReservationStartTime() != null && r.getBgmAgitReservationEndTime() != null)
                // 1) 13:00 이상 먼저, 2) 같은 그룹 내에서는 시작시간 오름차순
                .sorted(
                        Comparator
                                .comparing((BgmAgitReservation r) -> r.getBgmAgitReservationStartTime().isBefore(BOUNDARY)) // false(>=13:00) 먼저
                                .thenComparing(BgmAgitReservation::getBgmAgitReservationStartTime)
                )
                .map(r -> TIME_FMT.format(r.getBgmAgitReservationStartTime()) + " ~ " + TIME_FMT.format(r.getBgmAgitReservationEndTime()))
                .distinct()
                .collect(Collectors.joining(" , "));
    }
    
    public static String formatDate(LocalDate date) {
        return date == null ? "" : DATE_FMT.format(date);
    }
    
    /** 예약 안내 메시지 빌드 */
    public static String buildReservationMessage(String userName, String date, String times, String roomName, String people, String request) {
        return new StringBuilder()
                .append("안녕하세요.").append(userName).append("님\n")
                .append("BGM 아지트 예약 내역을 안내드립니다.\n\n")
                .append("예약자: ").append(userName).append("\n")
                .append("예약 일자: ").append(date).append("\n")
                .append("예약 시간: ").append(times).append("\n")
                .append("예약 상태: 예약 대기\n")
                .append("예약 룸: ").append(roomName).append("\n")
                .append("예약 인원: ").append(people).append("\n")
                .append("요청 사항: ").append(request).append("\n\n")
                .append("예약은 예약금 10,000원이 입금 확인되는 시점에 최종 확정됩니다.\n")
                .append("가급적 예약자명으로 입금해 주시기 바랍니다.\n\n")
                .append("확정 이후 취소가 필요한 경우에는 0507-1445-3503으로 문의해 주시면 안내해 드리겠습니다.\n\n")
                .append("[입금 계좌 안내]\n")
                .append("하나은행 : 60891052636607\n")
                .append("예금주 : 박범후\n\n")
                .append("자세한 예약내역은 BGM 아지트 홈페이지 로그인 후 마이페이지 > 예약내역에서 확인하실 수 있습니다.")
                .toString();
    }
    /* 예약 취소 메시지 필드 1*/
    public static String reservationCancelMessage1(String userName, String date, String times, String roomName,String people, String request) {
        return new StringBuilder()
                .append("안녕하세요.").append(userName).append("님\n")
                .append("BGM 아지트 예약 취소 내역을 알려드립니다.\n\n")
                .append("예약자: ").append(userName).append("\n")
                .append("예약 일자: ").append(date).append("\n")
                .append("예약 시간: ").append(times).append("\n")
                .append("예약 상태: 예약 취소\n")
                .append("예약 룸: ").append(roomName).append("\n")
                .append("예약 인원: ").append(people).append("\n")
                .append("요청 사항: ").append(request).append("\n\n")
                .append("자세한 예약내역은 BGM 아지트 홈페이지 사이트 에서 로그인 후 마이페이지 > 예약내역에서 확인하실 수 있습니다.")
                .toString();
    }
    /* 예약 취소 메시지 필드 2 */
    public static String reservationCancelMessage2(String userName, String date, String times, String roomName) {
        return new StringBuilder()
                .append("안녕하세요,").append(userName).append("님.\n")
                .append("먼저, 예약 취소로 불편을 드려 죄송합니다.\n")
                .append("선 예약자가 있어 고객님의 BGM 아지트 예약이 취소되어 안내드립니다.\n\n")
                .append("예약자: ").append(userName).append("\n")
                .append("예약 일자: ").append(date).append("\n")
                .append("예약 시간: ").append(times).append("\n")
                .append("예약 상태: 예약 취소\n")
                .append("예약 룸: ").append(roomName).append("\n\n")
                .append("자세한 예약 내역은 BGM 아지트 홈페이지 로그인 후 마이페이지 > 예약내역에서 확인하실 수 있습니다.\n\n")
                .append(userName).append("님의 양해 부탁드립니다.")
                .toString();
    }
    /* 예약 취소 메시지 필드 3 */
    public static String reservationCancelMessage3(String userName, String date, String times, String roomName ,String people, String request) {
        return new StringBuilder()
                .append("안녕하세요.관리자님\n")
                .append("BGM 아지트 예약 취소 내역을 알려드립니다.\n\n")
                .append("예약자: ").append(userName).append("\n")
                .append("예약 일자: ").append(date).append("\n")
                .append("예약 시간: ").append(times).append("\n")
                .append("예약 상태: 예약 취소\n")
                .append("예약 룸: ").append(roomName).append("\n")
                .append("예약 인원: ").append(people).append("\n")
                .append("요청 사항: ").append(request).append("\n\n")
                .append("자세한 예약내역은 BGM 아지트 홈페이지 사이트 에서 로그인 후 마이페이지 > 예약내역에서 확인하실 수 있습니다.")
                .toString();
    }
    
    
    
    public static String buildReservationCompleteMessage(String userName, String date, String times, String roomName,String people,String request) {
        return new StringBuilder()
                .append("안녕하세요.").append(userName).append("님\n")
                .append("BGM 아지트 예약 완료 내역을 알려드립니다.\n\n")
                .append("예약자: ").append(userName).append("\n")
                .append("예약 일자: ").append(date).append("\n")
                .append("예약 시간: ").append(times).append("\n")
                .append("예약 상태: 예약 완료\n")
                .append("예약 룸: ").append(roomName).append("\n")
                .append("예약 인원: ").append(people).append("\n")
                .append("요청사항: ").append(request).append("\n\n")
                .append("취소는 1일전까지 가능하며, 당일 취소나 노쇼시 예약금은 환불되지 않습니다.\n")
                .append("자세한 예약내역은 BGM 아지트 홈페이지 사이트 에서 로그인 후 마이페이지 > 예약내역 에서 확인하실 수 있습니다.")
                .toString();
    }
    
    public static String buildOwnerReservationMessage(String userName, String date, String times, String roomName,String people, String request ) {
        return new StringBuilder()
                .append("안녕하세요.").append("관리자").append("님\n")
                .append("BGM 아지트 예약 내역을 알려드립니다.\n\n")
                .append("예약자: ").append(userName).append("\n")
                .append("예약 일자: ").append(date).append("\n")
                .append("예약 시간: ").append(times).append("\n")
                .append("예약 상태: 예약 대기\n")
                .append("예약 룸: ").append(roomName).append("\n")
                .append("예약 인원: ").append(people).append("\n")
                .append("요청 사항: ").append(request).append("\n\n")
                .append("자세한 예약내역은 BGM 아지트 홈페이지 사이트 에서 로그인 후 마이페이지 > 예약내역에서 확인하실 수 있습니다.")
                .toString();
    }
    
    public static String memberJoinMessage(String userName, String date, String times) {
        return new StringBuilder()
                .append("안녕하세요.").append("관리자").append("님\n")
                .append("BGM 아지트 회원 가입 내역을 알려드립니다.\n\n")
                .append("가입자:").append(userName).append("\n")
                .append("가입 일자:").append(date).append("\n")
                .append("가입 시간:").append(times).append("\n\n")
                .append("자세한 예약내역은 BGM 아지트 홈페이지 사이트 에서 로그인 후 마이페이지 > 권한 관리에서 확인하실 수 있습니다.")
                .toString();
    }
    
    /**
     * BGM 아지트 문의 등록 관리자 알림
     * @param userName
     * @param title
     * @param date
     * @param time
     * @return
     */
    public static String oneToOneInquiry(String userName,String title,String date, String time) {
     return new StringBuilder()
             .append(("[BGM 아지트 1:1 문의 알림]\n\n"))
             .append(("새로운 1:1 문의가 접수되었습니다.\n"))
             .append("문의하신 회원:").append(userName).append("\n")
             .append("문의 제목:").append(title).append("\n")
             .append("문의 등록일:").append(date).append("\n")
             .append("문의 등록시간:").append(time).append("\n\n")
             .append("자세한 문의 내역은 BGM 아지트 홈페이지 사이트 에서 로그인 후 마이페이지 > 1:1문의에서 확인하실 수 있습니다.")
             .toString();
    }
    
    /**
     *	BGM 아지트 문의 답변 알림
     * @param userName
     * @return
     */
    public static String oneToOneInquiryAns(String userName) {
        return new StringBuilder()
                 .append(("[BGM 아지트 1:1 문의 답변 안내]\n\n"))
                 .append("안녕하세요.").append(userName).append("님").append("\n")
                 .append("BGM 아지트에 남겨주신 1:1 문의에 대한 답변이 등록되었습니다.\n\n")
                 .append("자세한 문의내역은 BGM 아지트 홈페이지 사이트 에서 로그인 후 마이페이지 > 1:1문의에서 확인하실 수 있습니다.")
                 .toString();
    }
    

    
    /** 기본 버튼 세트(필요 시 수정) */
    public static Attach defaultAttach(String message) {
        return new Attach(List.of(
                Attach.Button.wl(message, "https://bgmagit.co.kr")
        ));
    }
    
    /** 비즈톡 요청 맵 생성 (attach는 null 가능) */
    public static Map<String, Object> buildSendRequest(
            String senderKey, String recipient, String message,String tmpltName ,  Attach attach
    ) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("msgIdx", UUID.randomUUID().toString());
        m.put("countryCode", "82");
        m.put("resMethod", "PUSH");
        m.put("senderKey", senderKey);
        m.put("tmpltCode", tmpltName);
        m.put("recipient", recipient);
        m.put("message", message);
        if (attach != null) m.put("attach", attach);
        return m;
    }
}
