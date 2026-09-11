package com.bgmagitapi.origin.repository.impl;

import com.bgmagitapi.origin.controller.response.BgmAgitMainMenuImageResponse;
import com.bgmagitapi.origin.entity.BgmAgitImage;
import com.bgmagitapi.origin.entity.enumeration.BgmAgitImageCategory;
import com.bgmagitapi.origin.repository.custom.BgmAgitImageCustomRepository;
import com.querydsl.core.types.Projections;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.jpa.impl.JPAQuery;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.support.PageableExecutionUtils;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Objects;

import static com.bgmagitapi.origin.entity.QBgmAgitImage.bgmAgitImage;
import static com.bgmagitapi.origin.entity.QBgmAgitMainMenu.bgmAgitMainMenu;

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
                .where(mainMenuIdEq(labelGb), menuLinkEq(link), notHidden())
                .fetch();
    }
    
    @Override
    public Page<BgmAgitMainMenuImageResponse> getDetailImage(Long labelGb, String link, Pageable pageable, String category, String name) {
        
        boolean isGame = Objects.equals(labelGb,2L);
        
        List<BgmAgitMainMenuImageResponse> content = queryFactory
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
                .where(mainMenuIdEq(labelGb),
                        menuLinkEq(link),
                        labelLike(name),
                        notHidden(),
                        isGame ? categoryEq(category) : null)
                .offset(pageable.getOffset())
                .limit(pageable.getPageSize())
                .fetch();
        
        
        JPAQuery<Long> countQuery = queryFactory
                .select(bgmAgitImage.count())
                .from(bgmAgitImage)
                .join(bgmAgitImage.bgmAgitMainMenu, bgmAgitMainMenu)
                .where(mainMenuIdEq(labelGb),
                        menuLinkEq(link),
                        labelLike(name),
                        notHidden(),
                        isGame ? categoryEq(category) : null);
        
        return PageableExecutionUtils.getPage(content, pageable, countQuery::fetchOne);
    }
    
    @Override
    public List<BgmAgitImage> findReservableImages(Long labelGb, String link) {
        // 필터는 getMainMenuImage 와 반드시 같아야 한다. 프론트 방 카드 목록이 그쪽에서 오므로,
        // 조건이 갈리면 카드에는 있는데 가용 현황에는 없는(=배지가 안 뜨는) 방이 생긴다.
        // 슬롯 계산에 카테고리·라벨·인원이 필요해 프로젝션 대신 엔티티를 가져온다.
        return queryFactory
                .selectFrom(bgmAgitImage)
                .join(bgmAgitImage.bgmAgitMainMenu, bgmAgitMainMenu)
                .where(mainMenuIdEq(labelGb), menuLinkEq(link), notHidden())
                .orderBy(bgmAgitImage.bgmAgitImageId.asc())
                .fetch();
    }

    // 노출 여부. 컬럼이 null인 과거 행도 노출로 취급
    private BooleanExpression notHidden() {
        return bgmAgitImage.bgmAgitImageUseStatus.isNull()
                .or(bgmAgitImage.bgmAgitImageUseStatus.ne("N"));
    }

    private BooleanExpression categoryEq(String category) {
        return StringUtils.hasText(category) ? bgmAgitImage.bgmAgitImageCategory.eq(BgmAgitImageCategory.valueOf(category)) : null;
    }
    
    
    private BooleanExpression labelLike(String name) {
        return StringUtils.hasText(name) ? bgmAgitImage.bgmAgitImageLabel.like('%' + name + '%') : null;
    }
    
    private BooleanExpression mainMenuIdEq(Long labelGb) {
        return labelGb != null ? bgmAgitImage.bgmAgitMainMenu.bgmAgitMainMenuId.eq(labelGb) : null;
    }
    
    private BooleanExpression menuLinkEq(String link) {
        return StringUtils.hasText(link) ? bgmAgitImage.bgmAgitMenuLink.eq(link) : null;
    }
}
