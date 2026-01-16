package com.bgmagitapi.kml.rule.service.impl;


import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.config.S3FileUtils;
import com.bgmagitapi.config.UploadResult;
import com.bgmagitapi.entity.BgmAgitCommonFile;
import com.bgmagitapi.entity.enumeration.BgmAgitCommonType;
import com.bgmagitapi.kml.rule.dto.request.RulePostRequest;
import com.bgmagitapi.kml.rule.entity.Rule;
import com.bgmagitapi.kml.rule.repository.RuleRepository;
import com.bgmagitapi.kml.rule.service.RuleService;
import com.bgmagitapi.repository.BgmAgitCommonFileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class RuleServiceImpl implements RuleService {
    
    private final RuleRepository ruleRepository;
    private final BgmAgitCommonFileRepository commonFileRepository;
    private final S3FileUtils s3FileUtils;
    
    @Override
    public ApiResponse createRule(RulePostRequest request) {
        
        String title = request.getTitle();
        Boolean tournamentStatus = request.getTournamentStatus();
        
        Rule rule = Rule
                .builder()
                .title(title)
                .tournamentStatus(tournamentStatus)
                .build();
        
        ruleRepository.save(rule);
        
        List<UploadResult> uploadResults = s3FileUtils.storeFiles(request.getFiles(), "rule");
        for (UploadResult result : uploadResults) {
            BgmAgitCommonFile commonFile = BgmAgitCommonFile
                    .builder()
                    .bgmAgitCommonFileTargetId(rule.getId())
                    .bgmAgitCommonFileName(result.getOriginalFilename())
                    .bgmAgitCommonFileUuidName(result.getUuid())
                    .bgmAgitCommonFileUrl(result.getUrl())
                    .bgmAgitCommonFileType(BgmAgitCommonType.RULE)
                    .build();
            commonFileRepository.save(commonFile);
        }
        return new ApiResponse(200,true,"저장 되었습니다.");
    }
}
