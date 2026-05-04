import MemberRankClient from './MemberRankClient';

interface Props {
  params: Promise<{ memberId: string }>;
}

export default async function MemberRankPage({ params }: Props) {
  const { memberId } = await params;
  return <MemberRankClient memberId={Number(memberId)} />;
}
