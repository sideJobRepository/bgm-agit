import type { Metadata } from 'next';
import type { LankPage } from '@/store/rank';
import RankClient from './RankClient';

export const metadata: Metadata = {
  title: '랭킹',
  description:
    'BGM 아지트 BML 주간/월간 마작 랭킹 — 멤버별 순위, 평균 순위, 1·2위율, 토비율 등 통계를 확인하세요.',
  alternates: {
    canonical: 'https://bgmagit.co.kr/record/rank',
  },
  openGraph: {
    title: '랭킹 | BGM 아지트 BML',
    description:
      'BGM 아지트 BML 주간/월간 마작 랭킹 — 멤버별 순위, 평균 순위, 1·2위율, 토비율 등 통계를 확인하세요.',
    url: 'https://bgmagit.co.kr/record/rank',
  },
};

async function fetchRankList(): Promise<LankPage | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) return null;

  const today = new Date();
  const params = new URLSearchParams({
    size: '20',
    page: '0',
    type: 'MONTHLY',
    year: String(today.getFullYear()),
    month: String(today.getMonth() + 1),
  });

  try {
    const res = await fetch(`${apiUrl}/bgm-agit/ranks?${params.toString()}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return (await res.json()) as LankPage;
  } catch {
    return null;
  }
}

export default async function RankPage() {
  const initialData = await fetchRankList();

  const pageUrl = 'https://bgmagit.co.kr/record/rank';
  const today = new Date();
  const periodLabel = `${today.getFullYear()}년 ${today.getMonth() + 1}월`;

  const itemListElements = (initialData?.content ?? []).map((item, idx) => ({
    '@type': 'ListItem',
    position: idx + 1,
    name: `${item.rank}위 ${item.memberNickname} (총점 ${item.recordSumPoint}, 평균순위 ${item.avgRank})`,
  }));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${pageUrl}#webpage`,
    url: pageUrl,
    name: '랭킹 | BGM 아지트 BML',
    description:
      'BGM 아지트 BML 주간/월간 마작 랭킹 — 멤버별 순위, 평균 순위, 1·2위율, 토비율 등 통계를 확인하세요.',
    inLanguage: 'ko-KR',
    isPartOf: { '@id': 'https://bgmagit.co.kr/record/#website' },
    mainEntity: {
      '@type': 'ItemList',
      name: `BGM 아지트 BML 마작 랭킹 (${periodLabel})`,
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
      <RankClient initialData={initialData} />
    </>
  );
}
