package com.bgmagitapi.kml.menu.service.impl;

import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.controller.response.BgmAgitRoleOptionResponse;
import com.bgmagitapi.entity.BgmAgitRole;
import com.bgmagitapi.kml.menu.dto.request.KmlMenuPostRequest;
import com.bgmagitapi.kml.menu.dto.response.KmlMenuCreateOptionsResponse;
import com.bgmagitapi.kml.menu.dto.response.KmlMenuGetResponse;
import com.bgmagitapi.kml.menu.dto.response.KmlMenuOptionResponse;
import com.bgmagitapi.kml.menu.entity.KmlMenu;
import com.bgmagitapi.kml.menu.repository.KmlMenuRepository;
import com.bgmagitapi.kml.menu.service.KmlMenuService;
import com.bgmagitapi.kml.menurole.entity.KmlMenuRole;
import com.bgmagitapi.kml.menurole.repository.KmlMenuRoleRepository;
import com.bgmagitapi.repository.BgmAgitRoleRepository;
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

@Service
@RequiredArgsConstructor
@Transactional
public class KmlMenuServiceImpl implements KmlMenuService {
    
    
    private final KmlMenuRepository kmlMenuRepository;
    private final KmlMenuRoleRepository kmlMenuRoleRepository;
    private final BgmAgitRoleRepository bgmAgitRoleRepository;
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

    @Override
    @Transactional(readOnly = true)
    public KmlMenuCreateOptionsResponse getMenuCreateOptions() {
        List<KmlMenuOptionResponse> menus = kmlMenuRepository.findAllMenuOrders()
                .stream()
                .map(menu -> KmlMenuOptionResponse.from(
                        menu,
                        kmlMenuRoleRepository.findByMenu_Id(menu.getId())
                                .stream()
                                .map(menuRole -> menuRole.getRole().getBgmAgitRoleId())
                                .toList()
                ))
                .toList();

        List<BgmAgitRoleOptionResponse> roles = bgmAgitRoleRepository.findAll()
                .stream()
                .sorted(Comparator.comparing(BgmAgitRole::getBgmAgitRoleId))
                .map(BgmAgitRoleOptionResponse::from)
                .toList();

        return KmlMenuCreateOptionsResponse.builder()
                .menus(menus)
                .roles(roles)
                .build();
    }

    @Override
    public ApiResponse createMenu(KmlMenuPostRequest request) {
        String menuLink = normalizeLink(request.getMenuLink());

        if (menuLink != null && kmlMenuRepository.existsByMenuLink(menuLink)) {
            return new ApiResponse(200, true, "이미 등록된 메뉴 링크입니다.");
        }

        KmlMenu parentMenu = null;
        if (request.getParentMenuId() != null) {
            parentMenu = kmlMenuRepository.findById(request.getParentMenuId())
                    .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 상위 메뉴입니다."));
        }

        KmlMenu menu = kmlMenuRepository.save(KmlMenu.builder()
                .parentMenuId(parentMenu)
                .menuName(request.getMenuName().trim())
                .menuLink(menuLink)
                .orders(request.getMenuOrders())
                .icon(normalizeIcon(request.getIcon()))
                .build());

        List<BgmAgitRole> roles = bgmAgitRoleRepository.findAllById(request.getRoleIds());
        long distinctRoleCount = request.getRoleIds().stream().distinct().count();
        if (roles.size() != distinctRoleCount) {
            throw new IllegalArgumentException("존재하지 않는 권한이 포함되어 있습니다.");
        }

        roles.forEach(role -> kmlMenuRoleRepository.save(KmlMenuRole.builder()
                .menu(menu)
                .role(role)
                .build()));

        return new ApiResponse(200, true, "메뉴가 저장되었습니다.");
    }

    @Override
    public ApiResponse updateMenu(Long menuId, KmlMenuPostRequest request) {
        KmlMenu menu = kmlMenuRepository.findById(menuId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 메뉴입니다."));

        String menuLink = normalizeLink(request.getMenuLink());
        if (menuLink != null && kmlMenuRepository.existsByMenuLinkAndIdNot(menuLink, menuId)) {
            return new ApiResponse(200, true, "이미 등록된 메뉴 링크입니다.");
        }

        KmlMenu parentMenu = null;
        if (request.getParentMenuId() != null) {
            if (request.getParentMenuId().equals(menuId)) {
                throw new IllegalArgumentException("자기 자신을 상위 메뉴로 선택할 수 없습니다.");
            }

            parentMenu = kmlMenuRepository.findById(request.getParentMenuId())
                    .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 상위 메뉴입니다."));
        }

        menu.update(
                parentMenu,
                request.getMenuName().trim(),
                menuLink,
                request.getMenuOrders(),
                normalizeIcon(request.getIcon())
        );

        List<BgmAgitRole> roles = bgmAgitRoleRepository.findAllById(request.getRoleIds());
        long distinctRoleCount = request.getRoleIds().stream().distinct().count();
        if (roles.size() != distinctRoleCount) {
            throw new IllegalArgumentException("존재하지 않는 권한이 포함되어 있습니다.");
        }

        kmlMenuRoleRepository.deleteByMenu_Id(menuId);
        roles.forEach(role -> kmlMenuRoleRepository.save(KmlMenuRole.builder()
                .menu(menu)
                .role(role)
                .build()));

        return new ApiResponse(200, true, "메뉴가 수정되었습니다.");
    }

    @Override
    public ApiResponse deleteMenu(Long menuId) {
        KmlMenu menu = kmlMenuRepository.findById(menuId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 메뉴입니다."));

        if (kmlMenuRepository.existsByParentMenuId_Id(menuId)) {
            throw new IllegalArgumentException("하위 메뉴가 있는 메뉴는 삭제할 수 없습니다.");
        }

        kmlMenuRoleRepository.deleteByMenu_Id(menu.getId());
        kmlMenuRepository.delete(menu);

        return new ApiResponse(200, true, "메뉴가 삭제되었습니다.");
    }

    private String normalizeLink(String menuLink) {
        if (menuLink == null || menuLink.isBlank() || "/".equals(menuLink.trim())) {
            return null;
        }
        String trimmed = menuLink.trim();
        return trimmed.startsWith("/") ? trimmed : "/" + trimmed;
    }

    private String normalizeIcon(String icon) {
        if (icon == null || icon.isBlank()) {
            return "Gear";
        }
        return icon.trim();
    }
}
