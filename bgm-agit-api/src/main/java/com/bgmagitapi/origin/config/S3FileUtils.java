package com.bgmagitapi.origin.config;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.HeadObjectRequest;
import software.amazon.awssdk.services.s3.model.NoSuchKeyException;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;

import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Component
@RequiredArgsConstructor
public class S3FileUtils {
    private final S3Client s3Client;
    
    @Value("${spring.cloud.aws.s3.bucket}")
    private String bucketName;
    
    public List<UploadResult> storeFiles(List<MultipartFile> multipartFiles, String folder) {
        List<UploadResult> uploadFiles = new ArrayList<>();
        for (MultipartFile multipartFile : multipartFiles) {
            if (!multipartFile.isEmpty()) {
                uploadFiles.add(storeFile(multipartFile,folder));
            }
        }
        return uploadFiles;
    }
    
    
    public UploadResult storeFile(MultipartFile multipartFile, String folder) {
        
        if (multipartFile == null ||multipartFile.isEmpty()) return null;
        
        String originalFilename = multipartFile.getOriginalFilename();
        String uuid = UUID.randomUUID().toString();
        String ext = extractExt(originalFilename);
        String storeFileName = folder + "/" + uuid + "." + ext;
        
        try {
            String encodedFilename = URLEncoder.encode(originalFilename, StandardCharsets.UTF_8);
            Map<String, String> metadata = new HashMap<>();
            metadata.put("Content-Type", multipartFile.getContentType());
            metadata.put("Content-Disposition", "inline");
            metadata.put("original-filename", encodedFilename); //원래 파일명 메타데이터에 저장
            
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(storeFileName)
                    .metadata(metadata)
                    .build();
            
            s3Client.putObject(putObjectRequest, RequestBody.fromBytes(multipartFile.getBytes()));
            
            String url = s3Client.utilities()
                    .getUrl(b -> b.bucket(bucketName).key(storeFileName))
                    .toExternalForm();
            
            return new UploadResult(url, uuid,originalFilename);
            
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
    
    // 파일이 아니라 바이트로 받은 이미지(주소로 받아온 표지 등)를 올린다. ext 는 점 없이
    public UploadResult storeBytes(byte[] bytes, String contentType, String ext, String folder) {
        String uuid = UUID.randomUUID().toString();
        String storeFileName = folder + "/" + uuid + "." + ext;

        Map<String, String> metadata = new HashMap<>();
        metadata.put("Content-Type", contentType);
        metadata.put("Content-Disposition", "inline");

        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(storeFileName)
                .contentType(contentType)
                .metadata(metadata)
                .build();

        s3Client.putObject(putObjectRequest, RequestBody.fromBytes(bytes));

        String url = s3Client.utilities()
                .getUrl(b -> b.bucket(bucketName).key(storeFileName))
                .toExternalForm();
        return new UploadResult(url, uuid, uuid + "." + ext);
    }

    /**
     * 정해진 키에 올린다(같은 키면 덮어쓴다). 시계탑 캐릭터 이미지처럼 키가 곧 주소라 다시 올려도 주소가 안 바뀌어야 할 때.
     * storeBytes 는 UUID 키라 같은 파일을 두 번 올리면 두 개가 된다.
     */
    public String putAt(String key, byte[] bytes, String contentType, String cacheControl) {
        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .contentType(contentType)
                .cacheControl(cacheControl)
                .contentDisposition("inline")
                .build();
        s3Client.putObject(putObjectRequest, RequestBody.fromBytes(bytes));
        return urlOf(key);
    }

    /** 키의 공개 주소(올리지 않고 주소만 만든다) */
    public String urlOf(String key) {
        return s3Client.utilities()
                .getUrl(b -> b.bucket(bucketName).key(key))
                .toExternalForm();
    }

    /** 객체가 있는지(headObject). 404 만 false 이고 그 밖의 오류는 그대로 던진다 */
    public boolean exists(String key) {
        try {
            s3Client.headObject(HeadObjectRequest.builder().bucket(bucketName).key(key).build());
            return true;
        } catch (NoSuchKeyException e) {
            return false;
        } catch (S3Exception e) {
            if (e.statusCode() == 404) return false;
            throw e;
        }
    }

    public void deleteFile(String fileUrl) {
        String key = getFileNameFromUrl(fileUrl);
        DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .build();
        s3Client.deleteObject(deleteObjectRequest);
    }
    
    public String getFileNameFromUrl(String fileUrl) {
        try {
            URL url = new URL(fileUrl);
            String path = url.getPath(); // e.g. /images/filename.jpg
            return path.startsWith("/") ? path.substring(1) : path;
        } catch (MalformedURLException e) {
            throw new RuntimeException("Invalid S3 file URL", e);
        }
    }
    
    private String createStoreFileName(String originalFilename) {
        String ext = extractExt(originalFilename);
        String uuid = UUID.randomUUID().toString();
        return uuid + "." + ext;
    }
    
    private String extractExt(String originalFilename) {
        int pos = originalFilename.lastIndexOf(".");
        return originalFilename.substring(pos + 1);
    }
    
    public String extractUuidFromUrl(String fileUrl) {
        try {
            URL url = new URL(fileUrl);
            String path = url.getPath(); // /e30b8b76-1f1d-4111-9b97-5fe1344cf423.png
            String fileName = path.startsWith("/") ? path.substring(1) : path;
            int dotIndex = fileName.lastIndexOf(".");
            return (dotIndex != -1) ? fileName.substring(0, dotIndex) : fileName;
        } catch (MalformedURLException e) {
            throw new RuntimeException("Invalid S3 file URL", e);
        }
    }
}
