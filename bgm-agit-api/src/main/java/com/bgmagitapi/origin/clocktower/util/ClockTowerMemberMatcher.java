package com.bgmagitapi.origin.clocktower.util;

/**
 * 시계탑 참가자 닉네임 검색 판정. 매장 태블릿에서 한글을 끝까지 조합하지 않아도 찾게 초성을 받는다.
 * 검색어의 자음 한 글자(ㄱ~ㅎ)는 닉네임 글자의 초성과, 나머지는 글자 그대로(대소문자 무시) 비교한다 —
 * "ㅎㄱㄷ"·"홍ㄱㄷ"·"홍길" 모두 홍길동에 걸린다.
 */
public final class ClockTowerMemberMatcher {

    /** 걸리지 않음 */
    public static final int NO_MATCH = -1;

    private static final char[] CHOSUNG = {
            'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ',
            'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
    };

    private ClockTowerMemberMatcher() {
    }

    /**
     * 정렬용 순위. 0 = 닉네임이 검색어와 같음, 1 = 앞에서부터 걸림, 2 = 중간에 걸림, NO_MATCH = 안 걸림.
     * 같은 순위 안에서는 호출하는 쪽이 시계탑 기록 수로 다시 정렬한다(단골이 위로).
     */
    public static int rank(String nickname, String keyword) {
        if (nickname == null || keyword == null) return NO_MATCH;
        String nick = normalize(nickname);
        String kw = normalize(keyword);
        if (kw.isEmpty() || kw.length() > nick.length()) return NO_MATCH;
        if (nick.equals(kw)) return 0;
        for (int start = 0; start + kw.length() <= nick.length(); start++) {
            if (matchesAt(nick, kw, start)) return start == 0 ? 1 : 2;
        }
        return NO_MATCH;
    }

    // 띄어쓰기는 무시한다("홍 길동"으로 가입한 사람도 "홍길동"으로 찾게)
    private static String normalize(String s) {
        return s.replaceAll("\\s+", "").toLowerCase();
    }

    private static boolean matchesAt(String nick, String kw, int start) {
        for (int i = 0; i < kw.length(); i++) {
            if (!charMatches(nick.charAt(start + i), kw.charAt(i))) return false;
        }
        return true;
    }

    private static boolean charMatches(char target, char typed) {
        if (target == typed) return true;
        return isChosung(typed) && chosungOf(target) == typed;
    }

    private static boolean isChosung(char c) {
        for (char ch : CHOSUNG) {
            if (ch == c) return true;
        }
        return false;
    }

    /** 완성형 한글이면 초성 자모, 아니면 0 */
    static char chosungOf(char c) {
        if (c < '가' || c > '힣') return 0;
        return CHOSUNG[(c - '가') / 588];
    }
}
