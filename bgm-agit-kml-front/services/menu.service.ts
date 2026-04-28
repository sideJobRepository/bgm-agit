import { useRequest } from '@/hooks/useRequest';
import { useEffect } from 'react';
import api from '@/lib/axiosInstance';
import { useKmlMenuStore } from '@/store/menu';
import { useUserStore } from '@/store/user';

export function useFetchMainMenu() {
  const setMainMenu = useKmlMenuStore((state) => state.setMenu);
  const user = useUserStore((state) => state.user);
  const { request } = useRequest();

  useEffect(() => {
    request(() => api.get('/bgm-agit/kml-menu').then((res) => res.data), setMainMenu, {
      ignoreErrorRedirect: true,
    });
  }, [user]);
}
