package com.bgmagitapi.security.dto;

import com.bgmagitapi.security.handler.TokenPair;

// 토큰 + 유저 응답용
public record TokenAndUser(TokenPair token, BgmAgitMemberResponseDto user) {}

