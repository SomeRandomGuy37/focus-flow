
import React from 'react';
import { DailyLog } from '../types';

interface CalendarProps {
  logs: DailyLog[];
}

export const Calendar: React.FC<CalendarProps> = ({ logs }) => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth(); // 0 = Jan

  // Get number of days in the month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  // Get the day of the week the month starts on (0 = Sun, 1 = Mon, etc.)
  const startDay = new Date(year, month, 1).getDay();

  // Generate array for the days
  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    // Format date string to match log format YYYY-MM-DD
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return {
      day,
      dateStr,
      dateObj: new Date(year, month, day)
    };
  });

  const getIntensity = (seconds: number) => {
    const hours = seconds / 3600;
    if (hours === 0) return 'bg-secondary/50';
    if (hours < 2) return 'bg-primary/20';
    if (hours < 4) return 'bg-primary/40';
    if (hours < 6) return 'bg-primary/60';
    return 'bg-primary';
  };
  
  const formatTimeShort = (secs: number) => {
    if (!secs) return null;
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    
    if (h > 0 && m > 0) return `${h}h ${m}m`;
    if (h > 0) return `${h}h`;
    return `${m}m`;
  };
  
  const monthName = today.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="flex flex-col gap-4 w-full">
        <div className="flex justify-between items-center px-1">
             <h3 className="text-sm font-bold text-foreground capitalize">{monthName}</h3>
             <div className="flex gap-1 text-[9px] font-bold uppercase text-muted-foreground">
                 <span>Less</span>
                 <div className="flex gap-0.5 items-center">
                     <div className="size-2 rounded-sm bg-secondary/50"></div>
                     <div className="size-2 rounded-sm bg-primary/40"></div>
                     <div className="size-2 rounded-sm bg-primary"></div>
                 </div>
                 <span>More</span>
             </div>
        </div>
        <div className="grid grid-cols-7 gap-2">
            {['S','M','T','W','T','F','S'].map((d, i) => (
                <div key={i} className="text-center text-[10px] font-bold text-muted-foreground pb-1">{d}</div>
            ))}
            
            {/* Empty slots for padding start of month */}
            {Array.from({ length: startDay }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square"></div>
            ))}

            {calendarDays.map((dayObj) => {
                const log = logs.find(l => l.date === dayObj.dateStr);
                const seconds = log ? log.seconds : 0;
                const timeString = formatTimeShort(seconds);
                
                // Check if it's today to add a ring or special marker
                const isToday = dayObj.day === today.getDate();

                return (
                    <div key={dayObj.day} className="aspect-square flex flex-col items-center justify-center relative group cursor-default">
                        <div className={`size-full rounded-md transition-all duration-300 flex flex-col items-center justify-center text-[10px] font-medium relative ${getIntensity(seconds)} ${isToday ? 'ring-2 ring-foreground ring-offset-2 ring-offset-background' : ''}`}>
                             <span className={seconds > 0 || isToday ? 'text-foreground font-bold' : 'text-transparent group-hover:text-foreground/50'}>{dayObj.day}</span>
                             {timeString && (
                                <span className="text-[7px] leading-none font-bold text-foreground/90 mt-0.5">{timeString}</span>
                             )}
                        </div>
                        <div className="absolute opacity-0 group-hover:opacity-100 bottom-full mb-2 bg-popover text-popover-foreground text-[10px] font-bold px-2 py-1 rounded shadow-xl border border-border whitespace-nowrap z-10 pointer-events-none transition-opacity">
                            {dayObj.dateObj.toLocaleDateString(undefined, {month:'short', day:'numeric'})}: {(seconds/3600).toFixed(1)}h
                        </div>
                    </div>
                )
            })}
        </div>
    </div>
  );
};
