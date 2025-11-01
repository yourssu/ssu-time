import { atom } from 'jotai';

export interface User {
  id: string;
  name: string;
  email: string;
  provider: 'google' | 'naver';
}

export const isLoggedInAtom = atom<boolean>(false);
export const userAtom = atom<User | null>(null);