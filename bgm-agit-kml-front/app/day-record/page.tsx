import type { Metadata } from 'next';
import { format } from 'date-fns';
import { fetchDayRecordListServer } from '@/services/server/dayRecord.server';
import DayRecordClient from './DayRecordClient';

export const metadata: Metadata = {
  title: '월간/일간 기록',
  description:
    'BGM 아지트 BML 월간/일간 마작 기록을 확인하세요. 날짜·닉네임·대회 여부로 검색할 수 있습니다.',
  alternates: {
    canonical: 'https://bgmagit.co.kr/record/day-record',
  },
  openGraph: {
    title: '월간/일간 기록 | BGM 아지트 BML',
    description:
      'BGM 아지트 BML 월간/일간 마작 기록을 확인하세요. 날짜·닉네임·대회 여부로 검색할 수 있습니다.',
    url: 'https://bgmagit.co.kr/record/day-record',
  },
};

const formatDate = (date: Date) => format(date, 'yyyy-MM-dd');

export default async function DayRecordPage() {
  const today = new Date();
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(today.getMonth() - 1);

  const initialData = await fetchDayRecordListServer({
    page: 0,
    startDate: formatDate(oneMonthAgo),
    endDate: formatDate(today),
    nickName: '',
    tournamentStatus: '',
  });

  return <DayRecordClient initialData={initialData} />;
}
