"use client";
import HeaderPulldown from "./HeaderPulldown";
import CalendarToggle from "./CalendarToggle";
import FriendToggle from "./FriendToggle"
import { useUiStore } from "@/store/useUiStore";

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
          
        <FriendToggle/>
          
        </div>
  
      </nav>
    </header>
  );
}
