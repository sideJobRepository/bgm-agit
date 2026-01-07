package com.bgmagitapi.academy.repository;

import com.bgmagitapi.academy.entity.Inputs;
import com.bgmagitapi.academy.repository.query.InputsQueryRepository;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InputsRepository extends JpaRepository<Inputs, Long> , InputsQueryRepository {
}
