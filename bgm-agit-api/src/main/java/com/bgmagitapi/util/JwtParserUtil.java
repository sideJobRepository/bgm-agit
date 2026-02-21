package com.bgmagitapi.util;

import org.springframework.security.oauth2.jwt.Jwt;

import java.util.List;

public class JwtParserUtil {

    public static Long extractMemberId(Jwt jwt) {
        return jwt.getClaim("id");
    }
    
    public static String extractRole(Jwt jwt) {
         List<String> roles = jwt.getClaim("roles");
        return roles != null && !roles.isEmpty() ? roles.get(0) : "GUEST";
    }
    
}
