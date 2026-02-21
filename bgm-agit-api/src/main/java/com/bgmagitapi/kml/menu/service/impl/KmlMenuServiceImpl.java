package com.bgmagitapi.kml.menu.service.impl;

import com.bgmagitapi.kml.menu.dto.response.KmlMenuGetResponse;
import com.bgmagitapi.kml.menu.entity.KmlMenu;
import com.bgmagitapi.kml.menu.repository.KmlMenuRepository;
import com.bgmagitapi.kml.menu.service.KmlMenuService;
import com.bgmagitapi.kml.menurole.repository.KmlMenuRoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.hierarchicalroles.RoleHierarchyImpl;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class KmlMenuServiceImpl implements KmlMenuService {
    
    
    private final KmlMenuRepository kmlMenuRepository;
    private final KmlMenuRoleRepository kmlMenuRoleRepository;
    private final RoleHierarchyImpl roleHierarchy;
    
    @Override
    @Transactional(readOnly = true)
    public List<KmlMenuGetResponse> findByKmlMenu() {
        Authentication authentication = SecurityContextHolder.getContextHolderStrategy().getContext().getAuthentication();
        
        Collection<? extends GrantedAuthority> authorities;
        
        if (authentication == null || !authentication.isAuthenticated() || authentication instanceof AnonymousAuthenticationToken) {
            authorities = List.of(new SimpleGrantedAuthority("ROLE_ANONYMOUS"));
        } else {
            authorities = authentication.getAuthorities();
        }
        // 1. 계층 권한 포함 ROLE 이름 추출
        List<String> expandedRoleNames = roleHierarchy.getReachableGrantedAuthorities(authorities)
                   .stream()
                   .map(GrantedAuthority::getAuthority)
                   .map(role -> role.replace("ROLE_", ""))
                   .toList();
     
        
        // 2. 권한으로 접근 가능한 메뉴 ID 조회
        Set<Long> menuIdSet = new HashSet<>(kmlMenuRoleRepository.findMenuIdByRoleNames(expandedRoleNames));
        
        if (menuIdSet.isEmpty()) {
            return List.of();
        }
        
        // 3. 전체 메뉴 조회
        List<KmlMenu> allMenus = kmlMenuRepository.findAllMenuOrders();
        
        // 4. DTO 맵 구성
        Map<Long, KmlMenuGetResponse> dtoMap = new HashMap<>();
        List<KmlMenuGetResponse> roots = new ArrayList<>();
        
        for (KmlMenu menu : allMenus) {
            if (!menuIdSet.contains(menu.getId())){
                continue;
            }
        
            Long parentId = menu.getParentMenuId() != null
                            ? menu.getParentMenuId().getId()
                            : null;
        
            KmlMenuGetResponse dto = KmlMenuGetResponse.builder()
                    .id(menu.getId())
                    .menuName(menu.getMenuName())
                    .menuLink(menu.getMenuLink())
                    .menuOrders(menu.getOrders())
                    .icon(menu.getIcon())
                    .parentMenuId(parentId)
                    .subMenus(new ArrayList<>())
                    .build();
        
            dtoMap.put(menu.getId(), dto);
        }
        
        // 5. 부모-자식 관계 구성
        for (KmlMenu menu : allMenus) {
            if (!menuIdSet.contains(menu.getId())) continue;
        
            KmlMenuGetResponse current = dtoMap.get(menu.getId());
            Long parentId = current.getParentMenuId();
        
            if (parentId == null || !dtoMap.containsKey(parentId)) {
                roots.add(current);
            } else {
                dtoMap.get(parentId).getSubMenus().add(current);
            }
        }
        
        // 6. 루트 메뉴 반환 (필터 제거 권장)
        return roots;
       
    }
}
