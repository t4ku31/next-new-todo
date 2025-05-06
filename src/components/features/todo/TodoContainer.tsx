'use client';

import { useEffect } from 'react';
import { useUiStore } from '@/store/useUiStore';
import { trpc } from '@/lib/trpcClient';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Trash2, PlusCircle } from 'lucide-react';

// -----------------------------
// Zod スキーマ定義
// -----------------------------
const taskSchema = z.object({
  title:       z.string().min(1),
  description: z.string().optional(),
  date:        z.string(),
});
type TaskFormData = z.infer<typeof taskSchema>;

export default function TodoContainer() {
  // -----------------------------
  // Zustand & TRPC Utils
  // -----------------------------
  const selectedDate = useUiStore((s) => s.selectedDate);
  const utils        = trpc.useUtils();

  // -----------------------------
  // React Hook Form
  // -----------------------------
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver:    zodResolver(taskSchema),
    defaultValues: { title: '', description: '', date: selectedDate },
  });

  // -----------------------------
  // TRPC データ取得 & ミューテーション
  // -----------------------------
  const { data: todos = [], isLoading } =
    trpc.todo.getTasksByDate.useQuery({ date: selectedDate });

  const addTodo    = trpc.todo.addTodo.useMutation({    onSuccess: () => utils.todo.getTasksByDate.invalidate() });
  const clearTodo  = trpc.todo.clearTodo.useMutation({  onSuccess: () => utils.todo.getTasksByDate.invalidate() });
  const deleteTodo = trpc.todo.deleteTodo.useMutation({ onSuccess: () => utils.todo.getTasksByDate.invalidate() });
  const updateTodo = trpc.todo.updateTodo.useMutation({ onSuccess: () => utils.todo.getTasksByDate.invalidate() });

  // 日付変更時に hidden input を更新
  useEffect(() => {
    setValue('date', selectedDate);
  }, [selectedDate, setValue]);

  // -----------------------------
  // イベントハンドラ
  // -----------------------------
  const onSubmit = async (data: TaskFormData) => {
    try {
      await addTodo.mutateAsync({
        title:       data.title,
        description: data.description,
        date:        data.date,
      });
      reset();
    } catch (error) {
      console.error('タスク作成エラー:', error);
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

  // -----------------------------
  // ローディング状態
  // -----------------------------
  if (isLoading) {
    return <p>Loading...</p>;
  }

  // -----------------------------
  // タスクを完了順でソート
  // -----------------------------
  const sorted = [...todos].sort((a, b) => {
    return (a.isDone ? 1 : 0) - (b.isDone ? 1 : 0);
  });

  // -----------------------------
  // JSX レンダリング
  // -----------------------------
  return (
    <div className="relative w-full h-full">
      <div
        className="absolute top-16 right-4 bottom-4
                   w-1/3 md:w-1/2 xl:w-1/2 flex flex-col
                   border border-gray-200 rounded-2xl shadow-sm
                   overflow-visible"
      >
        <div className="bg-white flex flex-col flex-1 overflow-y-auto p-4">
          {/* タスク追加フォーム */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex gap-2 mb-4"
          >
            <input
              {...register('title')}
              placeholder="Add a new task..."
              className="flex-1 min-w-0
                         px-3 py-2 border-2 border-gray-300
                         rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <input {...register('date')} type="hidden" />
            <button
              type="submit"
              className="flex items-center px-4 py-2
                         bg-blue-500 text-white rounded-lg
                         hover:bg-blue-600 transition"
            >
              <PlusCircle className="w-5 h-5 mr-1" />
              Add
            </button>
          </form>

          {/* バリデーションエラー */}
          {errors.title && (
            <p className="text-sm text-red-500 mb-3">
              {errors.title.message}
            </p>
          )}

          {/* タスク一覧 */}
          <ul className="space-y-2">
            {sorted.map((t) => (
              <li
                key={t.id}
                className={`flex items-center justify-between
                            px-3 py-2 rounded-md
                            hover:bg-gray-50
                            ${t.isDone ? 'bg-gray-100' : ''}`}
              >
                <label className="flex items-center space-x-3 flex-1">
                  <input
                    type="checkbox"
                    checked={t.isDone}
                    onChange={() => handleToggleDone(t.id, t.isDone)}
                    className="w-5 h-5
                               border-2 border-gray-300 rounded-sm
                               focus:ring-2 focus:ring-primary
                               hover:border-primary"
                  />
                  <span
                    className={
                      t.isDone
                        ? 'line-through text-gray-500'
                        : 'text-gray-800'
                    }
                  >
                    {t.title}
                  </span>
                </label>

                {/* 削除ボタン */}
                <button
                  onClick={() =>
                    deleteTodo.mutate({ id: t.id, date: selectedDate })
                  }
                  className="p-1 hover:bg-red-100 rounded-full transition"
                >
                  <Trash2 className="w-5 h-5 text-red-500 hover:text-red-700" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
