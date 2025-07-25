import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';
import { mainDataState, mainMenuState } from './state/mainState.ts';
import api from '../utils/axiosInstance';
import { useRequest } from './useRequest.ts';
import type { reservationData } from '../types/Reservation.ts';
import { reservationState } from './state/reservationState.ts';
import { userState } from './state/userState.ts';
import { jwtDecode } from 'jwt-decode';

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

export function useReservationFetch() {
  const { request } = useRequest();
  const setReservation = useSetRecoilState(reservationState);

  const fetchReservation = (params: reservationData) => {
    request(
      () => api.get('/bgm-agit/reservation', { params }).then(res => res.data),
      setReservation
    );
  };

  return fetchReservation;
}

export function useLoginPost() {
  const { request } = useRequest();
  const setUser = useSetRecoilState(userState);

  const postUser = (code: string, onSuccess?: () => void) => {
    request(
      () =>
        api.post('/bgm-agit/kakao-login', { code }).then(res => {
          const decoded = jwtDecode(res.data.token);
          sessionStorage.setItem('user', JSON.stringify(decoded));
          sessionStorage.setItem('token', res.data.token);
          return decoded;
        }),
      decodedUser => {
        setUser(decodedUser);
        if (onSuccess) onSuccess();
      }
    );
  };

  return { postUser };
}
