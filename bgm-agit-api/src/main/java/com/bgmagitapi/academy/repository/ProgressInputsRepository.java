package com.bgmagitapi.academy.repository;

import com.bgmagitapi.academy.entity.ProgressInputs;
import com.bgmagitapi.academy.repository.query.ProgressInputsQueryRepository;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProgressInputsRepository extends JpaRepository<ProgressInputs, Long>, ProgressInputsQueryRepository {
}
