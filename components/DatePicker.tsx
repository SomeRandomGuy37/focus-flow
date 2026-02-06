
import React, { useState } from 'react';

interface DatePickerProps {
  selectedDate: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  onClose: () => void;
}

export const DatePicker: React.FC<DatePickerProps> = ({ selectedDate, onChange, onClose }) => {
  // Parse initial date or default to today
  const initialDate = selectedDate ? new Date(selectedDate + 'T00:00:00') : new Date();
  
  const [viewDate, setViewDate] = useState(initialDate); // For navigating months
  
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDay = new Date(year, month, 1).getDay();

  const handleDayClick = (day: number) => {
    const newDate = new Date(year, month, day);
    // Format YYYY-MM-DD manually to avoid timezone issues
    const y = newDate.getFullYear();
    const m = String(newDate.getMonth() + 1).padStart(2, '0');
    const d = String(newDate.getDate()).padStart(2, '0');
    onChange(`${y}-${m}-${d}`);
    onClose();
  };

  const changeMonth = (delta: number) => {
    const newDate = new Date(year, month + delta, 1);
    setViewDate(newDate);
  };

  const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose} />
      
      <div className="relative bg-card border border-border rounded-3xl shadow-2xl p-6 w-full max-w-sm animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-6">
            <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-secondary rounded-full transition-colors">
                <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            <h3 className="font-bold text-lg">{monthNames[month]} {year}</h3>
            <button onClick={() => changeMonth(1)} className="p-2 hover:bg-secondary rounded-full transition-colors">
                <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
            {['S','M','T','W','T','F','S'].map(d => (
                <div key={d} className="text-center text-xs font-bold text-muted-foreground">{d}</div>
            ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: startDay }).map((_, i) => (
                <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const isSelected = selectedDate === `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
                
                return (
                    <button
                        key={day}
                        onClick={() => handleDayClick(day)}
                        className={`aspect-square rounded-xl text-sm font-bold transition-all duration-200
                            ${isSelected ? 'bg-primary text-primary-foreground shadow-lg scale-105' : 'hover:bg-secondary text-foreground'}
                            ${!isSelected && isToday ? 'border border-primary text-primary' : ''}
                        `}
                    >
                        {day}
                    </button>
                );
            })}
        </div>
        
        <div className="mt-6 flex justify-end">
            <button onClick={onClose} className="text-xs font-bold uppercase text-muted-foreground hover:text-foreground transition-colors">
                Cancel
            </button>
        </div>
      </div>
    </div>
  );
};
