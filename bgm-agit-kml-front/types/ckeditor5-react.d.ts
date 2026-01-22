// types/ckeditor5-react.d.ts
declare module '@ckeditor/ckeditor5-react' {
  import * as React from 'react';
  import type { Editor } from '@ckeditor/ckeditor5-core';

  export interface CKEditorProps {
    editor: any;
    data?: string;
    config?: Record<string, any>;
    disabled?: boolean;
    onReady?: (editor: Editor) => void;
    onChange?: (event: any, editor: Editor) => void;
    onBlur?: (event: any, editor: Editor) => void;
    onFocus?: (event: any, editor: Editor) => void;
  }

  export class CKEditor extends React.Component<CKEditorProps> {}
}
