package com.bgmagitapi.kml.notice.down;

import com.bgmagitapi.config.S3FileUtils;
import com.bgmagitapi.config.UploadResult;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.util.UriUtils;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;

@RequiredArgsConstructor
@RequestMapping("/bgm-agit")
@RestController
public class FileDownLoadController {
    
    private final S3Client s3Client;
    
    private final S3FileUtils s3FileUtils;
    
    @Value("${spring.cloud.aws.s3.bucket}")
    private String bucketName;
    
    @GetMapping("/download/{folder}/{fileName}")
      public ResponseEntity<Resource> download(
              @PathVariable String fileName,
              @PathVariable String folder
      ) {
          String key = folder + "/" + fileName;
          ResponseInputStream<GetObjectResponse> object = s3Client.getObject(
                  GetObjectRequest.builder()
                          .bucket(bucketName)
                          .key(key)
                          .build()
          );
          
          // 메타데이터에서 원본 파일명 가져오기
          String encodedFilenameInMetadata = object.response().metadata().get("original-filename");
          
          // 원래 이름 복원 (디코딩)
          String decodedFilename = encodedFilenameInMetadata != null
                  ? URLDecoder.decode(encodedFilenameInMetadata, StandardCharsets.UTF_8)
                  : fileName;
          
          // 다시 Content-Disposition용으로 인코딩 (한 번만)
          String encodedFilename = UriUtils.encode(decodedFilename, StandardCharsets.UTF_8);
          String contentDisposition = "attachment; filename*=UTF-8''" + encodedFilename;
          
          InputStreamResource resource = new InputStreamResource(object);
          return ResponseEntity.ok()
                  .header(HttpHeaders.CONTENT_DISPOSITION, contentDisposition)
                  .contentType(MediaType.APPLICATION_OCTET_STREAM)
                  .body(resource);
      }
      
      
      
    @PostMapping("/ckEditor/file/{folder}")
    public String CkEditorFileUpload(@RequestParam("file") MultipartFile file, @PathVariable String folder) {
        UploadResult notice = s3FileUtils.storeFile(file, folder);
        return notice.getUrl();
    }
}
