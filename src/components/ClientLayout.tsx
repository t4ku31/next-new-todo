'use client';

import Header from './features/layout/Header';
import { useUiStore } from '@/store/useUiStore';
import Calendar from '@/components/features/calendar/CalendarSidebar';

export const ClientLayout:React.FC<{children:React.ReactNode}> =({children})=>{
    const sidebarOpen = useUiStore(s => s.sidebarOpen);

    return(
        <div className="overflow-x-hidden">
        <Header />
        <div className="flex">
            <Calendar />    
            <main className={`
                flex-1 transition-all duration-300
                ${sidebarOpen ? 'ml-80' : 'ml-0'}
                p-6
            `}>  
            {children}
            </main>
        </div>
    </div>
   );
}