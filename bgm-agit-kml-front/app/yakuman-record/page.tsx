import type { Metadata } from 'next';
import YakumanRecordClient, { type YakumanPageData } from './YakumanRecordClient';

export const metadata: Metadata = {
  title: '역만 기록',
  description:
    'BGM 아지트 BML 역만 기록 — 멤버별 역만 횟수와 상세 내역을 확인하세요.',
  alternates: {
    canonical: 'https://bgmagit.co.kr/record/yakuman-record',
  },
  openGraph: {
    title: '역만 기록 | BGM 아지트 BML',
    description:
      'BGM 아지트 BML 역만 기록 — 멤버별 역만 횟수와 상세 내역을 확인하세요.',
    url: 'https://bgmagit.co.kr/record/yakuman-record',
  },
};

async function fetchYakumanList(): Promise<YakumanPageData | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) return null;

  try {
    const res = await fetch(`${apiUrl}/bgm-agit/yakuman-pivot?size=20&page=0`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return (await res.json()) as YakumanPageData;
  } catch {
    return null;
  }
}

export default async function YakumanRecordPage() {
  const initialData = await fetchYakumanList();
  return <YakumanRecordClient initialData={initialData} />;
}
