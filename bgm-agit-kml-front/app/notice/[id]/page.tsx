import type { Metadata } from 'next';
import type { NoticeFiles } from '@/store/notice';
import NoticeDetailClient from './NoticeDetailClient';

interface NoticeDetail {
  id: number;
  title: string;
  cont: string;
  registDate: string;
  files: NoticeFiles[];
}

async function fetchNoticeDetail(id: string): Promise<NoticeDetail | null> {
  if (id === 'new') return null;

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) return null;

  try {
    const res = await fetch(`${apiUrl}/bgm-agit/kml-notice/${id}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return (await res.json()) as NoticeDetail;
  } catch {
    return null;
  }
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  if (id === 'new') {
    return {
      title: '공지사항 작성',
      robots: { index: false, follow: false },
    };
  }

  const detail = await fetchNoticeDetail(id);
  if (!detail) {
    return {
      title: '공지사항',
      description: 'BGM 아지트 BML 공지사항',
    };
  }

  const cleanContent = stripHtml(detail.cont);
  const description =
    cleanContent.length > 150
      ? cleanContent.slice(0, 150) + '...'
      : cleanContent || 'BGM 아지트 BML 공지사항';

  const url = `https://bgmagit.co.kr/record/notice/${id}`;

  return {
    title: detail.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      title: `${detail.title} | BGM 아지트 BML`,
      description,
      url,
      publishedTime: detail.registDate,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${detail.title} | BGM 아지트 BML`,
      description,
    },
  };
}

export default async function NoticeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const initialDetail = await fetchNoticeDetail(id);
  return <NoticeDetailClient id={id} initialDetail={initialDetail} />;
}
