package com.bgmagitapi.origin.repository.impl;

import com.bgmagitapi.origin.entity.BgmAgitCommonComment;
import com.bgmagitapi.origin.entity.QBgmAgitCommonComment;
import com.bgmagitapi.origin.entity.enumeration.BgmAgitCommonType;
import com.bgmagitapi.origin.repository.custom.BgmAgitCommonCommentCustomRepository;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;

import java.util.List;

import static com.bgmagitapi.origin.entity.QBgmAgitCommonComment.*;

@RequiredArgsConstructor
public class BgmAgitCommonCommentRepositoryImpl implements BgmAgitCommonCommentCustomRepository {

    private final JPAQueryFactory queryFactory;
    
    @Override
    public Long deleteByCommonDepth(Long id) {
        
        List<Long> commentIds = queryFactory
            .select(bgmAgitCommonComment.id)
            .from(bgmAgitCommonComment)
            .where(
                bgmAgitCommonComment.targetId.eq(id),
                bgmAgitCommonComment.bgmAgitCommonType.eq(BgmAgitCommonType.FREE)
            )
            .orderBy(bgmAgitCommonComment.depth.desc()) // 깊은 댓글 먼저
            .fetch();
        
        for (Long commentId : commentIds) {
            queryFactory
                .delete(bgmAgitCommonComment)
                .where(bgmAgitCommonComment.id.eq(commentId))
                .execute();
        }
        return (long) commentIds.size();
    }
}
