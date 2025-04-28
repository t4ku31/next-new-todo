'use client';
import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { z } from 'zod';
// フォームの入力スキーマ
const taskSchema = z.object({
    title:       z.string().min(1),
    description: z.string().optional(),
    date:        z.string(),
  });
type TaskFormData = z.infer<typeof taskSchema>;

export default function TodoContainer() {

  // 1. グローバル UI ストアから選択中の日付を取得
  const selectedDate = useUiStore((s) => s.selectedDate);

  const utils = trpc.useUtils();  

    // 3. 日付フィルタ付きでタスク一覧を取得
  const { data: todos = [], isLoading } = trpc.todo.list.useQuery(
    { date: selectedDate },
    { keepPreviousData: true }
  ); 

  // 4. 各種ミューテーション登録。成功時は一覧を再フェッチ
  const createTodo = trpc.todo.create.useMutation({
    onSuccess: () => utils.todo.list.invalidate(),
  });
  const updateTodo = trpc.todo.update.useMutation({
    onSuccess: () => utils.todo.list.invalidate(),
  });
  const deleteTodo = trpc.todo.delete.useMutation({
    onSuccess: () => utils.todo.list.invalidate(),
  });

   // 5. React Hook Form でフォームを管理。date は selectedDate が初期値
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

   // selectedDate が変わったら hidden input にセット
   useEffect(() => {
    setValue('date', selectedDate);
  }, [selectedDate, setValue]);

  const onSubmit = async (data: TaskFormData) => {
    try {
      await createTodo.mutateAsync({
        title:       data.title,
        description: data.description,
        date:        data.date,
      });
      reset(); // フォームをリセット
    } catch (e) {
      console.error('タスク作成エラー:', e);
    }
  };

   // 読み込み中はローディング表示
   if (isLoading) return <p>Loading...</p>;

   return (
    <div className="p-4">
      {/* タスク追加フォーム */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex gap-2 mb-4">
        <TextInput
          {...register('title')}
          placeholder="New task"
          className="flex-1 px-4 py-2 border rounded"
        />
        {/* 選択日付を hidden input で送信 */}
        <input {...register('date')} type="hidden" />
        <button
          type="submit"
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primaryLight"
        >
          Add
        </button>
      </form>
      {errors.title && (
        <p className="text-red-500 mb-2">{errors.title.message}</p>
      )}

      {/* タスク一覧 */}
      <ul className="space-y-2">
        {todos.map((t) => (
          <li key={t.id} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={t.done}
              onChange={(e) =>
                updateTodo.mutate({ id: t.id, done: e.target.checked })
              }
              className="w-4 h-4"
            />
            <span className={t.done ? 'line-through text-muted' : ''}>
              {t.title}
            </span>
            <button
              onClick={() => deleteTodo.mutate({ id: t.id })}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );

}