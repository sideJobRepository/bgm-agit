import api from '@/lib/axiosInstance';
import {
  createPresignedUploader,
  type PresignedUrlInfo,
} from '@/lib/file';

export type SanbaemanFileType = 'SANBAEMAN';

export type SanbaemanPresignedUrlResponse = PresignedUrlInfo;

export type SanbaemanFileUploadResponse = {
  fileId: number;
  fileName: string;
  fileSize: number;
  contentType: string;
  objectKey: string;
  bucketName: string;
};

const sanbaemanFileUploader = createPresignedUploader<
  SanbaemanPresignedUrlResponse,
  SanbaemanFileUploadResponse
>({
  async requestPresignedUrls(files) {
    const { data } = await api.post<SanbaemanPresignedUrlResponse[]>(
      '/bgm-agit/presigned-url',
      {
        fileType: 'SANBAEMAN',
        files,
      }
    );
    return data;
  },
  async registerUploadedFiles(uploaded) {
    const { data } = await api.post<SanbaemanFileUploadResponse[]>(
      '/bgm-agit/upload-file',
      {
        fileType: 'SANBAEMAN',
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

export async function uploadSanbaemanFile(
  file: File
): Promise<SanbaemanFileUploadResponse> {
  return sanbaemanFileUploader.upload(file);
}
