'use client';

import { useEffect, useRef, useState } from 'react';
import { withBasePath } from '@/lib/path';
import styled from 'styled-components';
import type { PDFDocumentProxy } from 'pdfjs-dist';

type Props = {
  fileUrl: string;
};

export default function PdfViewer({ fileUrl }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pdfDocRef = useRef<PDFDocumentProxy | null>(null);

  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [loading, setLoading] = useState(true);

  /* =========================
     PAGE RENDER
  ========================= */
  const renderPage = async (pageNum: number, scale: number) => {
    if (!pdfDocRef.current || !containerRef.current) return;

    setLoading(true);
    containerRef.current.innerHTML = '';

    const page = await pdfDocRef.current.getPage(pageNum);

    // 👉 컨테이너 폭 기준 자동 스케일 (모바일 대응)
    const containerWidth = containerRef.current.clientWidth || 800;
    const baseViewport = page.getViewport({ scale: 1 });
    const fitScale = (containerWidth / baseViewport.width) * scale;

    const viewport = page.getViewport({ scale: fitScale });

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({
      canvas,
      viewport,
    }).promise;

    containerRef.current.appendChild(canvas);
    setLoading(false);
  };

  /* =========================
     PDF LOAD
  ========================= */
  useEffect(() => {
    if (!fileUrl) return;

    let cancelled = false;

    const loadPdf = async () => {
      setLoading(true);

      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc =
        withBasePath('/pdf.worker.min.mjs');

      const task = pdfjsLib.getDocument({ url: fileUrl });
      const pdf = await task.promise;
      if (cancelled) return;

      pdfDocRef.current = pdf;
      setTotalPages(pdf.numPages);

      await renderPage(1, 1);
      setCurrentPage(1);
    };

    loadPdf();

    return () => {
      cancelled = true;
    };
  }, [fileUrl]);


  /* =========================
     PAGE / ZOOM CHANGE
  ========================= */
  useEffect(() => {
    if (!pdfDocRef.current) return;
    renderPage(currentPage, zoom);
  }, [currentPage, zoom]);

  /* =========================
     CONTROLS
  ========================= */
  const prevPage = () =>
    setCurrentPage((p) => Math.max(1, p - 1));

  const nextPage = () =>
    setCurrentPage((p) => Math.min(totalPages, p + 1));

  const zoomIn = () =>
    setZoom((z) => Math.min(3, z + 0.1));

  const zoomOut = () =>
    setZoom((z) => Math.max(0.5, z - 0.1));

  const fullscreen = () => {
    const el = containerRef.current?.parentElement;
    if (!el) return;

    if (!document.fullscreenElement) el.requestFullscreen();
    else document.exitFullscreen();
  };

  /* =========================
     UI
  ========================= */
  return (
    <div style={{ width: '100%', background: '#282828' }}>
      {/* TOOLBAR */}
      <ToolBox
      >
        <button onClick={prevPage}>‹</button>
        <span>
          {currentPage} / {totalPages}
        </span>
        <button onClick={nextPage}>›</button>

        <span style={{ marginLeft: 12 }} />

        <button onClick={zoomOut}>−</button>
        <span>{Math.round(zoom * 100)}%</span>
        <button onClick={zoomIn}>＋</button>

        <span style={{ marginLeft: 12 }} />

        <button onClick={fullscreen}>⛶</button>
      </ToolBox>

      {/* CANVAS */}
      <div
        style={{
          position: 'relative',
          overflow: 'auto',
          display: 'flex',
          justifyContent: 'center',
          padding: 12,
        }}
      >
        {loading && (
          <div style={{ color: '#fff', position: 'absolute' }}>
            Loading...
          </div>
        )}
        <div
          ref={containerRef}
          style={{ width: '100%', maxWidth: 900 }}
        />
      </div>
    </div>
  );
}

const ToolBox = styled.div`
    display: flex;
    gap: 8px;
    padding: 8px;
    background: #3c3c3c;
    color: #ffffff;
`