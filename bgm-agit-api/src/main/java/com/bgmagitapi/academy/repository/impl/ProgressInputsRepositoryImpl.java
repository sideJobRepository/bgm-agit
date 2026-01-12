package com.bgmagitapi.academy.repository.impl;

import com.bgmagitapi.academy.entity.Inputs;
import com.bgmagitapi.academy.repository.query.ProgressInputsQueryRepository;
import com.querydsl.jpa.impl.JPAQueryFactory;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;

import static com.bgmagitapi.academy.entity.QProgressInputs.progressInputs;

@RequiredArgsConstructor
public class ProgressInputsRepositoryImpl implements ProgressInputsQueryRepository {

    private final JPAQueryFactory queryFactory;
    private final EntityManager em;
    
    @Override
    public void deleteByInputs(Inputs findInputs) {
        queryFactory
            .delete(progressInputs)
            .where(progressInputs.inputs.eq(findInputs))
            .execute();
    }
}
