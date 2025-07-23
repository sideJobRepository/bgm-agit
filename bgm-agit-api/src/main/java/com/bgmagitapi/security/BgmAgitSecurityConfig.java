package com.bgmagitapi.security;


import com.bgmagitapi.security.entrypoint.BgmAgitAuthenticationEntryPoint;
import com.bgmagitapi.security.manager.BgmAgitAuthorizationManager;
import com.bgmagitapi.security.provider.SocialAuthenticationProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authorization.AuthorizationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.intercept.RequestAuthorizationContext;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@EnableWebSecurity
@Configuration
@RequiredArgsConstructor
public class BgmAgitSecurityConfig {
    
    private final String[] resource = {"/css/**", "/images/**", "/js/**", "/favicon.*", "/*/icon-*"};
    
    @Value("${cors.url}")
    private String corsUrl;
    
    
    private final AuthenticationEntryPoint bgmagitAuthenticationEntryPoint;
    private final AuthorizationManager<RequestAuthorizationContext> bgmAgitAuthorizationManager;
    private final AuthenticationProvider socialAuthenticationProvider;
    
    
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        
        AuthenticationManagerBuilder managerBuilder = http.getSharedObject(AuthenticationManagerBuilder.class);
        managerBuilder.authenticationProvider(socialAuthenticationProvider);
        AuthenticationManager authenticationManager = managerBuilder.build();
        http.  authorizeHttpRequests(auth -> auth
                        .requestMatchers(resource).permitAll()
                .anyRequest().access(bgmAgitAuthorizationManager))
                .authenticationManager(authenticationManager)
                .formLogin(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .oauth2ResourceServer(oauth -> oauth
                        .jwt(Customizer.withDefaults()))
                .with(new BgmAgitSecurityDsl<>(), bgmAgitSecurityDsl -> bgmAgitSecurityDsl
                        .bgmAgitEntryPoint(bgmagitAuthenticationEntryPoint)
                );
        return http.build();
    }
    
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration corsConfiguration = new CorsConfiguration();
        corsConfiguration.setAllowedOrigins(List.of(corsUrl));
        corsConfiguration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE"));
        corsConfiguration.setAllowedHeaders(List.of("*"));
        corsConfiguration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfiguration);
        return source;
    }

    
    
}
