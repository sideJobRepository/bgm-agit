package com.bgmagitapi.security.role;


import com.bgmagitapi.service.BgmAgitRoleHierarchyService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.access.hierarchicalroles.RoleHierarchyImpl;

@Configuration
public class RoleConfig {

    
    @Bean
    public RoleHierarchyImpl roleHierarchy(BgmAgitRoleHierarchyService bgmAgitRoleHierarchyService) {
        return RoleHierarchyImpl.fromHierarchy(bgmAgitRoleHierarchyService.findAllHierarchy());
    }
}
