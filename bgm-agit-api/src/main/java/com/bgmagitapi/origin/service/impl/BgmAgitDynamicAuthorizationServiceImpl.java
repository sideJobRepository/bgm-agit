package com.bgmagitapi.origin.service.impl;

import com.bgmagitapi.origin.security.role.BgmAgitUrlRoleMapping;
import com.bgmagitapi.origin.service.BgmAgitDynamicAuthorizationService;
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
    @Transactional(readOnly = true)
    public Map<String, String> getUrlRoleMappings() {
        return bgmAgitUrlRoleMapping.getRoleMappings();
    }
}
