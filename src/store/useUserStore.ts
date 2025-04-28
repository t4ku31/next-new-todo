// src/store/useUserStore.ts
import { create } from 'zustand';

// セッションに保存されるユーザー情報の型
export type UserSession = {
  id: number;
  username: string;
};

// Zustand のストア型定義
type UserState = {
  user: UserSession | null;
  // ユーザー情報をセット
  setUser: (user: UserSession) => void;
  // ユーザー情報をクリア
  clearUser: () => void;
};

export const useUserStore = create<UserState>((set) => ({
  // 初期値は未ログイン状態
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}));
