export default function PdfViewer({ url }: { url: string }) {
  return (
    <iframe
      src={url}
      style={{
        width: '100%',
        height: '70vh',
        border: 'none',
      }}
    />
  );
}
