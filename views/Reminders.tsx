
import React, { useState } from 'react';
import { Reminder } from '../types';

interface RemindersProps {
  reminders: Reminder[];
  onAddReminder: (reminder: Reminder) => void;
  onToggleReminder: (id: string) => void;
}

export const Reminders: React.FC<RemindersProps> = ({ reminders, onAddReminder, onToggleReminder }) => {
  const [activeTab, setActiveTab] = useState<'short-term' | 'long-term'>('short-term');
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  
  // Time Picker State
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const [selectedTimeDisplay, setSelectedTimeDisplay] = useState(''); // What shows in input
  const [pickerHour, setPickerHour] = useState(9);
  const [pickerMinute, setPickerMinute] = useState(0);
  const [pickerAmPm, setPickerAmPm] = useState<'AM' | 'PM'>('AM');

  const filteredReminders = reminders.filter(r => r.type === activeTab);

  const formatTime = (h: number, m: number, ap: string) => {
    return `${h}:${m.toString().padStart(2, '0')} ${ap}`;
  };

  const handleTimePickerDone = () => {
    const timeStr = formatTime(pickerHour, pickerMinute, pickerAmPm);
    setSelectedTimeDisplay(timeStr);
    setIsTimePickerOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTitle && selectedTimeDisplay) {
        onAddReminder({
            id: `r-${Date.now()}`,
            title: newTitle,
            dueTime: selectedTimeDisplay,
            type: activeTab,
            completed: false
        });
        setNewTitle('');
        setSelectedTimeDisplay('');
        // Reset picker defaults
        setPickerHour(9);
        setPickerMinute(0);
        setPickerAmPm('AM');
        setIsAdding(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
      {/* Sticky Header - Standardized */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-xl px-6 py-4 flex flex-col gap-4 border-b border-border/50 transition-all">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-foreground leading-none">Reminders</h1>
                <p className="text-sm font-semibold text-muted-foreground mt-1">Scheduled Tasks</p>
            </div>
        </div>
        
        <div className="flex p-1.5 bg-secondary rounded-xl">
            <button 
                onClick={() => setActiveTab('short-term')}
                className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'short-term' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
                Daily
            </button>
            <button 
                onClick={() => setActiveTab('long-term')}
                className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'long-term' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
                Long Term
            </button>
        </div>
      </div>

      <main className="px-6 pb-32 pt-8 flex flex-col gap-5 max-w-xl mx-auto w-full">
          
          {/* Active Reminders List */}
          {filteredReminders.map(reminder => (
              <div 
                key={reminder.id}
                onClick={() => onToggleReminder(reminder.id)}
                className={`flex items-center gap-5 p-5 rounded-2xl border transition-all duration-500 cursor-pointer ${reminder.completed ? 'bg-secondary/30 border-transparent opacity-0 scale-95 h-0 overflow-hidden py-0 my-0' : 'bg-card border-border shadow-sm hover:border-primary/40'}`}
              >
                  <div className={`size-7 rounded-full border-2 flex items-center justify-center transition-colors ${reminder.completed ? 'bg-primary border-primary' : 'border-muted-foreground/30'}`}>
                      {reminder.completed && <span className="material-symbols-outlined text-sm text-primary-foreground font-bold">check</span>}
                  </div>
                  <div className="flex-1">
                      <p className={`font-bold text-base ${reminder.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{reminder.title}</p>
                      <div className="flex items-center gap-1.5 mt-1 text-xs font-bold text-muted-foreground uppercase tracking-wide">
                          <span className="material-symbols-outlined text-sm">alarm</span>
                          {reminder.dueTime}
                      </div>
                  </div>
              </div>
          ))}
          
          {filteredReminders.length === 0 && !isAdding && (
             <div className="text-center py-10 text-muted-foreground italic text-sm">
                 No active reminders.
             </div>
          )}

          {/* Add Reminder Form */}
          {isAdding ? (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6 bg-secondary/20 border border-dashed border-primary/30 rounded-3xl animate-in zoom-in-95 duration-200">
                  <input 
                    autoFocus
                    type="text" 
                    placeholder="Reminder title..." 
                    className="bg-transparent border-b border-border p-2 outline-none font-bold text-lg placeholder:font-normal placeholder:text-muted-foreground/50"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                  />
                  <div className="flex gap-3">
                      {/* Custom Time Input Trigger */}
                      <div 
                        onClick={() => setIsTimePickerOpen(true)}
                        className="bg-background rounded-xl border border-border px-4 py-3 text-sm font-bold cursor-pointer hover:border-primary focus:ring-1 focus:ring-primary min-w-[120px] flex items-center justify-center"
                      >
                         {selectedTimeDisplay || <span className="text-muted-foreground font-normal">Pick Time</span>}
                      </div>

                      <div className="flex-1 flex justify-end gap-3">
                          <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-3 text-xs font-bold uppercase hover:bg-secondary rounded-xl transition-colors">Cancel</button>
                          <button type="submit" className="px-6 py-3 bg-primary text-primary-foreground text-xs font-bold uppercase rounded-xl shadow-md hover:brightness-110 active:scale-95 transition-all">Set</button>
                      </div>
                  </div>
              </form>
          ) : (
            <button 
                onClick={() => setIsAdding(true)}
                className="flex items-center justify-center gap-3 p-5 rounded-[1.5rem] border border-dashed border-border text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-secondary/20 transition-all font-bold group"
            >
                <span className="material-symbols-outlined group-hover:scale-110 transition-transform">add_alert</span>
                Add Reminder
            </button>
          )}

      </main>

      {/* CUSTOM CLOCK SLIDER MODAL */}
      {isTimePickerOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <div className="absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity" onClick={() => setIsTimePickerOpen(false)}></div>
             <div className="relative bg-card border border-border rounded-[2.5rem] w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200 p-8 flex flex-col gap-8">
                 <div className="text-center space-y-2">
                     <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Set Time</h3>
                     <div className="text-6xl font-black tabular-nums tracking-tight text-foreground flex justify-center items-baseline gap-1">
                         <span>{pickerHour}</span>
                         <span className="animate-pulse text-muted-foreground">:</span>
                         <span>{pickerMinute.toString().padStart(2, '0')}</span>
                         <span className="text-xl font-bold ml-2 text-primary uppercase">{pickerAmPm}</span>
                     </div>
                 </div>

                 {/* Sliders */}
                 <div className="flex flex-col gap-6">
                     <div className="flex flex-col gap-3">
                         <div className="flex justify-between text-xs font-bold text-muted-foreground uppercase">
                             <span>Hour</span>
                             <span>{pickerHour}</span>
                         </div>
                         {(() => {
                             const min = 1;
                             const max = 12;
                             const percentage = ((pickerHour - min) * 100) / (max - min);
                             return (
                                 <input 
                                    type="range" 
                                    min={min} 
                                    max={max} 
                                    value={pickerHour}
                                    onChange={(e) => setPickerHour(Number(e.target.value))}
                                    className="w-full accent-primary h-4 bg-secondary rounded-full appearance-none cursor-pointer"
                                    style={{
                                        background: `linear-gradient(to right, hsl(var(--primary)) ${percentage}%, hsl(var(--secondary)) ${percentage}%)`
                                    }}
                                 />
                             );
                         })()}
                     </div>
                     <div className="flex flex-col gap-3">
                         <div className="flex justify-between text-xs font-bold text-muted-foreground uppercase">
                             <span>Minute</span>
                             <span>{pickerMinute.toString().padStart(2, '0')}</span>
                         </div>
                         {(() => {
                             const min = 0;
                             const max = 59;
                             const percentage = ((pickerMinute - min) * 100) / (max - min);
                             return (
                                 <input 
                                    type="range" 
                                    min={min} 
                                    max={max} 
                                    step="5"
                                    value={pickerMinute}
                                    onChange={(e) => setPickerMinute(Number(e.target.value))}
                                    className="w-full accent-primary h-4 bg-secondary rounded-full appearance-none cursor-pointer"
                                    style={{
                                        background: `linear-gradient(to right, hsl(var(--primary)) ${percentage}%, hsl(var(--secondary)) ${percentage}%)`
                                    }}
                                 />
                             );
                         })()}
                     </div>
                 </div>

                 {/* AM/PM Toggle */}
                 <div className="grid grid-cols-2 gap-2 p-1 bg-secondary rounded-xl">
                     <button 
                        onClick={() => setPickerAmPm('AM')}
                        className={`py-3 rounded-lg font-bold text-sm transition-all ${pickerAmPm === 'AM' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                     >
                         AM
                     </button>
                     <button 
                        onClick={() => setPickerAmPm('PM')}
                        className={`py-3 rounded-lg font-bold text-sm transition-all ${pickerAmPm === 'PM' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                     >
                         PM
                     </button>
                 </div>

                 <button 
                    onClick={handleTimePickerDone}
                    className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold uppercase tracking-widest text-sm hover:brightness-110 active:scale-95 transition-all shadow-lg"
                 >
                     Done
                 </button>
             </div>
         </div>
      )}
    </div>
  );
};
