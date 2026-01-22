'use client';

import dynamic from 'next/dynamic';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import type { Editor } from '@ckeditor/ckeditor5-core';
import type { FileLoader } from '@ckeditor/ckeditor5-upload';

const CKEditor = dynamic(
  () => import('@ckeditor/ckeditor5-react').then(mod => mod.CKEditor),
  { ssr: false }
);

type Props = {
  value: string;
  onChange: (value: string) => void;
  onUpload: (file: File) => Promise<string>;
};

export default function NoticeEditor({ value, onChange, onUpload }: Props) {
  return (
    <CKEditor
      editor={ClassicEditor}
      data={value}
      config={{
        mediaEmbed: { previewsInData: true },
      }}
      onReady={(editor: Editor) => {
        editor.plugins.get('FileRepository').createUploadAdapter = (
          loader: FileLoader
        ) => ({
          upload: async () => {
            const file = await loader.file;
            if (!file) return { default: '' };
            const url = await onUpload(file);
            return { default: url };
          },
          abort: () => {},
        });
      }}
      onChange={(_, editor) => {
        const data = editor.getData();
        onChange(data);
      }}
    />
  );
}
