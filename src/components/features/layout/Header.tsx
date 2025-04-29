"use client";
import { trpc } from "@utils/trpc";
import HeaderPulldown from "./HeaderPulldown";
import CalendarToggle from "./CalendarToggle";
import ChatToggle from "./ChatToggle"
import { useUiStore } from "@/src/store/useUiStore";

export default function Header() {
  const selectedDate = useUiStore((s)=> s.selectedDate);

  return (
    <header className="bg-blue-900 p-4">
      <nav className="container mx-auto flex justify-between items-center">
    
        <CalendarToggle/>
     
    
        <a href="/" className="text-white text-xl font-bold">
          {selectedDate}
          ToDo List
        </a>
        <div className="space-x-4">
         
          <HeaderPulldown />
          
        <ChatToggle/>
          
        </div>
  
      </nav>
    </header>
  );
}
