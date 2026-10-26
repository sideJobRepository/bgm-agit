package com.bgmagitapi.origin.util;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class AlimtalkClockTowerRoleMessageTest {

    // 카카오에 등록한 bgmagit-ct-role 원문. 고정 문구가 한 글자라도 다르면 발송이 거부된다
    private static final String TEMPLATE = """
            [BGM 아지트 시계탑 캐릭터 배정 안내]

            #{닉네임}님, BGM 아지트에서 참가 신청하신 시계탑 게임의 캐릭터가 이야기꾼에 의해 배정되었습니다.

            게임: #{게임명}
            캐릭터: #{캐릭터} (#{종류})

            능력과 팀 정보는 아래 버튼에서 확인해 주세요.
            게임이 끝날 때까지 다른 참가자에게 보여주지 마세요.

            ※ 이 메시지는 시계탑 게임 참가를 신청하신 회원님께 캐릭터 배정 시 발송됩니다.""";

    @Test
    @DisplayName("등록된 템플릿의 변수만 바꾼 것과 글자 단위로 같다")
    void matchesRegisteredTemplate() {
        String expected = TEMPLATE
                .replace("#{닉네임}", "홍길동")
                .replace("#{게임명}", "점철되는 혼란")
                .replace("#{캐릭터}", "점쟁이")
                .replace("#{종류}", "마을주민");

        assertThat(AlimtalkUtils.buildClockTowerRoleMessage("홍길동", "점철되는 혼란", "점쟁이", "마을주민"))
                .isEqualTo(expected);
    }
}
