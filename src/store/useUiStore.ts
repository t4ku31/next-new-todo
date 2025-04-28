import { create } from "zustand";

interface UIState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  friendbarOpen:boolean;
  toggleFriendbar:()=>void;
  selectedDate: string;
  setSelectedDate: (d: string) => void;
}

// 今日の日付を "YYYY-MM-DD" 形式で取得
const today = new Date().toISOString().split("T")[0];

export const useUiStore = create<UIState>((set) => ({
  sidebarOpen: false,
  toggleSidebar: () =>
    set((s) => ({ sidebarOpen: !s.sidebarOpen })),

  friendbarOpen:false,
  toggleFriendbar:()=>
    set((s)=>({friendbarOpen: !s.friendbarOpen})),

  // 初期値を today に
  selectedDate: today,

  setSelectedDate: (d) => set({ selectedDate: d }),
}));