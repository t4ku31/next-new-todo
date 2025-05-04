'use client';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { trpc } from '@/lib/trpcClient';


interface FriendTodoContainerProps {
    otherUserId: number;
    otherUsername: string;
}

export default function FriendTodoContainer({
    otherUserId,
    otherUsername,
}: FriendTodoContainerProps) {
    console.log("FriendTodoContainer", otherUserId, otherUsername);
    const { data: todos=[], isLoading, error } = trpc.todo.getTodoByUserId.useQuery({
        userId: otherUserId,
        targetDate: new Date().toISOString().split("T")[0],
    });

    const sortedTodos = [...todos].sort((a, b) => {
        return (a.isDone ? 1 : 0) - (b.isDone ? 1 : 0);
      });

    if (isLoading) return <p className="text-gray-600">ロード中…</p>;
    if (error)     return <p className="text-red-500">エラーが発生しました</p>;

    return (
        <>
        <header className="relative flex items-center justify-center px-4 py-2 bg-blue-600 border-b">
            <Link href={`/`}>
                <button className="absolute top-1 left-4 text-white hover:text-gray-800">
                    <ArrowLeft className="w-9 h-9" />
                </button>
            </Link>
            <h2 className="text-lg font-medium text-white">{otherUsername} Todo</h2>
        </header>

        <div className="p-4">
        <ul className="space-y-2">
            {sortedTodos.length > 0 ?
                sortedTodos.map((todo) => (
                <li 
                    key={todo.id}
                    className={`
                        flex items-center gap-2 p-2 rounded
                        ${todo.isDone ? 'bg-gray-100' : ''}
                    `}
                >
                   <input
                        type="checkbox"
                        checked={todo.isDone}
                        disabled
                        className="w-4 h-4"
                    />
                   <span className={todo.isDone ? 'line-through text-gray-500' : ''}>
                        {todo.title}
                    </span>
                </li>
            )):
            <p>Todoがありません</p>
        }

        </ul>
        </div>
        </>
    );
}