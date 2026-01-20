package com.bgmagitapi.kml.rule.service.impl;


import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.config.S3FileUtils;
import com.bgmagitapi.config.UploadResult;
import com.bgmagitapi.entity.BgmAgitCommonFile;
import com.bgmagitapi.entity.enumeration.BgmAgitCommonType;
import com.bgmagitapi.kml.rule.dto.request.RulePostRequest;
import com.bgmagitapi.kml.rule.dto.request.RulePutRequest;
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
                .map(item ->
                     RuleGetResponse
                            .builder()
                            .id(item.getId())
                            .title(item.getTitle())
                            .build()
                ).collect(Collectors.toList());
        
        Map<Long, List<RuleGetResponse.RuleFileResponse>> ruleFiles = file.stream()
                .collect(Collectors.groupingBy(
                        BgmAgitCommonFile::getBgmAgitCommonFileTargetId,
                        Collectors.mapping(
                                item -> RuleGetResponse.RuleFileResponse.builder()
                                        .id(item.getBgmAgitCommonFileId())
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
        
        UploadResult result = s3FileUtils.storeFile(request.getFile(), "rule");
        
        BgmAgitCommonFile commonFile = BgmAgitCommonFile
                .builder()
                .bgmAgitCommonFileTargetId(rule.getId())
                .bgmAgitCommonFileName(result.getOriginalFilename())
                .bgmAgitCommonFileUuidName(result.getUuid())
                .bgmAgitCommonFileUrl(result.getUrl())
                .bgmAgitCommonFileType(BgmAgitCommonType.RULE)
                .build();
        commonFileRepository.save(commonFile);
        return new ApiResponse(200, true, "저장 되었습니다.");
    }
    
    @Override
    public ApiResponse modifyRule(RulePutRequest request) {
        
        Long id = request.getId();
        Rule rule = ruleRepository.findById(id).orElseThrow(() -> new RuntimeException("존재하지 않는 룰 입니다."));
        rule.modifyTitle(request.getTitle());
        
        Long deleteFileId = request.getDeleteFileId();
        
        BgmAgitCommonFile deleteFile = commonFileRepository.findById(deleteFileId).orElseThrow(() -> new RuntimeException("존재하지 않는 파일입니다."));
        s3FileUtils.deleteFile(deleteFile.getBgmAgitCommonFileUrl());
        commonFileRepository.delete(deleteFile);
        
        UploadResult result = s3FileUtils.storeFile(request.getFile(), "rule");
        
        BgmAgitCommonFile commonFile = BgmAgitCommonFile
                .builder()
                .bgmAgitCommonFileTargetId(rule.getId())
                .bgmAgitCommonFileName(result.getOriginalFilename())
                .bgmAgitCommonFileUuidName(result.getUuid())
                .bgmAgitCommonFileUrl(result.getUrl())
                .bgmAgitCommonFileType(BgmAgitCommonType.RULE)
                .build();
        commonFileRepository.save(commonFile);
        return new ApiResponse(200, true, "수정 되었습니다.");
    }
}
