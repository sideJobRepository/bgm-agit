package com.bgmagitapi.util;

import com.bgmagitapi.entity.BgmAgitReservation;
import com.bgmagitapi.service.response.Attach;

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
    public static String buildReservationMessage(String userName, String date, String times, String roomName) {
        return new StringBuilder()
                .append("안녕하세요.").append(userName).append("님\n")
                .append("BGM 아지트 예약 내역을 알려드립니다.\n\n")
                .append("예약자: ").append(userName).append("\n")
                .append("예약 일자: ").append(date).append("\n")
                .append("예약 시간: ").append(times).append("\n")
                .append("예약 상태: 예약 대기\n")
                .append("예약 룸: ").append(roomName).append("\n\n")
                .append("자세한 예약내역은 BGM 아지트 홈페이지 사이트 에서 로그인 후 마이페이지 > 예약내역에서 확인하실 수 있습니다.")
                .toString();
    }
    /* 예약 취소 메시지 필드 1*/
    public static String buildReservationCancelMessage(String userName, String date, String times, String roomName) {
        return new StringBuilder()
                .append("안녕하세요.").append(userName).append("님\n")
                .append("BGM 아지트 예약 취소 내역을 알려드립니다.\n\n")
                .append("예약자: ").append(userName).append("\n")
                .append("예약 일자: ").append(date).append("\n")
                .append("예약 시간: ").append(times).append("\n")
                .append("예약 상태: 예약 취소\n")
                .append("예약 룸: ").append(roomName).append("\n\n")
                .append("자세한 예약내역은 BGM 아지트 홈페이지 사이트 에서 로그인 후 마이페이지 > 예약내역에서 확인하실 수 있습니다.")
                .toString();
    }
    /* 예약 취소 메시지 필드 2 */
    public static String buildReservationCancelMessageAdmin(String userName, String date, String times, String roomName) {
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
    
    public static String buildReservationCompleteMessage(String userName, String date, String times, String roomName) {
        return new StringBuilder()
                .append("안녕하세요.").append(userName).append("님\n")
                .append("BGM 아지트 예약 완료 내역을 알려드립니다.\n\n")
                .append("예약자: ").append(userName).append("\n")
                .append("예약 일자: ").append(date).append("\n")
                .append("예약 시간: ").append(times).append("\n")
                .append("예약 상태: 예약 완료\n")
                .append("예약 룸: ").append(roomName).append("\n\n")
                .append("자세한 예약내역은 BGM 아지트 홈페이지 사이트 에서 로그인 후 마이페이지 > 예약내역 에서 확인하실 수 있습니다.")
                .toString();
    }
    
    public static String buildOwnerReservationMessage(String userName, String date, String times, String roomName) {
        return new StringBuilder()
                .append("안녕하세요.").append("관리자").append("님\n")
                .append("BGM 아지트 예약 내역을 알려드립니다.\n\n")
                .append("예약자: ").append(userName).append("\n")
                .append("예약 일자: ").append(date).append("\n")
                .append("예약 시간: ").append(times).append("\n")
                .append("예약 상태: 예약 대기\n")
                .append("예약 룸: ").append(roomName).append("\n\n")
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
    
    public static Map<String, Object> buildOwnerSendRequest(
            String senderKey, String message , String tmpltName ,  Attach attach
    ) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("msgIdx", UUID.randomUUID().toString());
        m.put("countryCode", "82");
        m.put("resMethod", "PUSH");
        m.put("senderKey", senderKey);
        m.put("tmpltCode", tmpltName);
        m.put("recipient", "010-5059-3499");
        m.put("message", message);
        if (attach != null) m.put("attach", attach);
        return m;
    }
}
