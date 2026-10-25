package com.bgmagitapi.origin.clocktower.util;

import com.bgmagitapi.origin.advice.exception.ValidException;
import com.bgmagitapi.origin.entity.enumeration.ClockTowerCharacterType;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * 진행판 세션(플레이어 휴대폰 "내 캐릭터")의 순수 규칙. DB 없이 테스트한다.
 */
public final class ClockTowerSessionRules {

    /** 생성 후 이 시간이 지나면 ACTIVE 여도 닫힌 것으로 본다(오래된 세션이 다음 게임에 뜨지 않게) */
    public static final int EXPIRE_HOURS = 18;

    public static final int MAX_SEATS = 30;
    public static final int MAX_SEAT_NO = 99;
    public static final int MAX_ROLE_KEY_LENGTH = 100;
    public static final int MAX_INFO_TITLE_LENGTH = 200;
    public static final int MAX_INFO_LINES = 40;
    public static final int MAX_INFO_LINE_LENGTH = 500;

    // 직접 입력 캐릭터 키 "c{캐릭터ID}" (진행판 grimoire 응답의 key 와 같은 규칙)
    private static final Pattern CHARACTER_KEY = Pattern.compile("^c(\\d{1,18})$");

    private ClockTowerSessionRules() {
    }

    // ============================ 만료 ============================

    public static boolean isExpired(LocalDateTime registDate, LocalDateTime now) {
        if (registDate == null) return true;
        return !now.isBefore(registDate.plusHours(EXPIRE_HOURS));
    }

    /** 이 시각보다 뒤에 만든 세션만 살아 있다 */
    public static LocalDateTime aliveCreatedAfter(LocalDateTime now) {
        return now.minusHours(EXPIRE_HOURS);
    }

    // ============================ 좌석 비교 ============================

    /** 플레이어에게 보이는 내용(좌석 번호·캐릭터·선악·정보)이 바뀌었는지 */
    public static boolean isChanged(Integer oldSeatNo, String oldRoleKey, String oldEvil, String oldInfo,
                                    Integer newSeatNo, String newRoleKey, String newEvil, String newInfo) {
        return !Objects.equals(oldSeatNo, newSeatNo)
                || !Objects.equals(oldRoleKey, newRoleKey)
                || !Objects.equals(oldEvil, newEvil)
                || !Objects.equals(oldInfo, newInfo);
    }

    /** 확인한 버전: 지금 버전을 넘지 않고, 뒤로 가지 않는다 */
    public static int nextViewedVersion(Integer viewedVersion, int reported, Integer currentVersion) {
        int viewed = viewedVersion == null ? 0 : viewedVersion;
        int current = currentVersion == null ? 0 : currentVersion;
        int clamped = Math.max(0, Math.min(reported, current));
        return Math.max(viewed, clamped);
    }

    // ============================ 값 정규화 ============================

    public static String evilFlag(Boolean evil) {
        return evil == null ? null : (evil ? "Y" : "N");
    }

    public static Boolean parseEvil(String flag) {
        if ("Y".equals(flag)) return Boolean.TRUE;
        if ("N".equals(flag)) return Boolean.FALSE;
        return null;
    }

    public static String normalizeRoleKey(String roleKey) {
        if (!StringUtils.hasText(roleKey)) return null;
        String key = roleKey.trim();
        if (key.length() > MAX_ROLE_KEY_LENGTH) {
            throw new ValidException("캐릭터 키가 너무 깁니다.");
        }
        return key;
    }

    /** "c{캐릭터ID}" 면 캐릭터 id, 사전 키면 null */
    public static Long characterIdOf(String roleKey) {
        if (roleKey == null) return null;
        Matcher m = CHARACTER_KEY.matcher(roleKey);
        return m.matches() ? Long.valueOf(m.group(1)) : null;
    }

    /** 정보 카드 정리. 빈 줄은 빼고, 제목·줄이 모두 없으면 null(정보 없음) */
    public static Info normalizeInfo(String title, List<String> lines) {
        String t = StringUtils.hasText(title) ? title.trim() : null;
        if (t != null && t.length() > MAX_INFO_TITLE_LENGTH) {
            throw new ValidException("정보 제목은 " + MAX_INFO_TITLE_LENGTH + "자 이내로 입력해 주세요.");
        }
        List<String> cleaned = new ArrayList<>();
        if (lines != null) {
            for (String line : lines) {
                if (!StringUtils.hasText(line)) continue;
                String l = line.trim();
                if (l.length() > MAX_INFO_LINE_LENGTH) {
                    throw new ValidException("정보 한 줄은 " + MAX_INFO_LINE_LENGTH + "자 이내로 입력해 주세요.");
                }
                cleaned.add(l);
            }
        }
        if (cleaned.size() > MAX_INFO_LINES) {
            throw new ValidException("정보는 " + MAX_INFO_LINES + "줄까지 보낼 수 있습니다.");
        }
        if (t == null && cleaned.isEmpty()) return null;
        return new Info(t == null ? "" : t, List.copyOf(cleaned));
    }

    public record Info(String title, List<String> lines) {
    }

    /** 좌석 목록 기본 검사: 회원·좌석 번호 필수, 회원 중복 금지, 인원 상한 */
    public static void validateSeats(List<SeatKey> seats, boolean allowEmpty) {
        if (seats == null || seats.isEmpty()) {
            if (allowEmpty) return;
            throw new ValidException("좌석이 없습니다.");
        }
        if (seats.size() > MAX_SEATS) {
            throw new ValidException("좌석은 " + MAX_SEATS + "개까지입니다.");
        }
        Set<Long> members = new HashSet<>();
        for (SeatKey s : seats) {
            if (s.memberId() == null) {
                throw new ValidException("회원이 지정되지 않은 좌석이 있습니다.");
            }
            if (s.seatNo() == null || s.seatNo() < 1 || s.seatNo() > MAX_SEAT_NO) {
                throw new ValidException("좌석 번호가 올바르지 않습니다.");
            }
            if (!members.add(s.memberId())) {
                throw new ValidException("같은 회원이 두 자리에 앉아 있습니다.");
            }
        }
    }

    public record SeatKey(Long memberId, Integer seatNo) {
    }

    // ============================ 진영·이미지 ============================

    /**
     * 플레이어에게 보여줄 선악. 이야기꾼이 지정했으면 그 값, 아니면 캐릭터 기본 진영.
     * 여행자·전설·로릭처럼 기본 진영이 없으면 null.
     */
    public static Boolean displayEvil(Boolean evil, ClockTowerCharacterType team) {
        if (evil != null) return evil;
        if (team == null || team == ClockTowerCharacterType.TRAVELLER || !team.isSeatable()) return null;
        return team.isEvil();
    }

    /**
     * 진영에 맞는 이미지. 선악이 정해졌으면 그 갈래, 없으면 무진영 이미지 → 선 이미지 순.
     * 원하는 갈래가 없으면 무진영 이미지로 대신한다(자작 캐릭터는 한 장만 있는 경우가 많다).
     */
    public static String pickImage(Boolean evil, String plain, String good, String evilImage) {
        if (Boolean.TRUE.equals(evil)) return firstNonBlank(evilImage, plain);
        if (Boolean.FALSE.equals(evil)) return firstNonBlank(good, plain);
        return firstNonBlank(plain, good);
    }

    private static String firstNonBlank(String a, String b) {
        if (StringUtils.hasText(a)) return a;
        if (StringUtils.hasText(b)) return b;
        return null;
    }
}
