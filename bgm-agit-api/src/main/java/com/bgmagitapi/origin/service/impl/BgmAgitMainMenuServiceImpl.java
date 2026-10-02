package com.bgmagitapi.origin.service.impl;

import com.bgmagitapi.origin.apiresponse.ApiResponse;
import com.bgmagitapi.origin.controller.request.BgmAgitMainMenuPostRequest;
import com.bgmagitapi.origin.controller.response.BgmAgitMainMenuCreateOptionsResponse;
import com.bgmagitapi.origin.controller.response.BgmAgitMainMenuImageResponse;
import com.bgmagitapi.origin.controller.response.BgmAgitMainMenuOptionResponse;
import com.bgmagitapi.origin.controller.response.BgmAgitMainMenuResponse;
import com.bgmagitapi.origin.controller.response.BgmAgitRoleOptionResponse;
import com.bgmagitapi.origin.entity.BgmAgitMainMenu;
import com.bgmagitapi.origin.entity.BgmAgitMenuRole;
import com.bgmagitapi.origin.entity.BgmAgitRole;
import com.bgmagitapi.origin.page.PageMeta;
import com.bgmagitapi.origin.repository.BgmAgitImageRepository;
import com.bgmagitapi.origin.repository.BgmAgitMainMenuRepository;
import com.bgmagitapi.origin.repository.BgmAgitMenuRoleRepository;
import com.bgmagitapi.origin.repository.BgmAgitRoleRepository;
import com.bgmagitapi.origin.service.BgmAgitMainMenuService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.hierarchicalroles.RoleHierarchyImpl;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class BgmAgitMainMenuServiceImpl implements BgmAgitMainMenuService {
    
    private final BgmAgitMainMenuRepository bgmAgitMainMenuRepository;
    
    private final BgmAgitMenuRoleRepository bgmAgitMenuRoleRepository;

    private final BgmAgitImageRepository bgmAgitImageRepository;

    private final BgmAgitRoleRepository bgmAgitRoleRepository;

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
        List<BgmAgitMainMenu> allMenus = bgmAgitMainMenuRepository.findByBgmAgitUseStatusTrue();
        
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
                .sorted(Comparator.comparing(BgmAgitMainMenuResponse::getBgmAgitAreaId))
                .map(root -> {
                    BgmAgitMainMenuResponse copy = new BgmAgitMainMenuResponse();
                    copy.setBgmAgitMainMenuId(root.getBgmAgitMainMenuId());
                    copy.setName(root.getName());
                    copy.setBgmAgitSubMenuId(root.getBgmAgitSubMenuId());
                    copy.setBgmAgitAreaId(root.getBgmAgitAreaId());
                    copy.setLink(root.getLink());
                    
                    List<BgmAgitMainMenuResponse> copiedChildren = root.getSubMenus().stream()
                            .sorted(Comparator.comparing(BgmAgitMainMenuResponse::getBgmAgitAreaId))
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

    // 미사용으로 꺼 둔 메뉴의 주소. 메뉴에서만 빠지고 주소를 치면 그대로 들어가져서 프론트가 이 목록으로 막는다.
    // getMainMenu 는 권한으로도 거르기 때문에 '꺼 둔 메뉴'와 '권한이 없는 메뉴'를 프론트가 구분할 수 없다.
    // 보통은 상위 메뉴(머더미스터리 등)만 미사용으로 꺼서 하위 메뉴는 사용 상태로 남아 있다. 상위까지 올라가며 본다.
    // 사용 중인 메뉴와 같은 주소는 빼서 켜져 있는 화면이 막히지 않게 한다
    @Override
    @Transactional(readOnly = true)
    public List<String> getClosedMenuLinks() {
        List<BgmAgitMainMenu> menus = bgmAgitMainMenuRepository.findAll();
        Map<Long, BgmAgitMainMenu> byId = menus.stream()
                .collect(Collectors.toMap(BgmAgitMainMenu::getBgmAgitMainMenuId, menu -> menu));
        Map<Boolean, Set<String>> linksByOpen = menus.stream()
                .filter(menu -> menu.getBgmAgitMenuLink() != null && menu.getBgmAgitMenuLink().startsWith("/"))
                .collect(Collectors.partitioningBy(
                        menu -> isOpen(menu, byId),
                        Collectors.mapping(BgmAgitMainMenu::getBgmAgitMenuLink, Collectors.toSet())));
        Set<String> closed = new TreeSet<>(linksByOpen.get(false));
        closed.removeAll(linksByOpen.get(true));
        return List.copyOf(closed);
    }

    private boolean isOpen(BgmAgitMainMenu menu, Map<Long, BgmAgitMainMenu> byId) {
        BgmAgitMainMenu current = menu;
        // 상위가 잘못 이어져 순환하더라도 멈추게 메뉴 수만큼만 올라간다
        for (int depth = 0; current != null && depth <= byId.size(); depth++) {
            if (!Boolean.TRUE.equals(current.getBgmAgitUseStatus())) return false;
            current = current.getParentMenuId() == null ? null : byId.get(current.getParentMenuId());
        }
        return true;
    }
    
    @Override
    @Transactional(readOnly = true)
    public Map<Long, List<BgmAgitMainMenuImageResponse>> getMainMenuImage(Long labelGb, String link) {
        
        List<BgmAgitMainMenuImageResponse> result = bgmAgitImageRepository.getMainMenuImage(labelGb, link);
        
        return result.stream()
                .collect(Collectors.groupingBy(BgmAgitMainMenuImageResponse::getLabelGb));
    }
    
    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getImagePage(Long labelGb, String link, Pageable pageable, String category, String name) {
        Page<BgmAgitMainMenuImageResponse> page =
                bgmAgitImageRepository.getDetailImage(labelGb, link, pageable, category, name);
        
        // { 1:[...], 3:[...], 4:[...] } 로 그룹핑
        Map<Long, List<BgmAgitMainMenuImageResponse>> groups =
                page.getContent().stream()
                        .collect(Collectors.groupingBy(BgmAgitMainMenuImageResponse::getLabelGb));
        
        // 평탄화: { "1":[...], "3":[...], "4":[...], "page":{...} } 이거 힘드네..
        Map<String, Object> body = new LinkedHashMap<>();
        groups.forEach((k, v) -> body.put(String.valueOf(k), v));
        body.put("page", PageMeta.from(page));

        return body;
    }

    // =========================== 관리자 메뉴 관리 ===========================

    @Override
    @Transactional(readOnly = true)
    public BgmAgitMainMenuCreateOptionsResponse getMenuCreateOptions() {
        List<BgmAgitMainMenuOptionResponse> menus = bgmAgitMainMenuRepository.findAllByOrderByBgmAgitAreaIdAsc()
                .stream()
                .map(menu -> BgmAgitMainMenuOptionResponse.from(
                        menu,
                        bgmAgitMenuRoleRepository.findByBgmAgitMainMenu_BgmAgitMainMenuId(menu.getBgmAgitMainMenuId())
                                .stream()
                                .map(menuRole -> menuRole.getBgmAgitRole().getBgmAgitRoleId())
                                .toList()
                ))
                .toList();

        List<BgmAgitRoleOptionResponse> roles = bgmAgitRoleRepository.findAll()
                .stream()
                .sorted(Comparator.comparing(BgmAgitRole::getBgmAgitRoleId))
                .map(BgmAgitRoleOptionResponse::from)
                .toList();

        return BgmAgitMainMenuCreateOptionsResponse.builder()
                .menus(menus)
                .roles(roles)
                .build();
    }

    @Override
    public ApiResponse createMenu(BgmAgitMainMenuPostRequest request) {
        String menuLink = normalizeLink(request.getMenuLink());
        if (menuLink != null && bgmAgitMainMenuRepository.existsByBgmAgitMenuLink(menuLink)) {
            return new ApiResponse(200, true, "이미 등록된 메뉴 링크입니다.");
        }

        BgmAgitMainMenu parentMenu = resolveParent(request.getParentMenuId(), null);

        BgmAgitMainMenu menu = bgmAgitMainMenuRepository.save(new BgmAgitMainMenu(
                parentMenu,
                request.getMenuName().trim(),
                menuLink,
                request.getAreaId(),
                request.getUseStatus() == null ? Boolean.TRUE : request.getUseStatus()
        ));

        saveRoles(menu, request.getRoleIds());
        return new ApiResponse(200, true, "메뉴가 저장되었습니다.");
    }

    @Override
    public ApiResponse updateMenu(Long menuId, BgmAgitMainMenuPostRequest request) {
        BgmAgitMainMenu menu = bgmAgitMainMenuRepository.findById(menuId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 메뉴입니다."));

        String menuLink = normalizeLink(request.getMenuLink());
        if (menuLink != null && bgmAgitMainMenuRepository.existsByBgmAgitMenuLinkAndBgmAgitMainMenuIdNot(menuLink, menuId)) {
            return new ApiResponse(200, true, "이미 등록된 메뉴 링크입니다.");
        }

        BgmAgitMainMenu parentMenu = resolveParent(request.getParentMenuId(), menuId);

        menu.update(
                parentMenu,
                request.getMenuName().trim(),
                menuLink,
                request.getAreaId(),
                request.getUseStatus() == null ? Boolean.TRUE : request.getUseStatus()
        );

        bgmAgitMenuRoleRepository.deleteByBgmAgitMainMenu_BgmAgitMainMenuId(menuId);
        saveRoles(menu, request.getRoleIds());
        return new ApiResponse(200, true, "메뉴가 수정되었습니다.");
    }

    @Override
    public ApiResponse deleteMenu(Long menuId) {
        BgmAgitMainMenu menu = bgmAgitMainMenuRepository.findById(menuId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 메뉴입니다."));

        if (bgmAgitMainMenuRepository.existsByParentMenu_BgmAgitMainMenuId(menuId)) {
            throw new IllegalArgumentException("하위 메뉴가 있는 메뉴는 삭제할 수 없습니다.");
        }

        bgmAgitMenuRoleRepository.deleteByBgmAgitMainMenu_BgmAgitMainMenuId(menuId);
        bgmAgitMainMenuRepository.delete(menu);
        return new ApiResponse(200, true, "메뉴가 삭제되었습니다.");
    }

    private BgmAgitMainMenu resolveParent(Long parentMenuId, Long selfId) {
        if (parentMenuId == null) return null;
        if (selfId != null && parentMenuId.equals(selfId)) {
            throw new IllegalArgumentException("자기 자신을 상위 메뉴로 선택할 수 없습니다.");
        }
        return bgmAgitMainMenuRepository.findById(parentMenuId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 상위 메뉴입니다."));
    }

    private void saveRoles(BgmAgitMainMenu menu, List<Long> roleIds) {
        List<BgmAgitRole> roles = bgmAgitRoleRepository.findAllById(roleIds);
        long distinctRoleCount = roleIds.stream().distinct().count();
        if (roles.size() != distinctRoleCount) {
            throw new IllegalArgumentException("존재하지 않는 권한이 포함되어 있습니다.");
        }
        roles.forEach(role -> bgmAgitMenuRoleRepository.save(new BgmAgitMenuRole(role, menu)));
    }

    private String normalizeLink(String menuLink) {
        if (menuLink == null || menuLink.isBlank() || "/".equals(menuLink.trim())) {
            return null;
        }
        String trimmed = menuLink.trim();
        return trimmed.startsWith("/") ? trimmed : "/" + trimmed;
    }

}
