package com.bgmagitapi.origin.clocktower.util;

import com.bgmagitapi.origin.clocktower.util.ClockTowerImagePaths.HomebrewImages;
import com.bgmagitapi.origin.clocktower.util.ClockTowerImagePaths.Parsed;
import com.bgmagitapi.origin.clocktower.util.ClockTowerImagePaths.Variant;
import com.bgmagitapi.origin.entity.enumeration.ClockTowerCharacterType;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class ClockTowerImagePathsTest {

    private final ObjectMapper om = new ObjectMapper();

    @Test
    void 경로를_판본_id_갈래로_쪼갠다() {
        assertThat(ClockTowerImagePaths.parse("tb/imp_e.webp")).isEqualTo(new Parsed("tb", "imp", Variant.EVIL));
        assertThat(ClockTowerImagePaths.parse("fabled/doomsayer.webp"))
                .isEqualTo(new Parsed("fabled", "doomsayer", Variant.PLAIN));
        // generic 은 접미사까지 파일 이름
        Parsed generic = ClockTowerImagePaths.parse("generic/townsfolk_g.webp");
        assertThat(generic.isGeneric()).isTrue();
        assertThat(generic.id()).isEqualTo("townsfolk_g");
    }

    @Test
    void 형식에_맞지_않는_경로는_거른다() {
        for (String bad : List.of("../tb/imp_e.webp", "tb/imp_e.png", "https://evil.com/a.webp", "tb//imp.webp",
                "tb/Imp_e.webp", "tb/imp_x.webp", "tb/imp_e.webp?x=1", "a/b/c.webp", "")) {
            assertThat(ClockTowerImagePaths.parse(bad)).as(bad).isNull();
        }
        assertThat(ClockTowerImagePaths.parse(null)).isNull();
    }

    @Test
    void 진영별_이미지_갈래() {
        assertThat(ClockTowerImagePaths.variantsOf(ClockTowerCharacterType.TOWNSFOLK))
                .containsExactly(Variant.GOOD, Variant.EVIL);
        assertThat(ClockTowerImagePaths.variantsOf(ClockTowerCharacterType.DEMON))
                .containsExactly(Variant.GOOD, Variant.EVIL);
        assertThat(ClockTowerImagePaths.variantsOf(ClockTowerCharacterType.TRAVELLER))
                .containsExactly(Variant.PLAIN, Variant.GOOD, Variant.EVIL);
        assertThat(ClockTowerImagePaths.variantsOf(ClockTowerCharacterType.LORIC)).containsExactly(Variant.PLAIN);
        assertThat(ClockTowerImagePaths.variantsOf(null)).isEmpty();
    }

    @Test
    void 만든_경로는_다시_쪼갤_수_있다() {
        String path = ClockTowerImagePaths.path("carousel", "ferryman", Variant.PLAIN);
        assertThat(path).isEqualTo("carousel/ferryman.webp");
        assertThat(ClockTowerImagePaths.parse(path)).isNotNull();
        assertThat(ClockTowerImagePaths.sourceUrl("tb/imp_e.webp"))
                .isEqualTo("https://release.botc.app/resources/characters/tb/imp_e.webp");
        assertThat(ClockTowerImagePaths.s3Key("tb/imp_e.webp")).isEqualTo("clocktower/characters/tb/imp_e.webp");
        assertThat(ClockTowerImagePaths.GENERIC_NAMES).hasSize(22)
                .allSatisfy(n -> assertThat(ClockTowerImagePaths.parse(ClockTowerImagePaths.genericPath(n))).isNotNull());
    }

    @Test
    void 판본_폴더가_아닌_것은_복사_대상이_아니다() {
        assertThat(ClockTowerImagePaths.isOfficialEdition("tb")).isTrue();
        assertThat(ClockTowerImagePaths.isOfficialEdition("night")).isFalse();
        assertThat(ClockTowerImagePaths.isOfficialEdition("homebrew")).isFalse();
        assertThat(ClockTowerImagePaths.isOfficialEdition(null)).isFalse();
    }

    @Test
    void 자작_이미지_주소는_http_s만_받는다() {
        assertThat(ClockTowerImagePaths.safeExternalUrl(" https://a.com/x.png ")).isEqualTo("https://a.com/x.png");
        assertThat(ClockTowerImagePaths.safeExternalUrl("http://a.com/x.webp")).isEqualTo("http://a.com/x.webp");
        assertThat(ClockTowerImagePaths.safeExternalUrl("javascript:alert(1)")).isNull();
        assertThat(ClockTowerImagePaths.safeExternalUrl("data:image/png;base64,AAAA")).isNull();
        assertThat(ClockTowerImagePaths.safeExternalUrl("https://a.com/x.SVG")).isNull();
        assertThat(ClockTowerImagePaths.safeExternalUrl("https://a.com/" + "a".repeat(500))).isNull();
        assertThat(ClockTowerImagePaths.safeExternalUrl("//a.com/x.png")).isNull();
        assertThat(ClockTowerImagePaths.safeExternalUrl(null)).isNull();
    }

    @Test
    void 자작_이미지_배열은_기본_진영부터() throws Exception {
        // 주민: [선, 악]
        HomebrewImages town = ClockTowerImagePaths.homebrewImages(
                om.readTree("[\"https://a.com/g.png\",\"https://a.com/e.png\"]"), ClockTowerCharacterType.TOWNSFOLK);
        assertThat(town).isEqualTo(new HomebrewImages("https://a.com/g.png", "https://a.com/g.png", "https://a.com/e.png"));
        // 악마: [악, 선]
        HomebrewImages demon = ClockTowerImagePaths.homebrewImages(
                om.readTree("[\"https://a.com/e.png\",\"https://a.com/g.png\"]"), ClockTowerCharacterType.DEMON);
        assertThat(demon.good()).isEqualTo("https://a.com/g.png");
        assertThat(demon.evil()).isEqualTo("https://a.com/e.png");
        // 여행자: [무진영, 선, 악]
        HomebrewImages trav = ClockTowerImagePaths.homebrewImages(
                om.readTree("[\"https://a.com/n.png\",\"https://a.com/g.png\",\"https://a.com/e.png\"]"),
                ClockTowerCharacterType.TRAVELLER);
        assertThat(trav).isEqualTo(new HomebrewImages("https://a.com/n.png", "https://a.com/g.png", "https://a.com/e.png"));
        // 문자열 하나
        HomebrewImages single = ClockTowerImagePaths.homebrewImages(
                om.readTree("\"https://a.com/x.png\""), ClockTowerCharacterType.OUTSIDER);
        assertThat(single.image()).isEqualTo("https://a.com/x.png");
        assertThat(single.evil()).isNull();
        // 위험한 주소는 빠진다
        HomebrewImages bad = ClockTowerImagePaths.homebrewImages(
                om.readTree("\"javascript:alert(1)\""), ClockTowerCharacterType.OUTSIDER);
        assertThat(bad).isEqualTo(new HomebrewImages(null, null, null));
        assertThat(ClockTowerImagePaths.homebrewImages(null, ClockTowerCharacterType.OUTSIDER))
                .isEqualTo(new HomebrewImages(null, null, null));
    }
}
