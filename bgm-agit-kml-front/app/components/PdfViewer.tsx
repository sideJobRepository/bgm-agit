'use client';

import { useEffect, useRef, useState } from 'react';
import { withBasePath } from '@/lib/path';
import styled from 'styled-components';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import {
  CaretLeft,
  CaretRight,
  MagnifyingGlassPlus,
  MagnifyingGlassMinus,
  ArrowsOut,
  ArrowsIn,
} from 'phosphor-react';

type Props = {
  fileUrl: string;
};

export default function PdfViewer({ fileUrl }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pdfDocRef = useRef<PDFDocumentProxy | null>(null);


  const [pdfReady, setPdfReady] = useState(false);

  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [loading, setLoading] = useState(true);

  //사이즈 감지
  const [viewportWidth, setViewportWidth] = useState<number | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);

  const renderPage = async (pageNum: number, scale: number) => {
    if (!pdfDocRef.current || !containerRef.current || !viewportWidth) return;

    setLoading(true);
    containerRef.current.innerHTML = '';

    const page = await pdfDocRef.current.getPage(pageNum);

    const baseViewport = page.getViewport({ scale: 1 });
    const fitScale = (viewportWidth / baseViewport.width) * scale;
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
      setCurrentPage(1);
      setPdfReady(true);
    };

    loadPdf();

    return () => {
      cancelled = true;
    };
  }, [fileUrl]);

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

  useEffect(() => {
    if (!viewportRef.current) return;

    const observer = new ResizeObserver(([entry]) => {
      setViewportWidth(Math.floor(entry.contentRect.width));
    });

    observer.observe(viewportRef.current);

    return () => observer.disconnect();
  }, []);


  useEffect(() => {
    if (!pdfReady || !viewportWidth) return;
    renderPage(currentPage, zoom);
  }, [pdfReady, viewportWidth, currentPage, zoom]);


  return (
    <PdfWrap>
      {/* TOOLBAR */}
      <ToolBox
      >
        <Start/>
        <Center>
          <button onClick={prevPage}>
            <CaretLeft weight="bold"/>
          </button>
          <span>
          {currentPage} / {totalPages}
        </span>
          <button onClick={nextPage}>
            <CaretRight weight="bold"/>
          </button>
        </Center>

        <End>
          <button onClick={zoomOut}>
            <MagnifyingGlassMinus weight="bold"/>
          </button>
          <span>{Math.round(zoom * 100)}%</span>
          <button onClick={zoomIn}>
            <MagnifyingGlassPlus weight="bold"/>
          </button>
        </End>

      </ToolBox>

      {/* CANVAS */}
      <CanvasBox
        ref={viewportRef}
      >
        {loading && (
          <div style={{ color: '#fff', position: 'absolute' }}>
            Loading...
          </div>
        )}
        <Canvas
          ref={containerRef}
        />
      </CanvasBox>
    </PdfWrap>
  );
}

const PdfWrap = styled.div`
    width: 100%;
    background: #282828;
`

const CanvasBox = styled.div`
    position: relative;
    overflow: auto;
    display: flex;
    justify-content: center;
    padding: 12;
`

const Canvas = styled.div`
    width: fit-content;
    margin: 0 auto;
    overflow: auto;
`

const ToolBox = styled.div`
    display: flex;
    gap: 8px;
    padding: 8px 12px;
    background: #3c3c3c;
    color: #ffffff;

    span {
        background-color: #282828;
        padding: 4px 8px;
    }

    button {
        display: flex;
        align-items: center;
        justify-content: center;
        border: none;
        background-color: transparent;

        svg {
            color: white;
            cursor: pointer;
            width: 12px;
            height: 12px;
        }
    }
`

const Start = styled.section`
    display: inline-flex;
    align-items: center;
    justify-content: start;
    gap: 4px;
    width: 33%;
    font-size: ${({ theme }) => theme.desktop.sizes.sm};
`

const Center = styled.section`
    width: 33%;
    gap: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: ${({ theme }) => theme.desktop.sizes.sm};
`

const End = styled.section`
    width: 33%;
    gap: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: ${({ theme }) => theme.desktop.sizes.sm};
`