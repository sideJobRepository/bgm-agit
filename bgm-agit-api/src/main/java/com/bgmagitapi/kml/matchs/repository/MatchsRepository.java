package com.bgmagitapi.kml.matchs.repository;

import com.bgmagitapi.kml.matchs.entity.Matchs;
import com.bgmagitapi.kml.matchs.repository.query.MatchsQueryRepository;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MatchsRepository extends JpaRepository<Matchs, Long>, MatchsQueryRepository {
}
