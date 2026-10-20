import type { JwtPayload } from 'jwt-decode';

export interface CustomUser extends JwtPayload {
  id: number;
  name: string;
  roles: string[];
  socialId: string;
  sub: string;
  //phoneNumber: string;
}

export type MyPage = {
  id: string;
  nickName: string;
  phoneNo: string;
  nickNameUseStatus: string;
  name: string;
  mail: string;
  registDate: string;
  alimtalkStatus?: string; // 'Y'/'N' 알림톡 수신 여부 (수정 시 보존용)
  mahjongUseStatus?: string; // 'Y' = 마작(BML) 기록 이용 회원
  monthlyPassStatus?: string; // 'Y' = 이번 달 월간패스 회원(관리자 지정, 매월 1일 초기화)
};
