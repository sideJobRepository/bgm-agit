package com.bgmagitapi.service.impl;

import com.bgmagitapi.security.role.BgmAgitUrlRoleMapping;
import com.bgmagitapi.service.BgmAgitDynamicAuthorizationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;



@Service
@Transactional
@RequiredArgsConstructor
public class BgmAgitDynamicAuthorizationServiceImpl implements BgmAgitDynamicAuthorizationService {
    
    
    private final BgmAgitUrlRoleMapping bgmAgitUrlRoleMapping;
    
    
    @Override
    public Map<String, String> getUrlRoleMappings() {
        return bgmAgitUrlRoleMapping.getRoleMappings();
    }
}
