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
};
