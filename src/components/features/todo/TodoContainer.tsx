// src/components/features/todo/TodoContainer.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useUiStore } from '@/store/useUiStore';
import { trpc } from '@/lib/trpcClient';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Trash2, PlusCircle } from 'lucide-react';

/* ------------------------------------------------------------------
 * validation schema & types
 * ---------------------------------------------------------------- */
const taskSchema = z.object({
  title: z.string().min(1, { message: 'タスク名を入力してください' }),
  description: z.string().optional(),
  date: z.string(),
});

export type TaskFormData = z.infer<typeof taskSchema>;

/* ------------------------------------------------------------------
 * presentation‑only components
 * ---------------------------------------------------------------- */
interface ProgressBarProps {
  completed: number;
  total: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ completed, total }) => {
  const ratio = total === 0 ? 1 : completed / total;
  const barColor = total === 0 ? 'bg-gray-300' : 'bg-blue-500';

  return (
    <div className="flex items-center justify-end mb-4 space-x-2">
      <div className="flex-1 bg-gray-200 h-1.5 rounded-full overflow-hidden">
        <div
          className={`${barColor} h-1.5 rounded-full transition-all duration-300`}
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
      <span className="text-gray-600 text-sm font-medium">
        {completed}/{total}
      </span>
    </div>
  );
};

/* ------------------------------------------------------------------
 * container component
 * ---------------------------------------------------------------- */
const TodoContainer: React.FC = () => {
  /* ------------------------------ state / store ------------------------------ */
  const selectedDate = useUiStore((s) => s.selectedDate);
  const utils = trpc.useUtils();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  /* ------------------------------ form ------------------------------ */
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: { title: '', description: '', date: selectedDate },
  });

  // keep hidden field in sync with global state
  useEffect(() => setValue('date', selectedDate), [selectedDate, setValue]);

  /* ------------------------------ queries & mutations ------------------------------ */
  const {
    data: todos = [],
    isLoading,
  } = trpc.todo.getTasksByDate.useQuery({ date: selectedDate });

  const invalidateTodoList = () => utils.todo.getTasksByDate.invalidate();

  const addTodo = trpc.todo.addTodo.useMutation({
    onSuccess: invalidateTodoList,
    onError: (e) => setErrorMessage(e.message),
  });

  const clearTodo = trpc.todo.clearTodo.useMutation({
    onSuccess: invalidateTodoList,
    onError: (e) => setErrorMessage(e.message),
  });

  const deleteTodo = trpc.todo.deleteTodo.useMutation({
    onSuccess: invalidateTodoList,
    onError: (e) => setErrorMessage(e.message),
  });

  const updateTodo = trpc.todo.updateTodo.useMutation({
    onSuccess: invalidateTodoList,
    onError: (e) => setErrorMessage(e.message),
  });

  /* ------------------------------ handlers ------------------------------ */
  const onSubmit = async (data: TaskFormData) => {
    try {
      await addTodo.mutateAsync(data);
      reset();
    } catch {
      /* エラーは onError で処理 */
    }
  };

  const toggleDone = (id: number, isDone: boolean) => {
    clearTodo.mutate({ id, date: selectedDate, isDone });
  };

  const saveTitle = (
    id: number,
    prevTitle: string,
    e: React.FocusEvent<HTMLInputElement>,
  ) => {
    const newTitle = e.target.value.trim();
    if (newTitle && newTitle !== prevTitle) {
      updateTodo.mutate({ id, todoId: id, title: newTitle });
    }
  };

  /* ------------------------------ render ------------------------------ */
  if (isLoading) return <p className="py-8 text-center">Loading…</p>;

  const sorted = [...todos].sort((a, b) => Number(a.isDone) - Number(b.isDone));
  const totalCount = sorted.length;
  const completedCount = sorted.filter((t) => t.isDone).length;

  return (
    <div className="flex h-full p-6 gap-6">
      {/* todo card */}
      <section
        className="
          w-1/2 min-w-[400px] ml-auto
          bg-white rounded-2xl shadow-lg p-6 flex flex-col
        "
      >
        {/* form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex gap-3 mb-4">
          <input
            {...register('title')}
            placeholder="Add a new task…"
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

        {/* progress */}
        <ProgressBar completed={completedCount} total={totalCount} />

        {/* messages */}
        {errorMessage && <p className="mb-4 text-sm text-red-500">{errorMessage}</p>}
        {errors.title && (
          <p className="mb-4 text-sm text-red-500">{errors.title.message}</p>
        )}

        {/* list */}
        <ul className="space-y-4 overflow-y-auto">
          {sorted.map((task) => (
            <li
              key={task.id}
              className={`flex items-center justify-between p-4 border border-gray-100 rounded-xl ${
                task.isDone ? 'bg-gray-50' : 'bg-white'
              }`}
            >
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={task.isDone}
                  onChange={() => toggleDone(task.id, task.isDone)}
                  className={`h-5 w-5 border-4 rounded-md transition-colors duration-200 ${
                    task.isDone ? 'bg-blue-600 border-blue-600' : 'border-gray-300 hover:border-blue-500'
                  }`}
                />
                <input
                  type="text"
                  defaultValue={task.title}
                  onBlur={(e) => saveTitle(task.id, task.title, e)}
                  onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                  className={`ml-4 w-full bg-transparent border-none focus:outline-none transition-colors ${
                    task.isDone ? 'line-through text-gray-400' : 'text-gray-800'
                  }`}
                />
              </label>
              <button
                onClick={() => deleteTodo.mutate({ id: task.id, date: selectedDate })}
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
};

export default TodoContainer;
