package com.bgmagitapi.kml.sanbaeman.repository;

import com.bgmagitapi.kml.sanbaeman.entity.Sanbaeman;
import com.bgmagitapi.kml.sanbaeman.repository.query.SanbaemanQueryRepository;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SanbaemanRepository extends JpaRepository<Sanbaeman, Long>, SanbaemanQueryRepository {


}
