package com.bgmagitapi.kml.rule.repository.query;

import com.bgmagitapi.entity.BgmAgitCommonFile;

import java.util.List;

public interface RuleQueryRepository {

    List<BgmAgitCommonFile> getRuleFiles();
}
