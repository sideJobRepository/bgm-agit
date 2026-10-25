package com.bgmagitapi.origin.clocktower.util;

import com.bgmagitapi.origin.advice.exception.ValidException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.web.client.RestClient;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class VnamuScriptFetcherTest {

    private final VnamuScriptFetcher fetcher = new VnamuScriptFetcher(RestClient.builder(), new ObjectMapper());

    @Test
    @DisplayName("slug 주소는 페이지를 받지 않고 바로 slug 를 꺼낸다")
    void slugPaths() {
        assertThat(fetcher.resolveSlug("https://botc.vnamu.com/sheet/ypm9hi")).isEqualTo("ypm9hi");
        assertThat(fetcher.resolveSlug("https://botc.vnamu.com/api/download-json/ypm9hi")).isEqualTo("ypm9hi");
        assertThat(fetcher.resolveSlug(" https://botc.vnamu.com/en/sheet/ypm9hi/ ")).isEqualTo("ypm9hi");
    }

    @Test
    @DisplayName("다른 사이트·엉뚱한 경로는 요청하지 않고 거절한다")
    void rejectOthers() {
        assertThatThrownBy(() -> fetcher.resolveSlug("https://evil.example.com/sheet/ypm9hi")).isInstanceOf(ValidException.class);
        assertThatThrownBy(() -> fetcher.resolveSlug("https://botc.vnamu.com.evil.com/sheet/ypm9hi")).isInstanceOf(ValidException.class);
        assertThatThrownBy(() -> fetcher.resolveSlug("https://botc.vnamu.com/admin")).isInstanceOf(ValidException.class);
        assertThatThrownBy(() -> fetcher.resolveSlug("file:///etc/passwd")).isInstanceOf(ValidException.class);
        assertThatThrownBy(() -> fetcher.resolveSlug("")).isInstanceOf(ValidException.class);
    }
}
