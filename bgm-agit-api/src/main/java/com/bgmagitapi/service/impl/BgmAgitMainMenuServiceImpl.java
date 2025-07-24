package com.bgmagitapi.service.impl;

import com.bgmagitapi.controller.response.BgmAgitMainMenuResponse;
import com.bgmagitapi.entity.BgmAgitMainMenu;
import com.bgmagitapi.repository.BgmAgitMainMenuRepository;
import com.bgmagitapi.service.BgmAgitMainMenuService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@Transactional
@RequiredArgsConstructor
public class BgmAgitMainMenuServiceImpl implements BgmAgitMainMenuService {

    private final BgmAgitMainMenuRepository bgmAgitMainMenuRepository;
    
    @Override
    public List<BgmAgitMainMenuResponse> getMainMenu() {
        
        List<BgmAgitMainMenu> allMenus = bgmAgitMainMenuRepository.findAll();
        Map<Long, BgmAgitMainMenuResponse> responseMap = new HashMap<>();
        List<BgmAgitMainMenuResponse> roots = new ArrayList<>();
        
        // BgmAgitMainMenu(Entity) -> Response + Map 으로 담기
        allMenus.forEach(mainMenu -> {
            BgmAgitMainMenuResponse response = new BgmAgitMainMenuResponse();
            response.setBgmAgitMainMenuId(mainMenu.getBgmAgitMainMenuId());
            response.setName(mainMenu.getBgmAgitMenuName());
            response.setBgmAgitSubMenuId(mainMenu.getParentMenuId());
            response.setBgmAgitAreaId(mainMenu.getBgmAgitAreaId());
            response.setLink(mainMenu.getBgmAgitMenuLink());
            responseMap.put(mainMenu.getBgmAgitMainMenuId(), response);
        });
        
        
        // 상하위 관계 연결
        allMenus.forEach(menu -> {
            Long parentId = menu.getParentMenuId();
            BgmAgitMainMenuResponse currentDto = responseMap.get(menu.getBgmAgitMainMenuId());
            
            if (parentId == null) {
                roots.add(currentDto);
            } else {
                BgmAgitMainMenuResponse parentDto = responseMap.get(parentId);
                if (parentDto != null) {
                    parentDto.getSubMenus().add(currentDto);
                }
            }
        });
        return roots;
    }
}
