import { useRequest } from '@/hooks/useRequest';
import api from '@/lib/axiosInstance';

export interface MyPageInfo {
  id: number;
  mail: string | null;
  name: string;
  nickName: string;
  phoneNo: string;
  nickNameUseStatus: string | null;
  mahjongUseStatus: string | null;
  alimtalkStatus: string | null;
  registDate: string;
}

export function useFetchMyPage() {
  const { request } = useRequest();

  const fetchMyPage = (onSuccess: (data: MyPageInfo) => void) => {
    request(() => api.get<MyPageInfo>('/bgm-agit/mypage').then((r) => r.data), onSuccess, {
      ignoreErrorRedirect: true,
    });
  };

  return fetchMyPage;
}
