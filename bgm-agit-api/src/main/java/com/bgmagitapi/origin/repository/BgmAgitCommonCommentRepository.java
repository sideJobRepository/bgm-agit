package com.bgmagitapi.origin.repository;

import com.bgmagitapi.origin.entity.BgmAgitCommonComment;
import com.bgmagitapi.origin.repository.custom.BgmAgitCommonCommentCustomRepository;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BgmAgitCommonCommentRepository extends JpaRepository<BgmAgitCommonComment, Long> , BgmAgitCommonCommentCustomRepository {
}
