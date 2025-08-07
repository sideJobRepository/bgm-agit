package com.bgmagitapi.service.impl;

import com.bgmagitapi.controller.response.BgmAgitMainMenuImageResponse;
import com.bgmagitapi.controller.response.BgmAgitMainMenuResponse;
import com.bgmagitapi.entity.BgmAgitMainMenu;
import com.bgmagitapi.repository.BgmAgitMainMenuRepository;
import com.bgmagitapi.repository.BgmAgitMenuRoleRepository;
import com.bgmagitapi.service.BgmAgitMainMenuService;
import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.types.Projections;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.hierarchicalroles.RoleHierarchy;
import org.springframework.security.access.hierarchicalroles.RoleHierarchyImpl;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.*;
import java.util.stream.Collectors;

import static com.bgmagitapi.entity.QBgmAgitImage.bgmAgitImage;
import static com.bgmagitapi.entity.QBgmAgitMainMenu.bgmAgitMainMenu;

@Service
@Transactional
@RequiredArgsConstructor
public class BgmAgitMainMenuServiceImpl implements BgmAgitMainMenuService {
    
    private final BgmAgitMainMenuRepository bgmAgitMainMenuRepository;
    
    private final BgmAgitMenuRoleRepository bgmAgitMenuRoleRepository;
    
    private final RoleHierarchyImpl roleHierarchy;
    
    private final JPAQueryFactory queryFactory;
    
    @Override
    @Transactional(readOnly = true)
    public List<BgmAgitMainMenuResponse> getMainMenu() {
        // 1. 현재 인증된 사용자
        Authentication authentication = SecurityContextHolder.getContextHolderStrategy().getContext().getAuthentication();
        
        // 2. 계층 권한 포함 모든 역할 가져오기
        List<String> expandedRoleNames = roleHierarchy.getReachableGrantedAuthorities(authentication.getAuthorities())
                .stream()
                .map(GrantedAuthority::getAuthority)
                .map(role -> role.replace("ROLE_", ""))
                .toList();
        
        // 3. 해당 권한으로 접근 가능한 메뉴 ID 조회
        List<Long> menuIds = bgmAgitMenuRoleRepository.findMenuIdsByRoleNames(expandedRoleNames);
        
        // 4. 전체 메뉴 조회 (권한 있는 메뉴만 필터링할 경우 이 시점에 filter 가능)
        List<BgmAgitMainMenu> allMenus = bgmAgitMainMenuRepository.findAll();
        
        // 5. Response 변환 + Map 구성
        Map<Long, BgmAgitMainMenuResponse> responseMap = new HashMap<>();
        List<BgmAgitMainMenuResponse> roots = new ArrayList<>();
        
        for (BgmAgitMainMenu mainMenu : allMenus) {
            if (!menuIds.contains(mainMenu.getBgmAgitMainMenuId())){
                continue; // 권한 없는 메뉴는 제외
            }
            BgmAgitMainMenuResponse response = new BgmAgitMainMenuResponse();
            response.setBgmAgitMainMenuId(mainMenu.getBgmAgitMainMenuId());
            response.setName(mainMenu.getBgmAgitMenuName());
            response.setBgmAgitSubMenuId(mainMenu.getParentMenuId());
            response.setBgmAgitAreaId(mainMenu.getBgmAgitAreaId());
            response.setLink(mainMenu.getBgmAgitMenuLink());
            responseMap.put(mainMenu.getBgmAgitMainMenuId(), response);
        }
        
        // 6. 상하위 메뉴 관계 구성
        for (BgmAgitMainMenu menu : allMenus) {
            if (!menuIds.contains(menu.getBgmAgitMainMenuId())) continue;
            
            Long parentId = menu.getParentMenuId();
            BgmAgitMainMenuResponse currentDto = responseMap.get(menu.getBgmAgitMainMenuId());
            
            if (parentId == null || !menuIds.contains(parentId)) {
                roots.add(currentDto);
            } else {
                BgmAgitMainMenuResponse parentDto = responseMap.get(parentId);
                if (parentDto != null) {
                    parentDto.getSubMenus().add(currentDto);
                }
            }
        }
        
        return roots;
    }
    
    @Override
    @Transactional(readOnly = true)
    public Map<Long, List<BgmAgitMainMenuImageResponse>> getMainMenuImage(Long labelGb, String link) {
        BooleanBuilder booleanBuilder = getBooleanBuilder(labelGb, link);
        
        List<BgmAgitMainMenuImageResponse> allList = queryFactory
                .select(Projections.constructor(
                        BgmAgitMainMenuImageResponse.class,
                        bgmAgitImage.bgmAgitImageId,
                        bgmAgitImage.bgmAgitMainMenu.bgmAgitMainMenuId,
                        bgmAgitImage.bgmAgitImageUrl,
                        bgmAgitImage.bgmAgitImageLabel,
                        bgmAgitImage.bgmAgitImageGroups,
                        bgmAgitImage.bgmAgitMenuLink,
                        bgmAgitImage.bgmAgitImageCategory.stringValue()
                ))
                .from(bgmAgitImage)
                .join(bgmAgitImage.bgmAgitMainMenu, bgmAgitMainMenu)
                .where(booleanBuilder)
                .fetch();
        
        return allList.stream()
                .collect(Collectors.groupingBy(BgmAgitMainMenuImageResponse::getLabelGb));
    }
    
    private BooleanBuilder getBooleanBuilder(Long labelGb, String link) {
        BooleanBuilder booleanBuilder = new BooleanBuilder();
        
        if (labelGb != null) {
            booleanBuilder.and(bgmAgitImage.bgmAgitMainMenu.bgmAgitMainMenuId.eq(labelGb));
        }
        if (StringUtils.hasText(link)) {
            booleanBuilder.and(bgmAgitImage.bgmAgitMenuLink.eq(link));
        }
        return booleanBuilder;
    }
    
    public List<String> getRoleNamesFromAuthentication(Authentication authentication) {
        Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();
        
        // 계층 적용
        Collection<? extends GrantedAuthority> reachableAuthorities =
                roleHierarchy.getReachableGrantedAuthorities(authorities);
        
        // ROLE_ 접두어 제거
        return reachableAuthorities.stream()
                .map(GrantedAuthority::getAuthority)
                .map(role -> role.replace("ROLE_", ""))
                .distinct()
                .toList();
    }
}
