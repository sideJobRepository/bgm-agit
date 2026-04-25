import { useRequest } from '@/hooks/useRequest';
import api from '@/lib/axiosInstance';
import { useRoleStore } from '@/store/role';

export function useFetchMahjongRoles() {
  const { request } = useRequest();
  const setRole = useRoleStore((state) => state.setRole);

  const fetchRoles = (page: number, res: string) => {
    request(
      () =>
        api
          .get('/bgm-agit/mahjong-role', { params: { page, res } })
          .then((r) => r.data),
      setRole,
      { ignoreErrorRedirect: true }
    );
  };

  return fetchRoles;
}
