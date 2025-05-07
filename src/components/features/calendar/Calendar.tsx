'use client';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import React, { useRef } from 'react';

import type { DateClickArg } from '@fullcalendar/interaction';
import { useUiStore, UIState } from '@/store/useUiStore';

export default function calendar() {
  const sidebarOpen     = useUiStore((s: UIState) => s.sidebarOpen);
  const setSelectedDate = useUiStore((s: UIState) => s.setSelectedDate);
  const selectedDate    = useUiStore((s: UIState) => s.selectedDate); // 'YYYY-MM-DD'

  const calendarRef = useRef<FullCalendar | null>(null);
  // 日付クリック時に Zustand に保存
  const handleDateClick = (arg: DateClickArg) => {
    setSelectedDate(arg.dateStr);
  };

  // 選択セルにクラスを付与
  const dayCellClassNames = (arg: any) => {
    const d = arg.date;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const cellYmd = `${y}-${m}-${dd}`;
    return cellYmd === selectedDate ? ['my-selected-day'] : [];
  };

  return (
    <aside
      className={`
        fixed top-35 left-10 w-96 z-20 bg-white shadow-lg rounded-2xl
        overflow-hidden transform transition-all duration-300 ease-in-out
        ${sidebarOpen
          ? 'max-h-[80vh] translate-y-0 overflow-y-auto'
          : 'max-h-0 -translate-y-full'}
      `}
    >
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, interactionPlugin, listPlugin]}
        initialView="dayGridMonth"
        contentHeight="auto"
        aspectRatio={1.2}
        headerToolbar={{
          left: 'prev,next',
          center: 'title',
          right: 'today',
        }}
        dateClick={handleDateClick}
        dayCellClassNames={dayCellClassNames}
      />
    </aside>
  );
}
