import 'server-only';

export type DayRecordRow = {
  nickname: string;
  point: number;
  rank: number;
  score: number;
  seat: string;
  winner: boolean;
};

export type DayRecordYakuman = {
  nickname: string;
  yakumanName: string;
  // legacy 풀 URL / new fileId (presigned URL 조회용). 둘 중 하나라도 있으면 이미지 보기 노출
  imageUrl?: string | null;
  fileId?: number | null;
};

export type DayRecordSanbaeman = {
  nickname: string;
  sanbaemanName?: string | null;
  imageUrl?: string | null;
  fileId?: number | null;
};

export type DayRecordItem = {
  createNicname: string;
  matchsId: number;
  registDate: string;
  matchsWind: string;
  tournamentStatus: string;
  delStatus?: string;
  rows: DayRecordRow[];
  // 이 대국에서 화료된 역만/삼배만 (없으면 빈 배열)
  yakumans?: DayRecordYakuman[];
  sanbaemans?: DayRecordSanbaeman[];
};

export type DayRecordResponse = {
  content: DayRecordItem[];
  page: number;
  size: number;
  totalPages: number;
};

export type DayRecordParams = {
  page?: number;
  startDate: string | null;
  endDate: string | null;
  nickName: string;
  tournamentStatus?: string;
  // '' 전체 / 'YAKUMAN' 역만 / 'SANBAEMAN' 삼배만
  bonusType?: string;
};

export async function fetchDayRecordListServer(
  params: DayRecordParams
): Promise<DayRecordResponse | null> {
  const u = new URL(`${process.env.NEXT_PUBLIC_API_URL}/bgm-agit/record`);
  u.searchParams.set('size', '6');
  if (params.page !== undefined) u.searchParams.set('page', String(params.page));
  if (params.startDate) u.searchParams.set('startDate', params.startDate);
  if (params.endDate) u.searchParams.set('endDate', params.endDate);
  if (params.nickName) u.searchParams.set('nickName', params.nickName);
  if (params.tournamentStatus) u.searchParams.set('tournamentStatus', params.tournamentStatus);
  if (params.bonusType) u.searchParams.set('bonusType', params.bonusType);

  try {
    const res = await fetch(u.toString(), { cache: 'no-store' });
    if (!res.ok) return null;
    return (await res.json()) as DayRecordResponse;
  } catch (e) {
    console.error('[fetchDayRecordListServer]', e);
    return null;
  }
}
