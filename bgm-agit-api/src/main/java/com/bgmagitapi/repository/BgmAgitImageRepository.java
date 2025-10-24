package com.bgmagitapi.repository;

import com.bgmagitapi.entity.BgmAgitImage;
import com.bgmagitapi.repository.custom.BgmAgitImageCustomRepository;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BgmAgitImageRepository extends JpaRepository<BgmAgitImage, Long>, BgmAgitImageCustomRepository {
}
