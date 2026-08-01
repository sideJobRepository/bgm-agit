package com.bgmagitapi.origin.security.dto;

import com.bgmagitapi.origin.security.handler.TokenPair;

// 토큰 + 유저 응답용
public record TokenAndUser(TokenPair token, BgmAgitMemberResponseDto user) {}

