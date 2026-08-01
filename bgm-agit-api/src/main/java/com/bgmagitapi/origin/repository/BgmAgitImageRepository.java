package com.bgmagitapi.origin.repository;

import com.bgmagitapi.origin.entity.BgmAgitImage;
import com.bgmagitapi.origin.repository.custom.BgmAgitImageCustomRepository;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BgmAgitImageRepository extends JpaRepository<BgmAgitImage, Long>, BgmAgitImageCustomRepository {
}
