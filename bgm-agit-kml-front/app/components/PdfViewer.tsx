'use client';

import { useEffect, useRef, useState } from 'react';
import { withBasePath } from '@/lib/path';
import styled, { keyframes } from 'styled-components';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import {
  CaretLeft,
  CaretRight,
  MagnifyingGlassPlus,
  MagnifyingGlassMinus,
  FilePlus,
} from 'phosphor-react';
import { alertDialog, confirmDialog } from '@/utils/alert';
import { useInsertPost, useUpdatePost } from '@/services/main.service';
import { useFetchRule } from '@/services/rule.service';

type CurrentRule = {
  id: number;
  tournamentStatus: string;
  file: {
    id: number;
    fileName: string;
    fileUrl: string;
    fileFolder: string;
  }
}

type Props = {
  fileUrl: string;
  pageIndex: number;
  currentRule: CurrentRule
};

export default function PdfViewer({ fileUrl, pageIndex, currentRule }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pdfDocRef = useRef<PDFDocumentProxy | null>(null);
  console.log("pdf내의 fileurl", fileUrl);

  const fetchRule = useFetchRule();
  const { insert } = useInsertPost();
  const { update } = useUpdatePost();

  const [pdfReady, setPdfReady] = useState(false);

  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [loading, setLoading] = useState(true);

  //사이즈 감지
  const [viewportHeight, setViewportHeight] = useState<number | null>(null)
  const [viewportWidth, setViewportWidth] = useState<number | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);

  const measureViewport = () => {
    if (!viewportRef.current) return;

    const rect = viewportRef.current.getBoundingClientRect();
    setViewportWidth(Math.floor(rect.width));
    setViewportHeight(Math.floor(rect.height));
  };

  //파일 업로드
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File>();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(" e.target.files?.[0];",  e.target.files?.[0])
    const f = e.target.files?.[0];
    if (!f) return;

    const formData = new FormData();

    let message = 'PDF를 저장 하시겠습니까?';
    let requestFn = insert;
    console.log("currentRule", currentRule)
    if(fileUrl){
      message = 'PDF를 수정 하시겠습니까?'
      requestFn = update;
      formData.append('id', String(currentRule?.id));
      formData.append('deleteFileId', String(currentRule?.file?.id));
    }
    const result = await confirmDialog(message, 'warning');
    if (f && result.isConfirmed) {
      setFile(f);
      const tournamentStatus = pageIndex === 1 ? 'Y' : 'N';
      formData.append('tournamentStatus',tournamentStatus);
      formData.append('file', f);

      requestFn({
        url: '/bgm-agit/rule',
        body: formData,
        ignoreErrorRedirect: true,
        onSuccess: async () => {
          fetchRule();
          await alertDialog('PDF가 저장되었습니다.', 'success');
        },
      });
    }
  };

  const renderPage = async (pageNum: number, scale: number) => {
    if (!pdfDocRef.current || !containerRef.current || !viewportWidth) return;

    setLoading(true);
    containerRef.current.innerHTML = '';

    const page = await pdfDocRef.current.getPage(pageNum);

    const baseViewport = page.getViewport({ scale: 1 });
    const viewportHeight = viewportRef.current!.clientHeight;

    const scaleByWidth = viewportWidth / baseViewport.width;
    const scaleByHeight = viewportHeight / baseViewport.height;

    const fitScale = Math.min(scaleByWidth, scaleByHeight) * scale;
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
    measureViewport();

    window.addEventListener('resize', measureViewport);
    return () => window.removeEventListener('resize', measureViewport);
  }, []);

  useEffect(() => {
    if (!pdfReady || !viewportWidth) return;
    renderPage(currentPage, zoom);

    const nextPage = currentPage + 1;
    if (nextPage <= totalPages) {
      pdfDocRef.current
        ?.getPage(nextPage)
        .then((page) => {
          // ⚠️ DOM에 안 붙임
          const baseViewport = page.getViewport({ scale: 1 });
          const viewportHeight = viewportRef.current!.clientHeight;

          const scaleByWidth = viewportWidth / baseViewport.width;
          const scaleByHeight = viewportHeight / baseViewport.height;
          const fitScale = Math.min(scaleByWidth, scaleByHeight) * zoom;

          const viewport = page.getViewport({ scale: fitScale });

          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d')!;
          canvas.width = viewport.width;
          canvas.height = viewport.height;

          page.render({ canvas, viewport });
        });
    }
  }, [pdfReady, viewportWidth, viewportHeight, currentPage, zoom]);


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

        {loading && <SkeletonOverlay />}
        <Canvas
          ref={containerRef}
        />
        <Button
          onClick={() => fileInputRef.current?.click()}
        >
          <FilePlus weight="bold" />
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          hidden
          accept="application/pdf"
          onChange={handleFileChange}
        />
      </CanvasBox>
    </PdfWrap>
  );
}

const PdfWrap = styled.div`
    width: 100%;
    background: #282828;
    display: flex;
    flex: 1;
    flex-direction: column;
`;

const CanvasBox = styled.div`
    position: relative;
    flex: 1;
    min-height: 0;
    overflow: auto;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 8px;
`

const Canvas = styled.div`
    width: fit-content;
    margin: 0 auto;
    overflow: auto;
`

const Button = styled.button`
    position: absolute;
    top: 50%;
    right: 4%;
    transform: translateY(-50%);
    display: flex;
    align-items: center;
    padding: 8px;
    background-color: ${({ theme }) => theme.colors.writeBgColor};
    color: ${({ theme }) => theme.colors.whiteColor};
    font-size: ${({ theme }) => theme.desktop.sizes.sm};
    border: none;
    border-radius: 999px;
    cursor: pointer;
    box-shadow: 2px 4px 2px rgba(0, 0, 0, 0.2);

    &:hover {
        opacity: 0.8;
    }

    svg {
        width: 16px;
        height: 16px;
    }
    z-index: 2;
`;


const ToolBox = styled.div`
    display: flex;
    gap: 8px;
    padding: 8px;
    background: #3c3c3c;
    color: #ffffff;

    span {
        background-color: #282828;
        padding: 8px;
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
            width: 14px;
            height: 14px;
        }
    }
`

const Start = styled.section`
    display: inline-flex;
    align-items: center;
    justify-content: start;
    gap: 6px;
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
const shimmer = keyframes`
    0% {
        background-position: -100% 0;
    }
    100% {
        background-position: 100% 0;
    }
`;

const SkeletonOverlay = styled.div`
    position: absolute;
    inset: 0;
    background: linear-gradient(
            100deg,
            rgba(40, 40, 40, 0.8) 40%,
            rgba(60, 60, 60, 0.8) 50%,
            rgba(40, 40, 40, 0.8) 60%
    );
    background-size: 200% 100%;
    animation: ${shimmer} 1.4s ease infinite;
    z-index: 2;
    pointer-events: none;
`;