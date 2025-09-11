package com.bgmagitapi.repository.impl;

import com.bgmagitapi.controller.response.BgmAgitMainMenuImageResponse;
import com.bgmagitapi.entity.enumeration.BgmAgitImageCategory;
import com.bgmagitapi.repository.BgmAgitMenuRoleRepository;
import com.bgmagitapi.repository.costom.BgmAgitImageCustomRepository;
import com.querydsl.core.types.Projections;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.jpa.impl.JPAQuery;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.support.PageableExecutionUtils;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

import static com.bgmagitapi.entity.QBgmAgitImage.bgmAgitImage;
import static com.bgmagitapi.entity.QBgmAgitMainMenu.bgmAgitMainMenu;
import static com.bgmagitapi.entity.QBgmAgitMember.bgmAgitMember;

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
                .where(mainMenuIdEq(labelGb), menuLinkEq(link))
                .fetch();
    }
    
    @Override
    public Page<BgmAgitMainMenuImageResponse> getDetailImage(Long labelGb, String link, Pageable pageable, String category, String name) {
        
        List<BgmAgitMainMenuImageResponse> list = new ArrayList<>();
        if (labelGb == 2) {
            list = queryFactory
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
                    .where(mainMenuIdEq(labelGb), menuLinkEq(link), categoryEq(category), labelLike(name))
                    .offset(pageable.getOffset())
                    .limit(pageable.getPageSize())
                    .fetch();
        } else {
            list = queryFactory
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
                    .where(mainMenuIdEq(labelGb), menuLinkEq(link), labelLike(name))
                    .offset(pageable.getOffset())
                    .limit(pageable.getPageSize())
                    .fetch();
        }
        
        if (labelGb == 2) {
            JPAQuery<Long> countQuery = queryFactory
                    .select(bgmAgitImage.count())
                    .from(bgmAgitImage)
                    .join(bgmAgitImage.bgmAgitMainMenu, bgmAgitMainMenu)
                    .where(mainMenuIdEq(labelGb), menuLinkEq(link), categoryEq(category), labelLike(name));
            return PageableExecutionUtils.getPage(list,pageable,countQuery::fetchOne);
        }else {
            JPAQuery<Long> countQuery = queryFactory
                    .select(bgmAgitImage.count())
                    .from(bgmAgitImage)
                    .join(bgmAgitImage.bgmAgitMainMenu, bgmAgitMainMenu)
                    .where(mainMenuIdEq(labelGb), menuLinkEq(link), labelLike(name));
            return PageableExecutionUtils.getPage(list,pageable,countQuery::fetchOne);
        }
    }
    
    private BooleanExpression categoryEq(String category) {
        return category != null ? bgmAgitImage.bgmAgitImageCategory.eq(BgmAgitImageCategory.valueOf(category)) : null;
    }
    
    
    private BooleanExpression labelLike(String name) {
        return name != null ? bgmAgitImage.bgmAgitImageLabel.like('%' + name + '%') : null;
    }
    
    private BooleanExpression mainMenuIdEq(Long labelGb) {
        return labelGb != null ? bgmAgitImage.bgmAgitMainMenu.bgmAgitMainMenuId.eq(labelGb) : null;
    }
    
    private BooleanExpression menuLinkEq(String link) {
        return StringUtils.hasText(link) ? bgmAgitImage.bgmAgitMenuLink.eq(link) : null;
    }
}
