package com.bgmagitapi.kml.rule.service.impl;


import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.config.S3FileUtils;
import com.bgmagitapi.config.UploadResult;
import com.bgmagitapi.entity.BgmAgitCommonFile;
import com.bgmagitapi.entity.enumeration.BgmAgitCommonType;
import com.bgmagitapi.kml.rule.dto.request.RulePostRequest;
import com.bgmagitapi.kml.rule.dto.response.RuleGetResponse;
import com.bgmagitapi.kml.rule.entity.Rule;
import com.bgmagitapi.kml.rule.repository.RuleRepository;
import com.bgmagitapi.kml.rule.service.RuleService;
import com.bgmagitapi.repository.BgmAgitCommonFileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class RuleServiceImpl implements RuleService {
    
    private final RuleRepository ruleRepository;
    private final BgmAgitCommonFileRepository commonFileRepository;
    private final S3FileUtils s3FileUtils;
    
    @Override
    public List<RuleGetResponse> getRules() {
        List<BgmAgitCommonFile> file = ruleRepository.getRuleFiles();
        List<RuleGetResponse> result = ruleRepository.findAll()
                .stream()
                .map(item -> {
                    return RuleGetResponse
                            .builder()
                            .id(item.getId())
                            .title(item.getTitle())
                            .build();
                }).collect(Collectors.toList());
        
        Map<Long, List<RuleGetResponse.RuleFileResponse>> ruleFiles = file.stream()
                .collect(Collectors.groupingBy(
                        BgmAgitCommonFile::getBgmAgitCommonFileTargetId,
                        Collectors.mapping(
                                item -> RuleGetResponse.RuleFileResponse.builder()
                                        .fileName(item.getBgmAgitCommonFileName())
                                        .fileUrl(item.getBgmAgitCommonFileUrl())
                                        .fileFolder("rule")
                                        .build(),
                                Collectors.toList()
                        )
                ));
        
        for (RuleGetResponse ruleGetResponse : result) {
            List<RuleGetResponse.RuleFileResponse> ruleFileResponses = ruleFiles.get(ruleGetResponse.getId());
            
            if (ruleFileResponses != null && !ruleFileResponses.isEmpty()) {
                ruleGetResponse.setFile(ruleFileResponses.get(0));
            }
        }
        return result;
    }
    
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
        return new ApiResponse(200, true, "저장 되었습니다.");
    }
}
