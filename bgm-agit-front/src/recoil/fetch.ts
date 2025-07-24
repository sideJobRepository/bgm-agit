import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';
import { mainDataState, mainMenuState } from './mainState';
import api from '../utils/axiosInstance';
import { useRequest } from './useRequest.ts';
import type { reservationData } from '../types/Reservation.ts';
import { reservationState } from './reservationState.ts';

export function useFetchMainMenu() {
  const setMainMenu = useSetRecoilState(mainMenuState);
  const { request } = useRequest();

  useEffect(() => {
    request(() => api.get('/bgm-agit/main-menu').then(res => res.data), setMainMenu);
  }, []);
}

export function useFetchMainData(param?: { labelGb?: number; link?: string }) {
  const setMain = useSetRecoilState(mainDataState);
  const { request } = useRequest();

  useEffect(() => {
    request(
      () =>
        api
          .get('/bgm-agit/main-image', {
            params: param ?? {},
          })
          .then(res => res.data),
      setMain
    );
  }, [param?.link, param?.labelGb]);
}

export function useFetchReservationData(param?: reservationData) {
  const setReservation = useSetRecoilState(reservationState);
  const { request } = useRequest();

  useEffect(() => {
    request(
      () =>
        api
          .get('/bgm-agit/main-image', {
            params: param ?? {},
          })
          .then(res => res.data),
      setReservation
    );
  }, [param?.date, param?.labelGb]);
}
