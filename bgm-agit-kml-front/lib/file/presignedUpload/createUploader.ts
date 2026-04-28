import axios from 'axios';
import type {
  PresignedUploader,
  PresignedUrlInfo,
  UploaderAdapter,
} from './types';

/**
 * Presigned URL 업로드 3단계를 책임지는 팩토리.
 *  1) requestPresignedUrls (어댑터)  : 서버에서 PUT URL 발급
 *  2) PUT (내장)                     : 프론트가 S3 로 직접 업로드
 *  3) registerUploadedFiles (어댑터) : 서버에 메타 등록 후 fileId 등 반환
 *
 * transformRequest: [(d) => d] 는 axios 가 File 을 JSON 으로 직렬화하지 못하게 막는 장치.
 * 절대 지우지 말 것 (지우면 S3 에 0바이트 파일이 올라감).
 */
export function createPresignedUploader<
  Presign extends PresignedUrlInfo,
  Registered
>(
  adapter: UploaderAdapter<Presign, Registered>
): PresignedUploader<Registered> {
  async function upload(file: File): Promise<Registered> {
    const [presign] = await adapter.requestPresignedUrls([
      { fileName: file.name, fileSize: file.size, contentType: file.type },
    ]);
    if (!presign) {
      throw new Error('presigned URL 응답이 비어 있습니다');
    }

    await axios.put(presign.url, file, {
      headers: { 'Content-Type': file.type || 'application/octet-stream' },
      transformRequest: [(d) => d],
    });

    const [registered] = await adapter.registerUploadedFiles([
      { presign, file },
    ]);
    return registered;
  }

  return { upload };
}
