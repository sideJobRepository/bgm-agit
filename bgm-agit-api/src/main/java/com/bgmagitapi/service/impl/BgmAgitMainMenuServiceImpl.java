package com.bgmagitapi.service.impl;

import com.bgmagitapi.controller.response.BgmAgitMainMenuImageResponse;
import com.bgmagitapi.controller.response.BgmAgitMainMenuResponse;
import com.bgmagitapi.entity.BgmAgitMainMenu;
import com.bgmagitapi.repository.BgmAgitImageRepository;
import com.bgmagitapi.repository.BgmAgitMainMenuRepository;
import com.bgmagitapi.repository.BgmAgitMenuRoleRepository;
import com.bgmagitapi.service.BgmAgitMainMenuService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.hierarchicalroles.RoleHierarchyImpl;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class BgmAgitMainMenuServiceImpl implements BgmAgitMainMenuService {
    
    private final BgmAgitMainMenuRepository bgmAgitMainMenuRepository;
    
    private final BgmAgitMenuRoleRepository bgmAgitMenuRoleRepository;
    
    private final BgmAgitImageRepository bgmAgitImageRepository;
    
    private final RoleHierarchyImpl roleHierarchy;
    
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
        List<Long> menuIds = bgmAgitMenuRoleRepository.findMenuIdByRoleNames(expandedRoleNames);
        
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
        
        return roots.stream()
                .filter(root -> root.getSubMenus() != null && !root.getSubMenus().isEmpty())
                .map(root -> {
                    BgmAgitMainMenuResponse copy = new BgmAgitMainMenuResponse();
                    copy.setBgmAgitMainMenuId(root.getBgmAgitMainMenuId());
                    copy.setName(root.getName());
                    copy.setBgmAgitSubMenuId(root.getBgmAgitSubMenuId());
                    copy.setBgmAgitAreaId(root.getBgmAgitAreaId());
                    copy.setLink(root.getLink());
                    
                    // 하위 메뉴 복사
                    List<BgmAgitMainMenuResponse> copiedChildren = root.getSubMenus().stream()
                            .map(child -> {
                                BgmAgitMainMenuResponse childCopy = new BgmAgitMainMenuResponse();
                                childCopy.setBgmAgitMainMenuId(child.getBgmAgitMainMenuId());
                                childCopy.setName(child.getName());
                                childCopy.setBgmAgitSubMenuId(child.getBgmAgitSubMenuId());
                                childCopy.setBgmAgitAreaId(child.getBgmAgitAreaId());
                                childCopy.setLink(child.getLink());
                                return childCopy;
                            })
                            .toList();
                    
                    copy.setSubMenu(copiedChildren);
                    return copy;
                })
                .toList();
        
    }
    
    @Override
    @Transactional(readOnly = true)
    public Map<Long, List<BgmAgitMainMenuImageResponse>> getMainMenuImage(Long labelGb, String link) {
        
        List<BgmAgitMainMenuImageResponse> result = bgmAgitImageRepository.getMainMenuImage(labelGb, link);
        
        return result.stream()
                .collect(Collectors.groupingBy(BgmAgitMainMenuImageResponse::getLabelGb));
    }
}
