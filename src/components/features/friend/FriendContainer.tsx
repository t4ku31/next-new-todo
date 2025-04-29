"use client";
// FriendContainer.tsx
import React from 'react';
import FriendRequest from '@/components/features/friend/FriendRequest';
import FriendsContainer from '@/components/features/friend/FriendsContainer';
import { useUiStore } from '@/store/useUiStore';
const FriendContainer: React.FC = () => {
  
  const bar = useUiStore((s) => s.friendbarOpen);
  return (

  <aside
  className={`
    fixed right-0 top-16 bottom-0 w-96 z-20
    bg-white border-l shadow-lg
    transform transition-transform duration-300
    ${bar ? 'translate-x-0' : 'translate-x-full'}
    overflow-y-auto
  `}
>
    
    <div className="p-6 space-y-6 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">FRIENDS</h1>
        <a
          href="/search"
          className="inline-flex
                     items-center 
                     px-4 py-2 
                     bg-blue-600
                     hover:bg-blue-500 
                     text-white 
                     font-semibold 
                     uppercase 
                     text-sm 
                     rounded 
                     transition"
        >
          <span className="mr-2 text-xl">＋</span>
          Add Friend
        </a>
      </div>
      {/* Friends list and incoming requests */}
      <FriendsContainer />
      <FriendRequest />
    </div>
    </aside>
  );
};

export default FriendContainer;
