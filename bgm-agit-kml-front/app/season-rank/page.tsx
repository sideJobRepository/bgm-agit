import type { Metadata } from 'next';
import SeasonRankClient from './SeasonRankClient';

export const metadata: Metadata = {
  title: '시즌 랭킹',
  description: 'BGM 아지트 시즌 레이팅 랭킹과 내 등급 현황을 확인하세요.',
};

export default function SeasonRankPage() {
  return <SeasonRankClient />;
}
