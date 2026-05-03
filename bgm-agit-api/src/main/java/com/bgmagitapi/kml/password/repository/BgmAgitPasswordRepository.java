package com.bgmagitapi.kml.password.repository;

import com.bgmagitapi.kml.password.entity.BgmAgitPassword;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BgmAgitPasswordRepository extends JpaRepository<BgmAgitPassword, Long> {
}
