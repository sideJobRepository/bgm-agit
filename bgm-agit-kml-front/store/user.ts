import { atom } from "recoil";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export const userState = atom<User | null>({
  key: "userState",
  default: null,
});
