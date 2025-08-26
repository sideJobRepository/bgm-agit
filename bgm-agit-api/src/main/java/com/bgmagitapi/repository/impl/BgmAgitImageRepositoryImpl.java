package com.bgmagitapi.repository.impl;

import com.bgmagitapi.controller.response.BgmAgitMainMenuImageResponse;
import com.bgmagitapi.repository.costom.BgmAgitImageCustomRepository;
import com.querydsl.core.types.Projections;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.util.StringUtils;

import java.util.List;

import static com.bgmagitapi.entity.QBgmAgitImage.bgmAgitImage;
import static com.bgmagitapi.entity.QBgmAgitMainMenu.bgmAgitMainMenu;

@RequiredArgsConstructor
public class BgmAgitImageRepositoryImpl implements BgmAgitImageCustomRepository {
    
    private final JPAQueryFactory queryFactory;
    
    @Override
    public List<BgmAgitMainMenuImageResponse> getMainMenuImage(Long labelGb, String link) {
        
        return queryFactory
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
                .where(mainMenuIdEq(labelGb),menuLinkEq(link))
                .fetch();
    }
    
    private BooleanExpression mainMenuIdEq(Long labelGb) {
        return labelGb != null ? bgmAgitImage.bgmAgitMainMenu.bgmAgitMainMenuId.eq(labelGb) : null;
    }
    
    private BooleanExpression menuLinkEq(String link) {
        return StringUtils.hasText(link) ? bgmAgitImage.bgmAgitMenuLink.eq(link) : null;
    }
}
