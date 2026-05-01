import type { Metadata } from 'next';
import type { NoticePage } from '@/store/notice';
import NoticeClient from './NoticeClient';

export const metadata: Metadata = {
  title: '공지사항',
  description:
    'BGM 아지트 BML 공지사항 — 대회 일정, 룰 업데이트, 운영 안내 및 주요 소식',
  alternates: {
    canonical: 'https://bgmagit.co.kr/record/notice',
  },
  openGraph: {
    title: '공지사항 | BGM 아지트 BML',
    description:
      'BGM 아지트 BML 공지사항 — 대회 일정, 룰 업데이트, 운영 안내 및 주요 소식',
    url: 'https://bgmagit.co.kr/record/notice',
  },
};

async function fetchNoticeList(): Promise<NoticePage | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) return null;

  try {
    const res = await fetch(`${apiUrl}/bgm-agit/kml-notice?size=5&page=0`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return (await res.json()) as NoticePage;
  } catch {
    return null;
  }
}

export default async function NoticePage() {
  const initialData = await fetchNoticeList();

  const pageUrl = 'https://bgmagit.co.kr/record/notice';
  const itemListElements = (initialData?.content ?? []).map((item, idx) => ({
    '@type': 'ListItem',
    position: idx + 1,
    url: `${pageUrl}/${item.id}`,
    name: item.title,
  }));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${pageUrl}#webpage`,
    url: pageUrl,
    name: '공지사항 | BGM 아지트 BML',
    description:
      'BGM 아지트 BML 공지사항 — 대회 일정, 룰 업데이트, 운영 안내 및 주요 소식',
    inLanguage: 'ko-KR',
    isPartOf: { '@id': 'https://bgmagit.co.kr/record/#website' },
    mainEntity: {
      '@type': 'ItemList',
      name: 'BGM 아지트 BML 공지사항 목록',
      numberOfItems: itemListElements.length,
      itemListElement: itemListElements,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <NoticeClient initialData={initialData} />
    </>
  );
}
