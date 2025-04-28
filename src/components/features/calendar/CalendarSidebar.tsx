'use client';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';

import type {
  DateClickArg,
} from '@fullcalendar/interaction';
import { useUiStore, UIState } from '@/store/useUiStore';

/** Date → 'YYYY-MM-DD'（ローカル基準）に変換 */
const toYMD = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
};　

export default function CalendarSidebar() {
  const sidebarOpen     = useUiStore((s: UIState) => s.sidebarOpen);
  const setSelectedDate = useUiStore((s: UIState) => s.setSelectedDate);
  const selectedDate    = useUiStore((s: UIState) => s.selectedDate); // 'YYYY-MM-DD'

  /* クリックした日付 → Zustand に保存（dateStr は既に 'YYYY-MM-DD'） */
  const handleDateClick = (arg: DateClickArg) => {
    setSelectedDate(arg.dateStr);
  };

  return (
    <aside
      className={`
        fixed left-0 top-16 bottom-0 w-96 z-20
        bg-white border-r shadow-lg
        transform transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        overflow-y-auto
      `}
    >
      <FullCalendar
        key={selectedDate}
        contentHeight="auto"
        aspectRatio={1.2}
        plugins={[dayGridPlugin, interactionPlugin, listPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next',
          center: 'title',
          right: 'today',
        }}
        dateClick={handleDateClick}
        dayCellClassNames={['fc-day']}
      />
    </aside>
  );
}
