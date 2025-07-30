package com.bgmagitapi.service.impl;

import com.bgmagitapi.controller.response.BgmAgitMainMenuImageResponse;
import com.bgmagitapi.controller.response.BgmAgitMainMenuResponse;
import com.bgmagitapi.entity.BgmAgitMainMenu;
import com.bgmagitapi.repository.BgmAgitMainMenuRepository;
import com.bgmagitapi.service.BgmAgitMainMenuService;
import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.types.Projections;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static com.bgmagitapi.entity.QBgmAgitImage.bgmAgitImage;
import static com.bgmagitapi.entity.QBgmAgitMainMenu.bgmAgitMainMenu;

@Service
@Transactional
@RequiredArgsConstructor
public class BgmAgitMainMenuServiceImpl implements BgmAgitMainMenuService {

    private final BgmAgitMainMenuRepository bgmAgitMainMenuRepository;
    
    private final JPAQueryFactory queryFactory;
    
    @Override
    @Transactional(readOnly = true)
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
    
    @Override
    @Transactional(readOnly = true)
    public Map<Long, List<BgmAgitMainMenuImageResponse>> getMainMenuImage(Long labelGb , String link) {
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
}
