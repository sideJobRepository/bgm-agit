package com.bgmagitapi.service.impl;

import com.bgmagitapi.entity.BgmAgitBiztalkToken;
import com.bgmagitapi.repository.BgmAgitBiztalkTokenRepository;
import com.bgmagitapi.service.BgmAgitBizTalkService;
import com.bgmagitapi.service.response.BizTalkTokenResponse;
import com.querydsl.core.types.Projections;
import com.querydsl.jpa.JPAExpressions;
import com.querydsl.jpa.impl.JPAQueryFactory;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

import static com.bgmagitapi.entity.QBgmAgitBiztalkToken.bgmAgitBiztalkToken;

@Transactional
@Service
@RequiredArgsConstructor
public class BgmAgitBizTalkServiceImpl implements BgmAgitBizTalkService {
    
    @Value("${biztalk.id}")
    private String biztalkId;
    @Value("${biztalk.password}")
    private String biztalkPassword;
    private final String biztalkUrl = "https://www.biztalk-api.com";
    
    private final BgmAgitBiztalkTokenRepository  biztalkTokenRepository;
    
    private final JPAQueryFactory queryFactory;
    
    @PostConstruct
    public void init() {
        issueAndSaveToken();
    }
    
    @Scheduled(fixedDelayString = "PT11H")
    public void scheduled() {
        issueAndSaveToken();
    }
    
    @Override
    @Transactional(readOnly = true)
    public BizTalkTokenResponse getBizTalkToken() {
        
     return queryFactory
                .select(Projections.constructor(
                        BizTalkTokenResponse.class,
                        bgmAgitBiztalkToken.bgmAgitBiztalkTokenValue,
                        bgmAgitBiztalkToken.bgmAgitBiztalkTokenExpiresDate
                ))
                .from(bgmAgitBiztalkToken)
                .where(
                        bgmAgitBiztalkToken.bgmAgitBiztalkTokenId.eq(
                                JPAExpressions
                                        .select(bgmAgitBiztalkToken.bgmAgitBiztalkTokenId.max())
                                        .from(bgmAgitBiztalkToken)
                        )
                ).fetchOne();
    
    }
    
    
    public void issueAndSaveToken() {
        RestClient restClient = RestClient.create();
        
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("bsid", biztalkId);
        requestBody.put("passwd", biztalkPassword);
        requestBody.put("expire", 720);
        
        BizTalkTokenResponse result = restClient.post()
                .uri(biztalkUrl + "/v2/auth/getToken")
                .header("Content-Type", "application/json")
                .body(requestBody)
                .retrieve()
                .toEntity(BizTalkTokenResponse.class)
                .getBody();
        if (result == null || result.getToken() == null || result.getExpireDate() == null) {
            return;
        }
        String expireDateStr = result.getExpireDate();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
        LocalDateTime parse = LocalDateTime.parse(expireDateStr, formatter);
        
        BgmAgitBiztalkToken bgmAgitBiztalkToken = new BgmAgitBiztalkToken(result.getToken(), parse);
        biztalkTokenRepository.save(bgmAgitBiztalkToken);
    }
    
   
}
