package com.bgmagitapi.origin.murder.dto.response;

/**
 * 표지 자동 채우기 한 건의 결과. filled=false 면 message 가 건너뛴 사유
 */
public record MurderCoverAutoFillResponse(Long id, String name, boolean filled, String message, String imageUrl) {
}
