import api from '@/lib/axiosInstance';
import {
  createPresignedUploader,
  type PresignedUrlInfo,
} from '@/lib/file';

export type NoticePresignedUrlResponse = PresignedUrlInfo;

export type NoticeFileUploadResponse = {
  fileId: number;
  fileName: string;
  fileSize: number;
  contentType: string;
  objectKey: string;
  bucketName: string;
};

const noticeFileUploader = createPresignedUploader<
  NoticePresignedUrlResponse,
  NoticeFileUploadResponse
>({
  async requestPresignedUrls(files) {
    const { data } = await api.post<NoticePresignedUrlResponse[]>(
      '/bgm-agit/presigned-url',
      {
        fileType: 'MAHJONG_NOTICE',
        files,
      }
    );
    return data;
  },
  async registerUploadedFiles(uploaded) {
    const { data } = await api.post<NoticeFileUploadResponse[]>(
      '/bgm-agit/upload-file',
      {
        fileType: 'MAHJONG_NOTICE',
        files: uploaded.map(({ presign, file }) => ({
          fileName: presign.fileName,
          objectKey: presign.objectKey,
          contentType: presign.contentType,
          bucketName: presign.bucketName,
          fileSize: file.size,
        })),
      }
    );
    return data;
  },
});

export async function uploadNoticeFile(
  file: File
): Promise<NoticeFileUploadResponse> {
  return noticeFileUploader.upload(file);
}
