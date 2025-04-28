// server/store/useTodoStore.ts
import { create } from 'zustand';

export interface TodoItem {
  id: number;
  title: string;
  description?: string;
  isDone:boolean;
}

type TodoState = {
  todos: TodoItem[];                // 配列
  setTodos: (items: TodoItem[]) => void;
};

export const useTodoStore = create<TodoState>((set) => ({
  todos: [],                        // 初期値は空の配列
  setTodos: (items) => set({ todos: items }),
}));
