package com.bgmagitapi.origin.util;

/**
 * 손님에게 보여주는 목록(예약 랭킹 등)의 닉네임 가리기. 관리자 화면은 원문을 쓴다.
 *
 *  - 1글자: 그대로
 *  - 2글자: 끝 글자만 x   (홍길 → 홍x)
 *  - 3글자 이상: 첫 글자·끝 글자만 남기고 가운데 전부 x   (홍길동 → 홍x동, 홍길동이 → 홍xx이)
 *
 * 서버에서 가린 값을 내려보내야 한다 — 프론트에서 가리면 응답에 원문이 그대로 남는다.
 * 이모지 등 보조 평면 문자가 반으로 잘리지 않게 코드포인트 단위로 센다.
 */
public final class NicknameMasker {

    private static final String MASK = "x";

    private NicknameMasker() {
    }

    public static String mask(String nickname) {
        if (nickname == null || nickname.isBlank()) {
            return nickname;
        }
        int[] chars = nickname.strip().codePoints().toArray();
        int length = chars.length;
        if (length == 1) {
            return new String(chars, 0, 1);
        }
        StringBuilder masked = new StringBuilder();
        masked.appendCodePoint(chars[0]);
        if (length == 2) {
            return masked.append(MASK).toString();
        }
        masked.append(MASK.repeat(length - 2));
        masked.appendCodePoint(chars[length - 1]);
        return masked.toString();
    }
}
