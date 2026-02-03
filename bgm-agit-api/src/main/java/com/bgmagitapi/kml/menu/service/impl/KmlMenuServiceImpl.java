package com.bgmagitapi.kml.menu.service.impl;

import com.bgmagitapi.kml.menu.dto.response.KmlMenuGetResponse;
import com.bgmagitapi.kml.menu.entity.KmlMenu;
import com.bgmagitapi.kml.menu.repository.KmlMenuRepository;
import com.bgmagitapi.kml.menu.service.KmlMenuService;
import com.bgmagitapi.kml.menurole.repository.KmlMenuRoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.hierarchicalroles.RoleHierarchyImpl;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class KmlMenuServiceImpl implements KmlMenuService {
    
    
    private final KmlMenuRepository kmlMenuRepository;
    private final KmlMenuRoleRepository kmlMenuRoleRepository;
    private final RoleHierarchyImpl roleHierarchy;
    
    @Override
    public List<KmlMenuGetResponse> findByKmlMenu() {
        Authentication authentication = SecurityContextHolder.getContextHolderStrategy().getContext().getAuthentication();
        
        List<String> expandedRoleNames = roleHierarchy.getReachableGrantedAuthorities(authentication.getAuthorities())
                .stream()
                .map(GrantedAuthority::getAuthority)
                .map(role -> role.replace("ROLE_", ""))
                .toList();
        List<Long> menuIds = kmlMenuRoleRepository.findMenuIdByRoleNames(expandedRoleNames);
        
        List<KmlMenu> allMenus = kmlMenuRepository.findAll();
        return allMenus.stream()
                .filter(menu -> menuIds.contains(menu.getId())) // 권한 있는 메뉴만
                .map(menu ->
                        KmlMenuGetResponse.builder()
                                .id(menu.getId())
                                .menuName(menu.getMenuName())
                                .menuLink(menu.getMenuLink())
                                .menuOrders(menu.getOrders())
                                .icon(menu.getIcon())
                                .build()
                )
                .toList();
    }
}
