// src/components/features/todo/TodoContainer.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useUiStore } from '@/store/useUiStore';
import { trpc } from '@/lib/trpcClient';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Trash2, PlusCircle } from 'lucide-react';
import CalendarContainer from '@/components/features/calendar/CalendarContainer';

// --- Zod スキーマ定義 ------------------------------------------------
const taskSchema = z.object({
  title: z.string().min(1, { message: 'タスク名を入力してください' }),
  description: z.string().optional(),
  date: z.string(),
});

type TaskFormData = z.infer<typeof taskSchema>;

// --- 進捗バーコンポーネント ------------------------------------------
function ProgressBar({ completed, total }: { completed: number; total: number }) {
  const ratio = total === 0 ? 1 : completed / total;
  const barClass = total === 0 ? 'bg-gray-300' : 'bg-blue-500';

  return (
    <div className="flex items-center justify-end mb-4 space-x-2">
      <div className="flex-1 bg-gray-200 h-1.5 rounded-full overflow-hidden">
        <div
          className={`${barClass} h-1.5 rounded-full transition-all duration-300`}
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
      <span className="text-gray-600 text-sm font-medium">
        {completed}/{total}
      </span>
    </div>
  );
}

export default function TodoContainer() {
  // --- Zustand & TRPC Utils -----------------------------------------
  const selectedDate = useUiStore((s) => s.selectedDate);
  const utils = trpc.useUtils();

  // --- エラーステート -------------------------------------------------
  const [error, setError] = useState<string | null>(null);

  // --- React Hook Form ----------------------------------------------
  const { register, handleSubmit, reset, setValue, formState: { errors } } =
    useForm<TaskFormData>({
      resolver: zodResolver(taskSchema),
      defaultValues: { title: '', description: '', date: selectedDate },
    });

  useEffect(() => {
    setValue('date', selectedDate);
  }, [selectedDate, setValue]);

  // --- TRPC: クエリ & ミューテーション --------------------------------
  const { data: todos = [], isLoading } = trpc.todo.getTasksByDate.useQuery({ date: selectedDate });
  const invalidate = () => utils.todo.getTasksByDate.invalidate();

  const addTodo = trpc.todo.addTodo.useMutation({ onSuccess: invalidate, onError: (e) => setError(e.message) });
  const clearTodo = trpc.todo.clearTodo.useMutation({ onSuccess: invalidate, onError: (e) => setError(e.message) });
  const deleteTodo = trpc.todo.deleteTodo.useMutation({ onSuccess: invalidate, onError: (e) => setError(e.message) });
  const updateTodo = trpc.todo.updateTodo.useMutation({ onSuccess: invalidate, onError: (e) => setError(e.message) });

  // --- イベントハンドラ ----------------------------------------------
  const onSubmit = async (data: TaskFormData) => {
    try {
      await addTodo.mutateAsync(data);
      reset();
    } catch {
      // onError で処理
    }
  };

  const handleToggleDone = (id: number, isDone: boolean) => {
    clearTodo.mutate({ id, date: selectedDate, isDone });
  };

  const handleTitleBlur = (
    id: number,
    prevTitle: string,
    e: React.FocusEvent<HTMLInputElement>
  ) => {
    const newTitle = e.target.value.trim();
    if (newTitle && newTitle !== prevTitle) {
      updateTodo.mutate({ id, todoId: id, title: newTitle });
    }
  };

  if (isLoading) {
    return <p className="text-center py-8">Loading...</p>;
  }

  // --- ソート & 集計 ------------------------------------------------
  const sorted = [...todos].sort((a, b) => Number(a.isDone) - Number(b.isDone));
  const totalCount = sorted.length;
  const completedCount = sorted.filter((t) => t.isDone).length;

  return (
    <div className="flex h-full p-6 gap-6">
      {/* 左カラム：カレンダー */}
      <aside className="w-1/3 max-w-sm">
        <CalendarContainer />
      </aside>

      {/* 右カラム：ToDo */}
      <section className="flex-1 max-h-[85vh] bg-white rounded-2xl shadow-lg p-6 flex flex-col">
        {/* 入力フォーム */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex gap-3 mb-4">
          <input
            {...register('title')}
            placeholder="Add a new task..."
            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-shadow"
          />
          <input {...register('date')} type="hidden" />
          <button
            type="submit"
            className="flex items-center px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-400 transition-colors"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            Add
          </button>
        </form>

        {/* 進捗バー＆カウンター */}
        <ProgressBar completed={completedCount} total={totalCount} />

        {/* エラー表示 */}
        {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
        {errors.title && <p className="text-sm text-red-500 mb-4">{errors.title.message}</p>}

        {/* タスク一覧 */}
        <ul className="space-y-4 overflow-y-auto">
          {sorted.map((t) => (
            <li
              key={t.id}
              className={`flex items-center justify-between p-4 border border-gray-100 rounded-xl ${
                t.isDone ? 'bg-gray-50' : 'bg-white'
              }`}
            >
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={t.isDone}
                  onChange={() => handleToggleDone(t.id, t.isDone)}
                  className={`h-5 w-5 border-4 rounded-md transition-colors duration-200 ${
                    t.isDone ? 'bg-blue-600 border-blue-600' : 'border-gray-300 hover:border-blue-500'
                  }`}
                />
                <input
                  type="text"
                  defaultValue={t.title}
                  onBlur={(e) => handleTitleBlur(t.id, t.title, e)}
                  onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                  className={`ml-4 w-full bg-transparent border-none focus:outline-none transition-colors ${
                    t.isDone ? 'line-through text-gray-400' : 'text-gray-800'
                  }`}
                />
              </label>
              <button
                onClick={() => deleteTodo.mutate({ id: t.id, date: selectedDate })}
                className="p-2 rounded-full hover:bg-red-100 focus:ring-2 focus:ring-red-200 transition-colors"
              >
                <Trash2 className="w-5 h-5 text-red-500" />
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
