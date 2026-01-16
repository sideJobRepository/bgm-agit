package com.bgmagitapi.kml.rule.repository;

import com.bgmagitapi.kml.rule.entity.Rule;
import com.bgmagitapi.kml.rule.repository.query.RuleQueryRepository;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RuleRepository extends JpaRepository<Rule, Long> , RuleQueryRepository {


}
