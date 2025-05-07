'use client';

import Header from './features/layout/Header';
import Calendar from '@/components/features/calendar/Calendar';
import FriendContainer from '@/components/features/friend/FriendContainer';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export const ClientLayout: React.FC<ClientLayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col h-screen overflow-x-hidden">
      {/* 1. ヘッダー */}
      <Header />

      {/* 2. 本文エリア: カレンダーは fixed or dropdown で表示 */}
      <div className="flex flex-1">
        {/* カレンダーサイドバー */}
        <Calendar/>

        {/* フレンド一覧 */}
        <FriendContainer />

        {/* メインコンテンツ */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};