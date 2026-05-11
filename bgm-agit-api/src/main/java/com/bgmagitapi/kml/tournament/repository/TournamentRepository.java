package com.bgmagitapi.kml.tournament.repository;

import com.bgmagitapi.kml.tournament.entity.Tournament;
import com.bgmagitapi.kml.tournament.enums.TournamentProgressStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TournamentRepository extends JpaRepository<Tournament, Long> {

    Optional<Tournament> findFirstByProgressStatus(TournamentProgressStatus progressStatus);

    boolean existsByProgressStatus(TournamentProgressStatus progressStatus);

    List<Tournament> findAllByProgressStatus(TournamentProgressStatus progressStatus);

    List<Tournament> findAllByProgressStatusOrderByEndDateDescIdDesc(TournamentProgressStatus progressStatus);

    List<Tournament> findAllByOrderByStartDateDescIdDesc();
}
