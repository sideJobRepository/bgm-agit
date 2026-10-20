package com.bgmagitapi.origin.security.role;

import com.bgmagitapi.origin.security.role.response.RoleMapResponse;
import com.querydsl.core.types.Projections;
import com.querydsl.jpa.impl.JPAQueryFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import static com.bgmagitapi.origin.entity.QBgmAgitRole.bgmAgitRole;
import static com.bgmagitapi.origin.entity.QBgmAgitUrlResources.bgmAgitUrlResources;
import static com.bgmagitapi.origin.entity.QBgmAgitUrlResourcesRole.bgmAgitUrlResourcesRole;



@Service
@Transactional(readOnly = true)
public class BgmAgitUrlRoleMapping {
    
    private LinkedHashMap<String, String> urlRoleMappings = new LinkedHashMap<>();
    private final JPAQueryFactory queryFactory;
    
    public BgmAgitUrlRoleMapping(JPAQueryFactory queryFactory) {
        this.queryFactory = queryFactory;
    }
    
    public Map<String,String> getRoleMappings() {
        urlRoleMappings.clear();
        
        List<RoleMapResponse> resourcesList = queryFactory
                .select(Projections.constructor(
                        RoleMapResponse.class,
                        bgmAgitUrlResources.bgmAgitUrlResourcesPath,
                        bgmAgitRole.bgmAgitRoleName,
                        bgmAgitUrlResources.bgmAgitUrlHttpMethod
                ))
                .from(bgmAgitUrlResourcesRole)
                .join(bgmAgitUrlResourcesRole.bgmAgitUrlResources, bgmAgitUrlResources)
                .join(bgmAgitUrlResourcesRole.bgmAgitRole, bgmAgitRole)
                .fetch();
        
        // 한 주소에 역할이 여러 개 걸려 있으면 쉼표로 이어 붙인다(BgmAgitAuthorizationManager 가 hasAnyAuthority 로 나눠 쓴다).
        // 예전엔 put 으로 덮어써서 마지막 역할 하나만 남았다 — PUT /reservation/people(관리자·회원·멘토)이 회원에게 403 이 났다
        resourcesList
                .forEach(resources -> {
                    String key = resources.getHttpMethod().toUpperCase() + " " + resources.getBgmAgitUrlResourcesPath(); // "POST /bgm-agit/notice"
                    urlRoleMappings.merge(key, "ROLE_" + resources.getBgmAgitRoleName(), (a, b) -> a + "," + b);
                });
        return urlRoleMappings;
        
    }
}
