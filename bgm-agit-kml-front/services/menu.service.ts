import { useRequest } from '@/hooks/useRequest';
import { useEffect } from 'react';
import api from '@/lib/axiosInstance';
import { useKmlMenuStore } from '@/store/menu';
import { useUserStore } from '@/store/user';
import { tokenStore } from '@/services/tokenStore';

export function useFetchMainMenu() {
  const setMainMenu = useKmlMenuStore((state) => state.setMenu);
  const { request } = useRequest();

  const token = tokenStore.get();

  useEffect(() => {
    request(() => api.get('/bgm-agit/kml-menu').then((res) => res.data), setMainMenu, {
      ignoreErrorRedirect: true,
    });
  }, [token]);
}
