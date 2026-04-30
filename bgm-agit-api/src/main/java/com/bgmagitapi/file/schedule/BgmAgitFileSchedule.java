package com.bgmagitapi.file.schedule;

import com.bgmagitapi.file.service.FileBatchService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * 매일 새벽 1시(KST) TEMPORARY 1일 이상 방치 파일을 S3 + DB 에서 수거.
 */
@Component
@RequiredArgsConstructor
public class BgmAgitFileSchedule {

    private final FileBatchService fileBatchService;

    @Value("${spring.cloud.aws.s3.bucket}")
    private String bucket;

    @Scheduled(cron = "0 0 1 * * *", zone = "Asia/Seoul")
   // @Scheduled(cron = "0 0 * * * *", zone = "Asia/Seoul")
    public void scheduled() {
        LocalDateTime targetTime = LocalDateTime.now().minusDays(1);
        fileBatchService.temporaryFileRemove(targetTime, bucket);
    }
}
