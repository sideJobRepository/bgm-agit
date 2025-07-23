package com.bgmagitapi.security.role;

import com.bgmagitapi.security.role.response.RoleMapResponse;
import com.querydsl.core.types.Projections;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import static com.bgmagitapi.entity.QBgmAgitRole.bgmAgitRole;
import static com.bgmagitapi.entity.QBgmAgitUrlResources.bgmAgitUrlResources;
import static com.bgmagitapi.entity.QBgmAgitUrlResourcesRole.bgmAgitUrlResourcesRole;



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
                        bgmAgitRole.bgmAgitRoleName
                ))
                .from(bgmAgitUrlResourcesRole)
                .join(bgmAgitUrlResourcesRole.bgmAgitUrlResources, bgmAgitUrlResources)
                .join(bgmAgitUrlResourcesRole.bgmAgitRole, bgmAgitRole)
                .fetch();
        
        resourcesList
                .forEach(resources -> {
                   String url = resources.getBgmAgitUrlResourcesPath();
                   String roleName = resources.getBgmAgitRoleName();
                    urlRoleMappings.put(url, "ROLE_" + roleName);
                });
        return urlRoleMappings;
        
    }
}
