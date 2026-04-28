import api from '@/lib/axiosInstance';
import {
  createPresignedUploader,
  type PresignedUrlInfo,
} from '@/lib/file';

export type YakumanFileType = 'YAKUMAN';

export type YakumanPresignedUrlResponse = PresignedUrlInfo;

export type YakumanFileUploadResponse = {
  fileId: number;
  fileName: string;
  fileSize: number;
  contentType: string;
  objectKey: string;
  bucketName: string;
};

const yakumanFileUploader = createPresignedUploader<
  YakumanPresignedUrlResponse,
  YakumanFileUploadResponse
>({
  async requestPresignedUrls(files) {
    const { data } = await api.post<YakumanPresignedUrlResponse[]>(
      '/bgm-agit/presigned-url',
      {
        fileType: 'YAKUMAN',
        files,
      }
    );
    return data;
  },
  async registerUploadedFiles(uploaded) {
    const { data } = await api.post<YakumanFileUploadResponse[]>(
      '/bgm-agit/upload-file',
      {
        fileType: 'YAKUMAN',
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

export async function uploadYakumanFile(
  file: File
): Promise<YakumanFileUploadResponse> {
  return yakumanFileUploader.upload(file);
}

export type FileViewResponse = {
  fileId: number;
  fileName: string;
  url: string;
};

export async function fetchFileViewUrls(
  ids: number[]
): Promise<FileViewResponse[]> {
  if (!ids.length) return [];
  const { data } = await api.post<FileViewResponse[]>(
    '/bgm-agit/file-view',
    ids
  );
  return data;
}
