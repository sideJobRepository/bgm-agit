package com.bgmagitapi.repository;

import com.bgmagitapi.entity.BgmAgitCommonComment;
import com.bgmagitapi.repository.custom.BgmAgitCommonCommentCustomRepository;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BgmAgitCommonCommentRepository extends JpaRepository<BgmAgitCommonComment, Long> , BgmAgitCommonCommentCustomRepository {
}
